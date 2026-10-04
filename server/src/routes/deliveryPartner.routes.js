import express from "express";
import { param, body } from "express-validator";
import { ROLES } from "../config/roles.js";
import deliveryPartnerController from "../controllers/deliveryPartnerController.js";
import { authenticate, isAuthorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * Delivery partner order & payment workflow.
 * Every route requires an authenticated, approved delivery partner; the
 * controller additionally restricts each order to its assigned partner.
 */
router.use(authenticate);
router.use(isAuthorize(ROLES.DELIVERY_PARTNER));

const orderId = param("id").isMongoId().withMessage("Invalid order id");

router.get("/orders", deliveryPartnerController.listOrders);
router.get("/orders/:id", [orderId, validate], deliveryPartnerController.getOrder);
router.post(
  "/orders/:id/accept",
  [orderId, validate],
  deliveryPartnerController.acceptOrder,
);
router.put(
  "/orders/:id/status",
  [
    orderId,
    body("status").isString().notEmpty().withMessage("Status is required"),
    validate,
  ],
  deliveryPartnerController.updateStatus,
);
router.post(
  "/orders/:id/payment/cash",
  [orderId, validate],
  deliveryPartnerController.collectCash,
);
router.post(
  "/orders/:id/payment/upi-qr",
  [orderId, validate],
  deliveryPartnerController.createUpiQr,
);
router.post(
  "/orders/:id/payment/upi-confirm",
  [orderId, body("reference").optional().isString(), validate],
  deliveryPartnerController.confirmUpiPayment,
);

export default router;
