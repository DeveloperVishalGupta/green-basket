import express from 'express';
import { body } from 'express-validator';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();
/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    validate,
  ],
  userController.updateProfile
);

/**
 * @route   PUT /api/users/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    validate,
  ],
  userController.changePassword
);

/**
 * @route   GET /api/users/addresses
 * @desc    Get all addresses
 * @access  Private
 */
router.get('/addresses', authenticate, userController.getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post(
  '/addresses',
  authenticate,
  [
    body('label').notEmpty().withMessage('Address label is required'),
    body('street')
      .notEmpty().withMessage('Street is required')
      .isLength({ max: 185 }).withMessage('Address cannot exceed 185 characters'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zipCode').notEmpty().withMessage('Zip code is required'),
    body('country').optional(),
    body('isDefault').optional().isBoolean(),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    validate,
  ],
  userController.addAddress
);

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put(
  '/addresses/:id',
  authenticate,
  [
    body('street')
      .optional()
      .isLength({ max: 185 })
      .withMessage('Address cannot exceed 185 characters'),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    validate,
  ],
  userController.updateAddress
);

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:id', authenticate, userController.deleteAddress);

/**
 * @route   PUT /api/users/addresses/:id/default
 * @desc    Set default address
 * @access  Private
 */
router.put(
  '/addresses/:id/default',
  authenticate,
  userController.setDefaultAddress
);

/**
 * @route   GET /api/users/delivery-availability
 * @desc    Get delivery date availability (defaults to today + tomorrow)
 * @access  Private
 */
router.get(
  '/delivery-availability',
  authenticate,
  userController.getDeliveryAvailability
);

/**
 * @route   PUT /api/users/delivery-preference
 * @desc    Set the user's delivery date preference
 * @access  Private
 */
router.put(
  '/delivery-preference',
  authenticate,
  [
    body('date').notEmpty().withMessage('Delivery date is required'),
    validate,
  ],
  userController.setDeliveryPreference
);

export default router;
