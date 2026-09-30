import {
  isPincodeServiceable,
  NON_SERVICEABLE_MESSAGE,
} from "../config/serviceableAreas.js";

/**
 * Delivery Controller
 * Public pincode-serviceability check, used by the frontend to validate
 * a pincode before checkout/order placement.
 */
class DeliveryController {
  /**
   * GET /api/delivery/check-pincode/:pincode
   */
  async checkPincode(req, res) {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode || "")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pincode",
      });
    }

    const serviceable = isPincodeServiceable(pincode);

    res.json({
      success: true,
      data: {
        pincode,
        serviceable,
        message: serviceable ? "Delivery available at this pincode" : NON_SERVICEABLE_MESSAGE,
      },
    });
  }
}

export default new DeliveryController();
