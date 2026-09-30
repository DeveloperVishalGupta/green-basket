import express from "express";
import { body } from "express-validator";
import orderController from "../controllers/orderController.js";
import { authenticate, isAuthorize } from "../middleware/auth.js";
import { validate, validateSchema } from "../middleware/validate.js";
import { createOrderSchema } from "../validators/createOrder.schema.js";
const router = express.Router();

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/admin/all",
  authenticate,
  isAuthorize("admin"),
  orderController.getAllOrders,
);

/**
 * @route   GET /api/orders/all
 * @desc    Get all orders (Admin only) - Alternative route
 * @access  Private (Admin)
 */
router.get(
  "/all",
  authenticate,
  isAuthorize("admin"),
  orderController.getAllOrders,
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Private
 */
router.get("/", authenticate, orderController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get("/:id", authenticate, orderController.getOrderById);

/**
 * @route   POST /api/orders/check-stock
 * @desc    Check stock availability for cart items against a delivery date
 * @access  Private
 */
router.post(
  "/check-stock",
  authenticate,
  [
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("deliveryDate").notEmpty().withMessage("Delivery date is required"),
    validate,
  ],
  orderController.checkStockAvailability,
);

/**
 * @route   POST /api/orders/:id/verify-availability
 * @desc    Re-check a scheduled order's items against live stock/prices
 *          (before preparing it / on the delivery day) and notify the
 *          customer if anything needs their attention
 * @access  Private (Admin only)
 */
router.post(
  "/:id/verify-availability",
  authenticate,
  isAuthorize("admin"),
  orderController.verifyAvailability,
);

/**
 * @route   PUT /api/orders/:id/items/:itemId/resolve
 * @desc    Apply the customer's chosen resolution (replace/remove/accept
 *          new price/accept partial quantity) to a flagged order item
 * @access  Private (order owner or admin)
 */
router.put(
  "/:id/items/:itemId/resolve",
  authenticate,
  [
    body("action")
      .isIn(["replace", "remove", "accept_price", "accept_partial"])
      .withMessage("Invalid resolution action"),
    body("replacementProductId").optional().isMongoId(),
    body("replacementVariant").optional().trim(),
    validate,
  ],
  orderController.resolveOrderItem,
);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validateSchema(createOrderSchema),
  orderController.createOrder,
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Customer edits their own order (items/address/delivery
 *          date+slot/notes) while it's still pending/confirmed/processing
 * @access  Private (order owner only)
 */
router.put(
  "/:id",
  authenticate,
  [
    body("items").optional().isArray(),
    body("items.*._id").optional().isMongoId(),
    body("items.*.quantity").optional().isInt({ min: 0 }),
    body("addressId").optional().isMongoId(),
    body("deliveryDate").optional().notEmpty(),
    body("deliveryTimeSlot").optional().trim(),
    body("notes").optional().trim(),
    validate,
  ],
  orderController.updateOrder,
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin only)
 */
router.put(
  "/:id/status",
  authenticate,
  isAuthorize("admin"),
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ])
      .withMessage("Invalid order status"),
    body("note").optional(),
    validate,
  ],
  orderController.updateOrderStatus,
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post(
  "/:id/cancel",
  authenticate,
  [body("reason").optional().trim(), validate],
  orderController.cancelOrder,
);

/**
 * @route   POST /api/orders/:id/refund/refresh
 * @desc    Refresh refund status from Razorpay
 * @access  Private
 */
router.post(
  "/:id/refund/refresh",
  authenticate,
  orderController.refreshRefundStatus,
);

/**
 * @route   PUT /api/orders/:id/shipment
 * @desc    Update order with shipment information
 * @access  Private (Admin only)
 */
router.put(
  "/:id/shipment",
  authenticate,
  isAuthorize("admin"),
  [
    body("shipmentOrderId").optional(),
    body("shipmentId").optional(),
    body("awb").optional(),
    body("courier").optional(),
    validate,
  ],
  orderController.updateOrderShipment,
);

export default router;
