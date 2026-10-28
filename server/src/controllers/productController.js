import streamifier from "streamifier";
import { cloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import Product from "../models/Product.js";

/**
 * Upload buffer to Cloudinary using stream
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result
 */
const uploadBufferToCloudinary = (buffer, folder = "apna-bazaar/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto:good" },
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
      },
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
        limit = 10,
        category,
        minPrice,
        maxPrice,
        sort = "-createdAt",
        search,
        isFeatured,
        isActive,
        vendor,
        isOrganic,
        isSeasonal,
        isBestSeller,
        stockStatus,
      } = req.query;

      const query = {};

      // Active filter
      // if (isActive !== undefined) {
      //   query.isActive = isActive === "true";
      // } else if (!req.user || req.user.role !== "admin") {
      //   query.isActive = true;
      // }
      if (isActive === "true" || isActive === "false") {
        query.isActive = isActive === "true";
      }

      // Category filter
      if (category) {
        query.categories = category;
      }

      // Vendor filter
      if (vendor) {
        query.vendor = vendor;
      }

      // Featured filter
      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured === "true";
      }

      // Organic filter
      if (isOrganic !== undefined) {
        query.isOrganic = isOrganic === "true";
      }

      // Seasonal filter
      if (isSeasonal !== undefined) {
        const month = new Date().getMonth() + 1;
        const inSeason = {
          $or: [
            {
              $expr: { $lte: ["$seasonStartMonth", "$seasonEndMonth"] },
              seasonStartMonth: { $lte: month },
              seasonEndMonth: { $gte: month },
            },
            {
              $expr: { $gt: ["$seasonStartMonth", "$seasonEndMonth"] },
              $or: [
                { seasonStartMonth: { $lte: month } },
                { seasonEndMonth: { $gte: month } },
              ],
            },
          ],
        };
        query.$and = [
          ...(query.$and || []),
          isSeasonal === "true" ? inSeason : { $nor: [inSeason] },
        ];
      }

      // Best Seller filter
      if (isBestSeller !== undefined) {
        query.isBestSeller = isBestSeller === "true";
      }

      // Stock filter
      if (stockStatus === "inStock") {
        query.stock = { $gt: 0 };
      }

      if (stockStatus === "outOfStock") {
        query.stock = 0;
      }

      // Price filter (checks if at least one variant falls in range)
      if (minPrice || maxPrice) {
        query.variants = {
          $elemMatch: {},
        };

        if (minPrice) {
          query.variants.$elemMatch.price = {
            ...query.variants.$elemMatch.price,
            $gte: Number(minPrice),
          };
        }

        if (maxPrice) {
          query.variants.$elemMatch.price = {
            ...query.variants.$elemMatch.price,
            $lte: Number(maxPrice),
          };
        }
      }

      // Search filter
      if (search) {
        query.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
          {
            slug: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const [products, total] = await Promise.all([
        Product.find(query).sort(sort).skip(skip).limit(limitNumber).lean(),

        Product.countDocuments(query),
      ]);
      console.log({ products });

      return res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1,
        },
      });
    } catch (error) {
      console.error("Get products error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
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
      const query = { slug };
      if (!req.user || req.user.role !== "admin") {
        query.isActive = true;
      }
      const product = await Product.findOne(query);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
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
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
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

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one product image is required",
        });
      }

      // Upload Images
      const uploadResults = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer)),
      );

      images = uploadResults.map((result) => ({
        url: result.url,
        publicId: result.publicId,
        alt: req.body.name || "Product Image",
      }));

      // Parse variants if multipart/form-data
      let variants = req.body.variants;

      if (typeof variants === "string") {
        variants = JSON.parse(variants);
      }

      // Parse approxWeight if multipart/form-data
      let approxWeight = req.body.approxWeight;

      if (approxWeight && typeof approxWeight === "string") {
        approxWeight = JSON.parse(approxWeight);
      }

      // Parse healthBenefits if multipart/form-data
      let healthBenefits = req.body.healthBenefits;

      if (healthBenefits && typeof healthBenefits === "string") {
        healthBenefits = JSON.parse(healthBenefits);
      }

      const productData = {
        name: req.body.name,
        description: req.body.description,

        categories: req.body.categories,

        stock: req.body.stock,
        stockUnit: req.body.stockUnit,

        sellingType: req.body.sellingType,

        variants,

        approxWeight,

        vendor: req.user.id,

        isOrganic: req.body.isOrganic ?? false,
        seasonStartMonth: req.body.seasonStartMonth ?? undefined,
        seasonEndMonth: req.body.seasonEndMonth ?? undefined,
        isBestSeller: req.body.isBestSeller ?? false,

        storageInstructions: req.body.storageInstructions,

        healthBenefits,

        isActive: req.body.isActive ?? true,
        isFeatured: req.body.isFeatured ?? false,

        trackInventory: req.body.trackInventory ?? true,

        sku: req.body.sku,

        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,

        images,
      };

      const product = await Product.create(productData);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Create product error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
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
          message: "Product not found",
        });
      }

      // Authorization
      if (
        product.vendor.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this product",
        });
      }

      const updateData = {};

      // Basic Fields
      if (req.body.name !== undefined) updateData.name = req.body.name;

      if (req.body.description !== undefined)
        updateData.description = req.body.description;

      // Categories
      if (req.body.categories !== undefined) {
        updateData.categories =
          typeof req.body.categories === "string"
            ? JSON.parse(req.body.categories)
            : req.body.categories;
      }

      // Inventory
      if (req.body.stock !== undefined)
        updateData.stock = Number(req.body.stock);

      if (req.body.stockUnit !== undefined)
        updateData.stockUnit = req.body.stockUnit;

      if (req.body.sellingType !== undefined)
        updateData.sellingType = req.body.sellingType;

      if (req.body.trackInventory !== undefined) {
        updateData.trackInventory =
          req.body.trackInventory === true ||
          req.body.trackInventory === "true";
      }

      // Variants
      if (req.body.variants !== undefined) {
        const variants =
          typeof req.body.variants === "string"
            ? JSON.parse(req.body.variants)
            : req.body.variants;

        const defaultVariants = variants.filter((variant) => variant.isDefault);

        if (defaultVariants.length > 1) {
          return res.status(400).json({
            success: false,
            message: "Only one variant can be marked as default",
          });
        }

        updateData.variants = variants;
      }

      // Approx Weight
      if (req.body.approxWeight !== undefined) {
        updateData.approxWeight =
          typeof req.body.approxWeight === "string"
            ? JSON.parse(req.body.approxWeight)
            : req.body.approxWeight;
      }

      // Health Benefits
      if (req.body.healthBenefits !== undefined) {
        updateData.healthBenefits =
          typeof req.body.healthBenefits === "string"
            ? JSON.parse(req.body.healthBenefits)
            : req.body.healthBenefits;
      }

      // Text Fields
      if (req.body.storageInstructions !== undefined)
        updateData.storageInstructions = req.body.storageInstructions;

      if (req.body.sku !== undefined) updateData.sku = req.body.sku;

      if (req.body.metaTitle !== undefined)
        updateData.metaTitle = req.body.metaTitle;

      if (req.body.metaDescription !== undefined)
        updateData.metaDescription = req.body.metaDescription;

      // Flags
      if (req.body.isOrganic !== undefined) {
        updateData.isOrganic =
          req.body.isOrganic === true || req.body.isOrganic === "true";
      }

      if (req.body.seasonStartMonth !== undefined) {
        updateData.seasonStartMonth = req.body.seasonStartMonth;
      }

      if (req.body.seasonEndMonth !== undefined) {
        updateData.seasonEndMonth = req.body.seasonEndMonth;
      }

      if (req.body.isBestSeller !== undefined) {
        updateData.isBestSeller =
          req.body.isBestSeller === true || req.body.isBestSeller === "true";
      }

      if (req.body.isFeatured !== undefined) {
        updateData.isFeatured =
          req.body.isFeatured === true || req.body.isFeatured === "true";
      }

      if (req.body.isActive !== undefined) {
        updateData.isActive =
          req.body.isActive === true || req.body.isActive === "true";
      }

      // Images
      if (req.files && req.files.length > 0) {
        // Delete existing images
        for (const image of product.images || []) {
          if (image.publicId) {
            try {
              await deleteFromCloudinary(image.publicId);
            } catch (err) {
              console.error("Cloudinary delete error:", err.message);
            }
          }
        }

        const uploadedImages = await Promise.all(
          req.files.map((file) => uploadBufferToCloudinary(file.buffer)),
        );

        updateData.images = uploadedImages.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          alt: updateData.name || product.name,
        }));
      }

      product = await Product.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      console.error("Update product error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
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
          message: "Product not found",
        });
      }

      // Check if product is already inactive
      if (!product.isActive) {
        // HARD DELETE - Product is inactive, delete permanently

        // Delete images from Cloudinary before deleting product
        const imagesWithPublicId = product.images.filter((img) => img.publicId);
        if (imagesWithPublicId.length > 0) {
          const publicIds = imagesWithPublicId.map((img) => img.publicId);
          try {
            // Delete images from Cloudinary
            for (const publicId of publicIds) {
              await deleteFromCloudinary(publicId);
            }
          } catch (error) {
            console.error("Failed to delete images from Cloudinary:", error);
            // Continue with product deletion even if image deletion fails
          }
        }

        // Permanently delete from database
        await Product.findByIdAndDelete(id);

        res.json({
          success: true,
          message: "Product permanently deleted from database",
          permanent: true,
        });
      } else {
        // SOFT DELETE - Product is active, just mark as inactive
        product.isActive = false;
        await product.save();

        res.json({
          success: true,
          message: "Product moved to inactive status",
          permanent: false,
        });
      }
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
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
          message: "Product not found",
        });
      }

      product.isFeatured = !product.isFeatured;
      await product.save();

      res.json({
        success: true,
        message: `Product ${product.isFeatured ? "featured" : "unfeatured"} successfully`,
        data: product,
      });
    } catch (error) {
      console.error("Toggle featured error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle featured status",
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
      const products = await Product.find({})
        .select("healthBenefits stockUnit sellingType")
        .lean();

      const productBenefits = new Set();
      const stockUnits = new Set();
      const sellingTypes = new Set();

      products.forEach((product) => {
        // Product Benefits
        if (product.healthBenefits && Array.isArray(product.healthBenefits)) {
          product.healthBenefits.forEach((benefit) => {
            if (benefit?.trim()) {
              productBenefits.add(benefit.trim());
            }
          });
        }

        // Stock Units
        if (product.stockUnit) {
          stockUnits.add(product.stockUnit);
        }

        // Selling Types
        if (product.sellingType) {
          sellingTypes.add(product.sellingType);
        }
      });

      return res.status(200).json({
        success: true,
        data: [
          {
            name: "Product Benefits",
            key: "productBenefits",
            options: Array.from(productBenefits).sort(),
          },
          {
            name: "Stock Units",
            key: "stockUnits",
            options: Array.from(stockUnits).sort(),
          },
          {
            name: "Selling Types",
            key: "sellingTypes",
            options: Array.from(sellingTypes).sort(),
          },
        ],
      });
    } catch (error) {
      console.error("Get product options error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch product options",
        error: error.message,
      });
    }
  }
}

export default new ProductController();
