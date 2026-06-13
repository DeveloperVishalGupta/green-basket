import axios from "axios";

let shiprocketToken = null;

export const getShipRocketToken = async () => {
  if (shiprocketToken) return shiprocketToken;
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  shiprocketToken = response.data.token;
  return shiprocketToken;
};

/**
 * Create ShipRocket order
 */
export const createOrder = async (orderData) => {
  const token = await getShipRocketToken();
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    orderData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/**
 * Generate AWB for shipment
 */
export const generateAWB = async (shipmentId) => {
  const token = await getShipRocketToken();
  const response = await axios.post(
    `https://apiv2.shiprocket.in/v1/external/courier/assign/awb`,
    { shipment_id: shipmentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/**
 * Request pickup for shipment
 */
export const requestPickup = async (shipmentId) => {
  const token = await getShipRocketToken();
  const response = await axios.post(
    `https://apiv2.shiprocket.in/v1/external/courier/generate/pickup`,
    { shipment_id: [shipmentId] },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/**
 * Track shipment
 */
export const trackShipment = async (awbNumber) => {
  const token = await getShipRocketToken();
  const response = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Default export as service object
const shipRocketService = {
  createOrder,
  generateAWB,
  requestPickup,
  trackShipment,
};

export default shipRocketService;
