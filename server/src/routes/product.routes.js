import express from 'express';
import { body } from 'express-validator';
import productController from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleUploadError, parseArrayFields, uploadProductImages } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();
/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/options
 * @desc    Get all unique product options (sizes, colors, tags)
 * @access  Private (Admin/Vendor)
 */
router.get('/options/all', authenticate, authorize('admin', 'vendor'), productController.getProductOptions);

/**
 * @route   GET /api/products/id/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/id/:id', productController.getProductById);

/**
 * @route   GET /api/products/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/:slug', productController.getProductBySlug);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'vendor'),
  uploadProductImages,
  parseArrayFields,
  handleUploadError,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price')
      .isNumeric()
      .withMessage('Price must be a number')
      .custom((value) => value >= 0)
      .withMessage('Price cannot be negative'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stock')
      .isNumeric()
      .withMessage('Stock must be a number')
      .custom((value) => value >= 0)
      .withMessage('Stock cannot be negative'),
    validate,
  ],
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin/Vendor - owner only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'vendor'),
  uploadProductImages,
  parseArrayFields,
  handleUploadError,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

/**
 * @route   PUT /api/products/:id/featured
 * @desc    Toggle product featured status
 * @access  Private (Admin only)
 */
router.put(
  '/:id/featured',
  authenticate,
  authorize('admin'),
  productController.toggleFeatured
);

export default router;
