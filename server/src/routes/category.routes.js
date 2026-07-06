import express from 'express';
import { body } from 'express-validator';
import categoryController from '../controllers/categoryController.js';
import { authenticate, isAuthorize } from '../middleware/auth.js';
import { handleUploadError, uploadSingleImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/id/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/id/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/:slug', categoryController.getCategoryBySlug);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  isAuthorize('admin'),
  uploadSingleImage,
  handleUploadError,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim(),
    body('parent').optional(),
    validate,
  ],
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  isAuthorize('admin'),
  uploadSingleImage,
  handleUploadError,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  isAuthorize('admin'),
  categoryController.deleteCategory
);

export default router;
