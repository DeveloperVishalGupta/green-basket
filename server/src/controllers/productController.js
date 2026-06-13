import streamifier from 'streamifier';
import { cloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import Product from '../models/Product.js';

/**
 * Upload buffer to Cloudinary using stream
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result
 */
const uploadBufferToCloudinary = (buffer, folder = 'iqra-fashion/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Product Controller
 * Handles all product-related CRUD operations
 */
class ProductController {
  /**
   * Get all products with pagination and filtering
   * @route GET /api/products
   * @access Public
   */
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        sort = '-createdAt',
        search,
        isFeatured,
        isActive,
      } = req.query;

      // Build query
      // Only filter by isActive for public access, admin can see all
      const query = {};
      
      // If isActive is explicitly provided, use it
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      } else if (!req.user || req.user.role !== 'admin') {
        // For non-admin users, only show active products
        query.isActive = true;
      }

      if (category) {
        query.category = category;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured === 'true';
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .populate('category', 'name slug')
          .lean(),
        Product.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  /**
   * Get single product by slug
   * @route GET /api/products/:slug
   * @access Public
   */
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;

      const product = await Product.findOne({ slug, isActive: true });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }

  /**
   * Get product by ID
   * @route GET /api/products/id/:id
   * @access Public
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }

  /**
   * Create new product
   * @route POST /api/products
   * @access Private (Admin/Vendor)
   */
  async createProduct(req, res) {
    try {
      let images = [];

      // Check if this is a clone operation with existing image URLs
      if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
        // For cloning: Use existing image URLs
        images = req.body.images.map(img => ({
          url: img.url || img,
          publicId: img.publicId || '',
          alt: img.alt || req.body.name || 'Product image',
        }));
      } else if (req.files && req.files.length > 0) {
        // For new products: Upload files to Cloudinary
        const uploadPromises = req.files.map(file => 
          uploadBufferToCloudinary(file.buffer)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        
        images = uploadResults.map(result => ({
          url: result.url,
          publicId: result.publicId,
          alt: req.body.name || 'Product image',
        }));
      } else {
        // No images provided at all
        return res.status(400).json({
          success: false,
          message: 'At least one product image is required'
        });
      }

      // Clean array fields - ensure they are proper arrays not stringified
      // Handle both JSON.stringified arrays (from FormData) and proper arrays (from JSON body)
      const parseArrayField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field.filter(item => item && typeof item === 'string' && item.trim());
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'string' && item.trim()) : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const cleanData = {
        ...req.body,
        sizes: parseArrayField(req.body.sizes),
        colors: parseArrayField(req.body.colors),
        tags: parseArrayField(req.body.tags),
      };

      // Remove images from body data as we're handling it separately
      delete cleanData.images;

      const productData = {
        ...cleanData,
        images,
        vendor: req.user.id,
      };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  }

  /**
   * Update product
   * @route PUT /api/products/:id
   * @access Private (Admin/Vendor - owner only)
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      let product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if user is owner or admin
      if (
        product.vendor.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this product',
        });
      }

      // Handle new image uploads if provided
      if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary (if they have publicId)
        const oldImagesWithPublicId = product.images.filter(img => img.publicId);
        if (oldImagesWithPublicId.length > 0) {
          const publicIds = oldImagesWithPublicId.map(img => img.publicId);
          try {
            await deleteFromCloudinary(publicIds[0]); // Delete first one as example
            // For bulk delete: await deleteMultipleFromCloudinary(publicIds);
          } catch (error) {
            console.error('Failed to delete old images:', error);
          }
        }

        // Upload new images to Cloudinary
        const uploadPromises = req.files.map(file => 
          uploadBufferToCloudinary(file.buffer)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        
        req.body.images = uploadResults.map(result => ({
          url: result.url,
          publicId: result.publicId,
          alt: req.body.name || product.name,
        }));
      }

      // Clean array fields - ensure they are proper arrays not stringified
      const updateData = {
        ...req.body,
        sizes: req.body.sizes ? 
          (Array.isArray(req.body.sizes) ? req.body.sizes.filter(s => s && s.trim()) : []) 
          : product.sizes,
        colors: req.body.colors ? 
          (Array.isArray(req.body.colors) ? req.body.colors.filter(c => c && c.trim()) : []) 
          : product.colors,
        tags: req.body.tags ? 
          (Array.isArray(req.body.tags) ? req.body.tags.filter(t => t && t.trim()) : []) 
          : product.tags,
      };

      product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  /**
   * Delete product
   * @route DELETE /api/products/:id
   * @access Private (Admin only)
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if product is already inactive
      if (!product.isActive) {
        // HARD DELETE - Product is inactive, delete permanently
        
        // Delete images from Cloudinary before deleting product
        const imagesWithPublicId = product.images.filter(img => img.publicId);
        if (imagesWithPublicId.length > 0) {
          const publicIds = imagesWithPublicId.map(img => img.publicId);
          try {
            // Delete images from Cloudinary
            for (const publicId of publicIds) {
              await deleteFromCloudinary(publicId);
            }
          } catch (error) {
            console.error('Failed to delete images from Cloudinary:', error);
            // Continue with product deletion even if image deletion fails
          }
        }
        
        // Permanently delete from database
        await Product.findByIdAndDelete(id);
        
        res.json({
          success: true,
          message: 'Product permanently deleted from database',
          permanent: true,
        });
      } else {
        // SOFT DELETE - Product is active, just mark as inactive
        product.isActive = false;
        await product.save();
        
        res.json({
          success: true,
          message: 'Product moved to inactive status',
          permanent: false,
        });
      }
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }

  /**
   * Toggle product featured status
   * @route PUT /api/products/:id/featured
   * @access Private (Admin only)
   */
  async toggleFeatured(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      product.isFeatured = !product.isFeatured;
      await product.save();

      res.json({
        success: true,
        message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
        data: product,
      });
    } catch (error) {
      console.error('Toggle featured error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle featured status',
        error: error.message,
      });
    }
  }

  /**
   * Get all unique product options (sizes, colors, tags)
   * @route GET /api/products/options/all
   * @access Private (Admin/Vendor)
   */
  async getProductOptions(req, res) {
    try {
      // Aggregate all unique sizes, colors, and tags from all products
      const products = await Product.find({}).select('sizes colors tags').lean();

      const sizes = new Set();
      const colors = new Set();
      const tags = new Set();

      products.forEach(product => {
        if (product.sizes && Array.isArray(product.sizes)) {
          product.sizes.forEach(size => sizes.add(size));
        }
        if (product.colors && Array.isArray(product.colors)) {
          product.colors.forEach(color => colors.add(color));
        }
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tags.add(tag));
        }
      });

      res.json({
        success: true,
        data: {
          sizes: Array.from(sizes).sort(),
          colors: Array.from(colors).sort(),
          tags: Array.from(tags).sort(),
        },
      });
    } catch (error) {
      console.error('Get product options error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product options',
        error: error.message,
      });
    }
  }
}

export default new ProductController();
