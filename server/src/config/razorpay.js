import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are available
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * Razorpay Payment Gateway Configuration
 */

/**
 * Create a Razorpay Order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Razorpay order
 */
const createOrder = async (orderData) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    // Validate amount
    if (!orderData.total || orderData.total <= 0) {
      throw new Error('Invalid order amount. Amount must be greater than 0.');
    }
    
    // Convert to paise and ensure it's an integer
    const amountInPaise = Math.round(orderData.total * 100);
    
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      throw new Error(`Invalid amount: ${orderData.total}. Minimum amount is ₹1.`);
    }
    
    const options = {
      amount: amountInPaise, // Amount in paise (smallest currency unit)
      currency: orderData.currency || 'INR',
      receipt: orderData.orderId,
      notes: {
        orderId: orderData.orderId,
        userId: orderData.userId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    return razorpayOrder;
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
    });
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (paymentData) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    // Create the expected signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    throw error;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPayment = async (paymentId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw error;
  }
};

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in rupees (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund object
 */
const createRefund = async (paymentId, amount = null) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    const refundData = amount 
      ? { amount: Math.round(amount * 100) } // Amount in paise
      : {}; // Full refund if no amount specified

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

/**
 * Fetch refund details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Complete refund object with timeline
 */
const fetchRefund = async (paymentId, refundId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    // Fetch refund details from Razorpay API
    const refund = await razorpay.refunds.fetch(refundId);
    return refund;
  } catch (error) {
    console.error('Error fetching refund:', error);
    throw error;
  }
};

/**
 * Fetch all refunds for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} List of refunds
 */
const fetchPaymentRefunds = async (paymentId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    const refunds = await razorpay.payments.fetchMultipleRefund(paymentId);
    return refunds;
  } catch (error) {
    console.error('Error fetching payment refunds:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * @param {string} webhookBody - Request body as string
 * @param {string} signature - Razorpay signature from header
 * @returns {boolean} True if signature is valid
 */
const verifyWebhookSignature = (webhookBody, signature) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw error;
  }
};

export {
  createOrder, createRefund, fetchPayment, fetchPaymentRefunds, fetchRefund, razorpay, verifyPaymentSignature, verifyWebhookSignature
};

