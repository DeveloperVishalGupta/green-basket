import { sendAdminOrderNotificationEmail, sendOrderConfirmationEmail } from '../config/email.js';
import { createOrder as createRazorpayOrder, fetchPayment, verifyPaymentSignature, verifyWebhookSignature } from '../config/razorpay.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import orderNotificationService from '../services/orderNotificationService.js';

/**
 * Payment Controller
 * Handles Razorpay payment processing
 */

class PaymentController {
  /**
   * Create Razorpay order
   * @route POST /api/payment/create-order
   */
  async createOrder(req, res) {
    try {
      const { orderId, pricing: clientPricing } = req.body;

      // Validate request
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const userId = req.user._id.toString();

      // Find the order
      const order = await Order.findById(orderId).populate('items.product');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Verify order belongs to user
      const orderUserId = typeof order.user === 'object' ? order.user._id.toString() : order.user.toString();
      if (orderUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order',
        });
      }

      // Verify order payment is pending
      if (order.payment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Order payment already ${order.payment.status}`,
        });
      }

      // Verify order has valid pricing - use client pricing as fallback
      let orderTotal;
      
      if (order.pricing && order.pricing.total && order.pricing.total > 0) {
        orderTotal = order.pricing.total;
      } else if (clientPricing && clientPricing.total && clientPricing.total > 0) {
        orderTotal = clientPricing.total;
      } else if (order.total && order.total > 0) {
        orderTotal = order.total;
      } else {
        orderTotal = 0;
      }
      
      // Validate total amount
      if (!orderTotal || orderTotal <= 0) {
        console.error('❌ Order pricing issue:', {
          orderId: orderId,
          hasPricing: !!order.pricing,
          pricing: order.pricing,
          pricingTotal: order.pricing?.total,
          clientPricing: clientPricing,
          clientTotal: clientPricing?.total,
          orderTotal: order.total,
          calculatedTotal: orderTotal,
        });
        return res.status(400).json({
          success: false,
          message: 'Order total amount is invalid. Please refresh and try again.',
        });
      }

      // Ensure amount is a valid number
      orderTotal = parseFloat(orderTotal);
      
      if (isNaN(orderTotal) || orderTotal < 1) {
        console.error('❌ Invalid order amount:', orderTotal);
        return res.status(400).json({
          success: false,
          message: 'Order amount must be at least ₹1',
        });
      }

      // Get user details
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify Razorpay is configured
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Razorpay credentials not configured');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway not configured. Please contact support.',
        });
      }

      const razorpayOrder = await createRazorpayOrder({
        orderId: order._id.toString(),
        userId: userId,
        customerEmail: user.email,
        total: orderTotal, // Will be converted to paise in razorpay.js
        currency: 'INR',
      });

      if (!razorpayOrder || !razorpayOrder.id) {
        console.error('❌ Razorpay order creation failed - no order ID returned');
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order. Please try again.',
        });
      }

      // Update order with Razorpay order ID
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.json({
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount, // Amount in paise
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        message: 'Payment order created successfully',
      });
    } catch (error) {
      console.error('❌ Create Razorpay order error:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      
      // Handle specific Razorpay errors
      let errorMessage = 'Failed to create payment order';
      let statusCode = 500;
      
      if (error.message && error.message.includes('Razorpay is not configured')) {
        errorMessage = 'Payment gateway is not configured. Please contact support.';
        statusCode = 500;
      } else if (error.statusCode === 400 || error.error?.code === 'BAD_REQUEST_ERROR') {
        errorMessage = error.error?.description || 'Invalid payment request. Please check order details and try again.';
        statusCode = 400;
      } else if (error.statusCode === 401 || error.error?.code === 'AUTHENTICATION_ERROR') {
        errorMessage = 'Payment gateway authentication failed. Please contact support.';
        statusCode = 500;
      } else if (error.error && error.error.description) {
        errorMessage = `Payment error: ${error.error.description}`;
      } else if (error.message) {
        errorMessage = `Payment initialization failed: ${error.message}`;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          statusCode: error.statusCode,
          razorpayError: error.error,
        } : undefined,
      });
    }
  }

  /**
   * Verify payment after successful transaction
   * @route POST /api/payment/verify
   */
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment verification parameters',
        });
      }

      // Verify signature
      const isValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isValid) {
        console.error('❌ Payment signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature. Payment verification failed.',
        });
      }

      // Find order by Razorpay order ID
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
        .populate('user')
        .populate('items.product');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Verify order belongs to authenticated user
      if (req.user) {
        const orderUserId = typeof order.user === 'object' ? order.user._id.toString() : order.user.toString();
        const currentUserId = req.user._id.toString();
        
        if (orderUserId !== currentUserId) {
          console.error('❌ User mismatch in payment verification');
          return res.status(403).json({
            success: false,
            message: 'Not authorized to verify this payment',
          });
        }
      }

      // Fetch payment details from Razorpay
      const payment = await fetchPayment(razorpay_payment_id);


      // Update order payment details if payment successful
      if (payment.status === 'captured' || payment.status === 'authorized') {
        order.payment.status = 'completed';
        order.payment.method = payment.method || 'online';
        order.payment.transactionId = razorpay_payment_id;
        order.payment.paidAt = new Date();
        order.razorpayPaymentId = razorpay_payment_id;
        
        // DO NOT auto-confirm order - let admin manually confirm
        // Order status remains 'pending' for admin verification
        
        await order.save();

        // Clear user's cart after successful payment
        try {
          await Cart.findOneAndUpdate(
            { user: order.user._id || order.user },
            { items: [] }
          );
        } catch (cartError) {
          console.error('❌ Error clearing cart:', cartError);
          // Don't fail the request if cart clearing fails
        }

        // Send order confirmation email to customer and admin
        const userObj = order.user._id ? order.user : await User.findById(order.user);
        try {
          await sendOrderConfirmationEmail(order, userObj);
        } catch (emailError) {
          console.error('❌ Error sending confirmation email:', emailError);
          // Don't fail the request if email fails
        }

        try {
          await sendAdminOrderNotificationEmail(order, userObj);
        } catch (adminEmailError) {
          console.error('❌ Error sending admin order notification email:', adminEmailError);
          // Don't fail the request if email fails
        }

        // Create notification for successful payment
        try {
          await Notification.createNotification(order.user._id || order.user, {
            type: 'order_confirmed',
            title: 'Payment Successful',
            message: `Your payment of ₹${order.pricing.total} for order #${order.orderNumber} was successful. Your order is being processed.`,
            order: order._id,
            data: {
              orderNumber: order.orderNumber,
              status: 'pending',
              paymentStatus: 'completed',
              amount: order.pricing.total,
              transactionId: razorpay_payment_id,
            },
          });
        } catch (notificationError) {
          console.error('❌ Failed to create payment notification:', notificationError);
          // Don't fail the request if notification fails
        }

        // Send WhatsApp order confirmation (customer) and new-order alert
        // (vendor/admin). order.user is already populated from the query
        // above, so no extra lookup is needed.
        try {
          await orderNotificationService.sendOrderWhatsAppNotifications(order, order.user);
        } catch (whatsappError) {
          console.error('❌ Failed to send WhatsApp order notifications:', whatsappError);
          // Don't fail the request if WhatsApp delivery fails
        }

        res.json({
          success: true,
          data: {
            order: order,
            paymentStatus: payment.status,
          },
          message: 'Payment verified successfully',
        });
      } else {
        // Payment not successful
        console.error('❌ Payment not captured. Status:', payment.status);
        
        // Update order with failed payment status
        order.payment.status = 'failed';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        res.status(400).json({
          success: false,
          message: `Payment ${payment.status}. Please try again or contact support.`,
          data: {
            paymentStatus: payment.status,
          },
        });
      }
    } catch (error) {
      console.error('❌ Verify payment error:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      
      let errorMessage = 'Failed to verify payment';
      let statusCode = 500;
      
      if (error.message && error.message.includes('Razorpay is not configured')) {
        errorMessage = 'Payment gateway is not configured properly.';
      } else if (error.statusCode === 400 || error.error?.code === 'BAD_REQUEST_ERROR') {
        errorMessage = error.error?.description || 'Invalid payment details.';
        statusCode = 400;
      } else if (error.statusCode === 404) {
        errorMessage = 'Payment not found. Please contact support.';
        statusCode = 404;
      } else if (error.message) {
        errorMessage = `Payment verification failed: ${error.message}`;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          statusCode: error.statusCode,
          razorpayError: error.error,
        } : undefined,
      });
    }
  }

  /**
   * Handle Razorpay webhooks
   * @route POST /api/payment/webhook
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      // Razorpay signs the exact raw bytes; fall back to re-serialising only
      // if the raw body wasn't captured.
      const webhookBody = req.rawBody
        ? req.rawBody.toString('utf8')
        : JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = verifyWebhookSignature(webhookBody, signature);

      if (!isValid) {
        console.error('Webhook signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed',
        });
      }

      const event = req.body.event;
      const payload = req.body.payload?.payment?.entity || {};

      // Handle different event types
      switch (event) {
        case 'payment.captured': {
          // Find and update order
          const order = await Order.findOne({ razorpayOrderId: payload.order_id })
            .populate('user')
            .populate('items.product');

          if (order && order.paymentStatus === 'pending') {
            order.paymentStatus = 'paid';
            order.paymentMethod = payload.method;
            order.razorpayPaymentId = payload.id;
            order.paidAt = new Date();
            await order.save();

            // Send order confirmation email
            try {
              await sendOrderConfirmationEmail(order, order.user);
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError);
            }

            // Send WhatsApp order confirmation (customer) and new-order
            // alert (vendor/admin). The idempotency guard inside the
            // service ensures this doesn't duplicate a notification
            // already sent via the verifyPayment endpoint.
            try {
              await orderNotificationService.sendOrderWhatsAppNotifications(order, order.user);
            } catch (whatsappError) {
              console.error('Error sending WhatsApp order notifications:', whatsappError);
            }

          }
          break;
        }

        case 'payment.failed': {
          console.error('Payment failed:', payload.id);

          // Update order status to 'failed'
          const order = await Order.findOne({
            razorpayPaymentId: payload.id,
          });

          if (order) {
            order.paymentStatus = 'failed';
            await order.save();
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      });
    }
  }

  /**
   * Get payment methods
   * @route GET /api/payment/methods
   */
  async getPaymentMethods(req, res) {
    try {
      const methods = [
        {
          id: 'online',
          name: 'Online Payment',
          description: 'Pay securely via Card, UPI, Net Banking, Wallets',
          enabled: true,
          methods: ['card', 'upi', 'netbanking', 'wallet'],
          icon: '💳',
          recommended: true,
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          description: 'Pay when you receive the product',
          enabled: true,
          icon: '💵',
        },
      ];

      res.json({
        success: true,
        data: methods,
        message: 'Available payment methods',
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods',
        error: error.message,
      });
    }
  }
}

export default new PaymentController();
