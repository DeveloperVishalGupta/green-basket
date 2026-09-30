import express from "express";
import deliveryController from "../controllers/deliveryController.js";

const router = express.Router();

/**
 * @route   GET /api/delivery/check-pincode/:pincode
 * @desc    Check whether a pincode is currently serviceable
 * @access  Public
 */
router.get("/check-pincode/:pincode", deliveryController.checkPincode);

export default router;
