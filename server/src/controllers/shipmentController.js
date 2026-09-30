import axios from "axios";
import { getShipRocketToken } from "../config/ship-rocket-config.js";

/**
 * CANCEL SHIPROCKET SHIPMENT (Utility Function)
 * @param {Number} shipmentId - Shiprocket shipment ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelShiprocketShipment = async (shipmentId) => {
  try {
    const token = await getShipRocketToken();

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/cancel",
      {
        ids: [shipmentId], // Shiprocket expects array of shipment IDs
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: 'Shipment cancelled successfully',
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Shiprocket cancellation error:', error.response?.data || error.message);
    
    // Don't throw error, return failed status
    return {
      success: false,
      message: 'Failed to cancel shipment in Shiprocket',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * CHECK COURIER SERVICEABILITY
 */
export const checkServiceability = async (req, res) => {
  try {
    const token = await getShipRocketToken();
    const { pickupPinCode, deliveryPinCode, weight } = req.body;

    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: String(pickupPinCode),
          delivery_postcode: String(deliveryPinCode),
          weight: Number(weight) > 0 ? Number(weight) : 0.5,
          cod: 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("Serviceability error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || "Serviceability check failed",
    });
  }
};

/**
 * CREATE SHIPMENT + ASSIGN AWB
 */

export const createShipment = async (req, res) => {
  try {
    const token = await getShipRocketToken();    
    const order = req.body;

    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order items are required",
      });
    }

    /* ---------------- NORMALIZE ITEMS ---------------- */
    const order_items = order.items.map((item, index) => {
      const units = Number(item.quantity ?? item.units ?? 1);
      const selling_price = Number(item.price ?? item.selling_price);

      if (!selling_price || selling_price <= 0) {
        throw new Error(`Invalid selling_price at item index ${index}`);
      }

      if (!units || units <= 0) {
        throw new Error(`Invalid units at item index ${index}`);
      }

      return {
        name: String(item.name || `Item ${index + 1}`),
        sku: String(`SKU_${index + 1}`),
        units: units,
        selling_price: selling_price,
        discount: 0,
        tax: 0,
        hsn: "",
      };
    });

    /* ---------------- CALCULATE SUB TOTAL ---------------- */
    const sub_total = Number(
      order_items.reduce(
        (sum, item) => sum + item.units * item.selling_price,
        0
      ).toFixed(2)
    );

    if (!sub_total || sub_total <= 0) {
      throw new Error("Calculated sub_total is invalid");
    }

    /* ---------------- EXTRACT DISCOUNT & SHIPPING ---------------- */
    // Extract discount and shipping charges from order
    const discount = Number(order.discount || order.total_discount || 0);
    const shipping_charges = Number(order.shipping_charges || order.shippingFee || 0);

    /* ---------------- FINAL PAYLOAD ---------------- */
    const payload = {
      order_id: String(order.orderId || `ORDER-${Date.now()}`),

      order_date: new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19),

      pickup_location: "warehouse", // ✅ CONSTANT

      billing_customer_name: String(order.firstName || " "),
      billing_last_name: String(order.lastName || " "),
      billing_address: String(order.address),
      billing_city: String(order.city),
      billing_pincode: String(order.pincode),
      billing_state: String(order.state),
      billing_country: "India",
      billing_email: String(order.email),
      billing_phone: String(order.phone).slice(-10),

      shipping_is_billing: true,

      order_items: order_items,

      payment_method: String(order.payment_method || "Cod"),

      shipping_charges: shipping_charges,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: discount, // ✅ Use actual discount from order

      sub_total: sub_total, // ✅ NUMBER, NOT STRING

      length: Number(order.length || 10),
      breadth: Number(order.breadth || 10),
      height: Number(order.height || 5),
      weight: Number(order.weight || 0.5),
    };

    /* ---------------- CREATE ORDER ---------------- */
    const orderResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!orderResponse.data?.shipment_id) {
      return res.status(400).json({
        success: false,
        error: "Order created but shipment_id missing",
        shiprocket: orderResponse.data,
      });
    }

    const shipmentId = orderResponse.data.shipment_id;

    /* ---------------- ASSIGN AWB ---------------- */
    const awbRes = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      { shipment_id: shipmentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.json({
      success: true,
      orderId: payload.order_id,
      shipmentId,
      awb: awbRes.data.awb_code,
      courier: awbRes.data.courier_name,
    });

  } catch (err) {
    console.error("SHIPROCKET ERROR:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

/**
 * CANCEL SHIPMENT
 */
export const cancelShipment = async (req, res) => {
  try {
    const token = await getShipRocketToken();
    const { shiprocketOrderId, shiprocketShipmentId, orderId } = req.body;

    // Need at least one identifier
    if (!shiprocketOrderId && !shiprocketShipmentId && !orderId) {
      return res.status(400).json({
        success: false,
        error: "Shiprocket order ID, shipment ID, or order ID is required",
      });
    }

    // Try cancelling by order_id first (preferred method)
    if (shiprocketOrderId) {
      try {
        const cancelResponse = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/orders/cancel",
          {
            ids: [shiprocketOrderId] // Shiprocket expects an array of order IDs
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return res.json({
          success: true,
          message: "Shipment cancelled successfully by order ID",
          cancelledBy: 'order_id',
          shiprocket: cancelResponse.data,
        });
      } catch (orderCancelError) {

        // If order_id cancellation fails, try shipment_id
        if (shiprocketShipmentId) {
          try {
                // Note: Shiprocket might not have a direct shipment cancel endpoint
            // This is a fallback attempt
            const shipmentCancelResponse = await axios.post(
              "https://apiv2.shiprocket.in/v1/external/orders/cancel",
              {
                ids: [shiprocketShipmentId]
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            return res.json({
              success: true,
              message: "Shipment cancelled successfully by shipment ID",
              cancelledBy: 'shipment_id',
              shiprocket: shipmentCancelResponse.data,
            });
          } catch (shipmentCancelError) {
            console.error('Shipment ID cancellation failed:', shipmentCancelError.response?.data || shipmentCancelError.message);}
        }
      }
    }

    // If we reach here, cancellation failed with both order_id and shipment_id
    return res.status(400).json({
      success: false,
      error: "Unable to cancel shipment - order may not exist in Shiprocket or already cancelled",
      details: {
        shiprocketOrderId,
        shiprocketShipmentId,
        orderId
      }
    });

  } catch (err) {
    console.error("SHIPROCKET CANCEL ERROR:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};