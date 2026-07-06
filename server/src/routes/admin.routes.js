import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate, isAuthorize } from '../middleware/auth.js';
const router = express.Router();

/**
 * All routes require admin authentication
 */
router.use(authenticate);
router.use(isAuthorize('admin'));

/**
 * Dashboard routes
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * Analytics routes
 */
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/customers', adminController.getCustomerAnalytics);
router.get('/analytics/products', adminController.getProductAnalytics);
router.get('/analytics/orders', adminController.getOrderAnalytics);

/**
 * User management routes
 */
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
