import express from "express";
import productController from "../controllers/productController.js";
import { authenticate, isAuthorize } from "../middleware/auth.js";
import {
  handleUploadError,
  parseArrayFields,
  parseProductFormData,
  uploadProductImages,
} from "../middleware/upload.js";
import { validate } from "../middleware/validateJoi.js";
import { createProductSchema } from "../validators/product.schema.js";
const router = express.Router();

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin/Vendor)
 */
router.post(
  "/",
  authenticate,
  isAuthorize("admin", "vendor"),
  uploadProductImages,
  // parseArrayFields,
  parseProductFormData,
  handleUploadError,
  validate(createProductSchema),
  productController.createProduct,
);

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get("/", productController.getProducts);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin/Vendor - owner only)
 */
router.put(
  "/:id",
  authenticate,
  isAuthorize("admin", "vendor"),
  uploadProductImages,
  parseArrayFields,
  handleUploadError,
  (req, res, next) => {
    console.log("body: ", req.body);
    next();
  },
  productController.updateProduct,
);

/**
 * @route   GET /api/products/options
 * @desc    Get all unique product options (sizes, colors, tags)
 * @access  Private (Admin/Vendor)
 */
router.get(
  "/options/all",
  authenticate,
  isAuthorize("admin", "vendor"),
  productController.getProductOptions,
);

/**
 * @route   GET /api/products/id/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get("/id/:id", productController.getProductById);

/**
 * @route   GET /api/products/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get("/:slug", productController.getProductBySlug);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  isAuthorize("admin"),
  productController.deleteProduct,
);

/**
 * @route   PUT /api/products/:id/featured
 * @desc    Toggle product featured status
 * @access  Private (Admin only)
 */
router.put(
  "/:id/featured",
  authenticate,
  isAuthorize("admin"),
  productController.toggleFeatured,
);

export default router;
