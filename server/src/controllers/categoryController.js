import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

/**
 * Category Controller
 * Handles all category-related CRUD operations
 */
class CategoryController {
  /**
   * Get all categories with product counts
   * @route GET /api/categories
   * @access Public
   */
  async getCategories(req, res) {
    try {
      const { parent, includeInactive } = req.query;

      const query = {};

      // Filter by parent (top-level or subcategories)
      if (parent !== undefined) {
        query.parent = parent === 'null' || parent === '' ? null : parent;
      }

      // Include inactive categories (admin only)
      if (!includeInactive || includeInactive !== 'true') {
        query.isActive = true;
      }

      const categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort({ displayOrder: 1, name: 1 });

      // Add product count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true,
          });

          return {
            ...category.toObject(),
            productCount,
          };
        })
      );

      res.json({
        success: true,
        data: categoriesWithCount,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      });
    }
  }

  /**
   * Get category by slug with product count
   * @route GET /api/categories/:slug
   * @access Public
   */
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const category = await Category.findOne({ slug, isActive: true })
        .populate('parent', 'name slug')
        .populate('subcategories');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Get product count for this category
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          ...category.toObject(),
          productCount,
        },
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category',
        error: error.message,
      });
    }
  }

  /**
   * Get category by ID
   * @route GET /api/categories/id/:id
   * @access Public
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id)
        .populate('parent', 'name slug')
        .populate('subcategories');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category',
        error: error.message,
      });
    }
  }

  /**
   * Create new category
   * @route POST /api/categories
   * @access Private (Admin only)
   */
  async createCategory(req, res) {
    try {
      const categoryData = { ...req.body };

      // Handle image upload if file is present
      if (req.file) {
        try {
          // Upload to Cloudinary using stream
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'iqra-fashion/categories',
              transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto:good' },
              ],
            },
            async (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(400).json({
                  success: false,
                  message: error.message,
                  error: error.message,
                });
              }

              try {
                // Add image data to category
                categoryData.image = {
                  url: result.secure_url,
                  publicId: result.public_id,
                  alt: categoryData.name,
                };

                // Create category with image
                const category = await Category.create(categoryData);

                return res.status(201).json({
                  success: true,
                  message: 'Category created successfully',
                  data: category,
                });
              } catch (createError) {
                console.error('Create category after upload error:', createError);
                return res.status(400).json({
                  success: false,
                  message: createError.message,
                  error: createError.message,
                });
              }
            }
          );

          // Pipe the buffer to Cloudinary
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({
            success: false,
            message: uploadError.message,
            error: uploadError.message,
          });
        }
      } else {
        // Create category without image
        const category = await Category.create(categoryData);

        res.status(201).json({
          success: true,
          message: 'Category created successfully',
          data: category,
        });
      }
    } catch (error) {
      console.error('Create category error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  }

  /**
   * Update category
   * @route PUT /api/categories/:id
   * @access Private (Admin only)
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;

      let category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      const updateData = { ...req.body };

      // Handle new image upload
      if (req.file) {
        try {
          // Delete old image from Cloudinary if exists
          if (category.image?.publicId) {
            await cloudinary.uploader.destroy(category.image.publicId);
          }

          // Upload new image to Cloudinary using stream
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'iqra-fashion/categories',
              transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto:good' },
              ],
            },
            async (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(400).json({
                  success: false,
                  message: 'Failed to upload image 3',
                  error: error.message,
                });
              }

              // Add new image data
              updateData.image = {
                url: result.secure_url,
                publicId: result.public_id,
                alt: updateData.name || category.name,
              };

              // Update category with new image
              category = await Category.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
              });

              res.json({
                success: true,
                message: 'Category updated successfully',
                data: category,
              });
            }
          );

          // Pipe the buffer to Cloudinary
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({
            success: false,
            message: 'Failed to upload image 4',
            error: uploadError.message,
          });
        }
      } else {
        // Update category without changing image
        category = await Category.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        res.json({
          success: true,
          message: 'Category updated successfully',
          data: category,
        });
      }
    } catch (error) {
      console.error('Update category error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update category',
        error: error.message,
      });
    }
  }

  /**
   * Delete category
   * @route DELETE /api/categories/:id
   * @access Private (Admin only)
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Check if category has products
      const productsCount = await Product.countDocuments({ category: id });

      if (productsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${productsCount} products. Please reassign or delete products first.`,
        });
      }

      // Check if category has subcategories
      const subcategoriesCount = await Category.countDocuments({ parent: id });

      if (subcategoriesCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${subcategoriesCount} subcategories. Please delete subcategories first.`,
        });
      }

      // Delete image from Cloudinary if exists
      if (category.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(category.image.publicId);
        } catch (cloudinaryError) {
          console.error('Cloudinary delete error:', cloudinaryError);
          // Continue with category deletion even if image deletion fails
        }
      }

      await Category.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message,
      });
    }
  }
}

export default new CategoryController();
