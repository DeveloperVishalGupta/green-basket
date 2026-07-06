import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '../config/email.js';
import { createRefund, fetchRefund } from '../config/razorpay.js';
import shipRocketService from '../config/ship-rocket-config.js';
// import shipRocketService from '../config/shipRocket.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { cancelShiprocketShipment } from './shipmentController.js';

/**
 * Order Controller
 * Handles order creation and management
 */
class OrderController {
  /**
   * Get all orders for current user
   * @route GET /api/orders
   * @access Private
   */
  async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sort = '-createdAt',
      } = req.query;

      const query = { 
        user: req.user._id,
        // Exclude pending orders without completed payment
        // Only show orders where payment is completed OR order is not pending
        $or: [
          { 'payment.status': 'completed' }, // Paid orders
          { status: { $ne: 'pending' } } // Non-pending orders (confirmed by admin)
        ]
      };

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Order.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  /**
   * Get single order by ID
   * @route GET /api/orders/:id
   * @access Private
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if user owns this order or is admin/vendor
      // Handle both populated user object and ObjectId
      const orderUserId = typeof order.user === 'object' && order.user._id 
        ? order.user._id.toString() 
        : order.user.toString();
      const currentUserId = req.user._id.toString();
      const userRole = req.user.role;

      // Allow access if:
      // 1. User owns the order (customer)
      // 2. User is an admin
      // 3. User is a vendor (for their sold products)
      const isOwner = orderUserId === currentUserId;
      const isAdmin = userRole === 'admin';
      const isVendor = userRole === 'vendor';

      if (!isOwner && !isAdmin && !isVendor) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order',
        });
      }
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order',
        error: error.message,
      });
    }
  }

  /**
   * Create new order
   * @route POST /api/orders
   * @access Private
   */
  async createOrder(req, res) {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod,
        pricing: frontendPricing,
        coupon,
        notes,
        deliveryDate,
        deliveryTimeSlot,
      } = req.body;

      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must contain at least one item',
        });
      }

      // Only allow prepaid/online payment (reject COD)
      if (paymentMethod && paymentMethod.toLowerCase() === 'cod') {
        return res.status(400).json({
          success: false,
          message: 'Cash on Delivery is not supported. Please use online payment.',
        });
      }

      const processedItems = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name || item.product} is not available`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${product.name}: Only ${product.stock} items available`,
          });
        }

        const itemSubtotal = product.price * item.quantity;
        calculatedSubtotal += itemSubtotal;

        processedItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url || '',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: product.price,
          subtotal: itemSubtotal,
        });

        // Note: Stock will be deducted when order is confirmed
      }

      // --- DELIVERY FEE LOGIC: ₹25 for orders ≤ ₹199; free above ₹199 (must match frontend) ---
      let discount = 0;
      let deliveryFee = calculatedSubtotal > 199 ? 0 : 25;
      let couponData = null;
      
      // Coupon logic commented out (not in use)
      /* 
      // Apply coupon discount if provided
      if (coupon && coupon.code) {
        // ✅ Check if user has already used this coupon
        const existingOrderWithCoupon = await Order.findOne({
          user: req.user._id,
          'coupon.code': coupon.code,
        });

        if (existingOrderWithCoupon) {
          return res.status(400).json({
            success: false,
            message: `You have already used the coupon code "${coupon.code}". Each coupon can only be used once per user.`,
          });
        }

        // Validate coupon (basic validation - you can expand this with a Coupon model)
        if (coupon.code === 'NEW10026') {
          discount = 26;
          deliveryFee = 0; // Free delivery for this coupon
          couponData = {
            code: coupon.code,
            discount: discount,
            freeDelivery: true,
          };
        } else if (coupon.discount && coupon.discount > 0) {
          // Accept any coupon passed from frontend with validation
          discount = coupon.discount;
          if (coupon.freeDelivery) {
            deliveryFee = 0;
          }
          couponData = {
            code: coupon.code,
            discount: coupon.discount,
            freeDelivery: coupon.freeDelivery || false,
          };
        }
      }
      */

      // Calculate final total (never negative)
      const calculatedTotal = Math.max(0, calculatedSubtotal - discount + deliveryFee);

      // Validate frontend pricing matches backend calculation (with tolerance for rounding)
      if (frontendPricing) {        
        // Allow 1 rupee tolerance for rounding differences
        const subtotalDiff = Math.abs(frontendPricing.subtotal - calculatedSubtotal);
        const discountDiff = Math.abs((frontendPricing.discount || 0) - discount);
        const shippingDiff = Math.abs(frontendPricing.shippingFee - deliveryFee);
        const totalDiff = Math.abs(frontendPricing.total - calculatedTotal);

        // Reject order if total difference is more than ₹5 (security check for price manipulation)
        if (totalDiff > 5) {          
          return res.status(400).json({
            success: false,
            message: 'Pricing validation failed. Product prices may have changed. Please refresh your cart and try again.',
            errors: [{
              field: 'pricing',
              message: `Total amount mismatch: Expected ₹${calculatedTotal}, received ₹${frontendPricing.total}`
            }]
          });
        }
      }

      // Create order with validated pricing (always use backend-calculated values)
      const order = await Order.create({
        user: req.user._id,
        items: processedItems,
        shippingAddress,
        payment: {
          method: paymentMethod,
          status: 'pending', // Always pending initially
        },
        pricing: {
          subtotal: calculatedSubtotal,
          tax: 0, // Tax can be added here if needed
          shippingFee: deliveryFee,
          discount: discount,
          total: calculatedTotal,
        },
        coupon: couponData,
        notes: notes || undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        deliveryTimeSlot: deliveryTimeSlot || undefined,
        statusHistory: [
          {
            status: 'pending',
            note: 'Order placed',
            updatedAt: new Date(),
          },
        ],
      });

      // For COD orders: Clear cart and send confirmation email immediately
      if (paymentMethod === 'cod') {
        // Clear user's cart
        await Cart.findOneAndUpdate(
          { user: req.user._id },
          { items: [] }
        );

        // Send order confirmation email
        try {
          const user = await User.findById(req.user._id);
          await sendOrderConfirmationEmail(order, user);
        } catch (emailError) {
          console.error('❌ Failed to send order confirmation email:', emailError);
          // Don't fail the order if email fails
        }

        // Create notification for order creation
        try {
          await Notification.createNotification(order.user, {
            type: 'order_created',
            title: 'Order Placed Successfully',
            message: `Your order #${order.orderNumber} has been placed successfully. You will pay ₹${order.pricing.total} on delivery.`,
            order: order._id,
            data: {
              orderNumber: order.orderNumber,
              status: 'pending',
              total: order.pricing.total,
              paymentMethod: 'COD',
            },
          });
        } catch (notificationError) {
          console.error('❌ Failed to create order notification:', notificationError);
          // Don't fail the order if notification fails
        }

        res.status(201).json({
          success: true,
          message: 'Order placed successfully! Pay on delivery.',
          data: order,
        });
      } else {
        // For online payment: Don't clear cart or send email yet
        // These will be done after successful payment verification
       
        // Create notification for online payment order creation
        try {
          await Notification.createNotification(order.user, {
            type: 'order_created',
            title: 'Order Created',
            message: `Your order #${order.orderNumber} has been created. Please complete the payment of ₹${order.pricing.total}.`,
            order: order._id,
            data: {
              orderNumber: order.orderNumber,
              status: 'pending',
              total: order.pricing.total,
              paymentMethod: 'Online',
            },
          });
        } catch (notificationError) {
          console.error('❌ Failed to create order notification:', notificationError);
          // Don't fail the order if notification fails
        }
        
        res.status(201).json({
          success: true,
          message: 'Order created. Please complete payment.',
          data: order,
        });
      }
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message,
      });
    }
  }

  /**
   * Update order status
   * @route PUT /api/orders/:id/status
   * @access Private (Admin only)
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note, cancellationReason, cancelledBy } = req.body;

      const validStatuses = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status',
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Prevent admin from updating customer-cancelled orders
      if (order.status === 'cancelled' && order.cancelledBy === 'customer') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update order cancelled by customer',
          cancelledBy: 'customer',
          cancellationReason: order.cancellationReason,
        });
      }

      const previousStatus = order.status;

      // Handle stock updates based on status change
      if (status === 'confirmed' && (previousStatus === 'pending' || previousStatus === 'cancelled' || previousStatus === 'refunded')) {
        // Reduce stock when order is confirmed from pending, cancelled, or refunded
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            if (product.stock < item.quantity) {
              return res.status(400).json({
                success: false,
                message: `${product.name}: Insufficient stock (available: ${product.stock}, required: ${item.quantity})`,
              });
            }
            product.stock -= item.quantity;
            await product.save();
          }
        }

        // Create Shiprocket order when admin confirms the order
        try {
          const orderWithDetails = await Order.findById(id)
            .populate('user')
            .populate('items.product');

          const shiprocketResponse = await shipRocketService.createOrder(orderWithDetails);

          if (shiprocketResponse.order_id) {
            // Update order with Shiprocket details
            order.shiprocketOrderId = shiprocketResponse.order_id;
            order.shiprocketShipmentId = shiprocketResponse.shipment_id;

            // Generate AWB and request pickup for next day
            try {
              const awbResponse = await shipRocketService.generateAWB(
                shiprocketResponse.shipment_id
              );

              if (awbResponse.response?.data?.awb_code) {
                order.trackingNumber = awbResponse.response.data.awb_code;
                order.courierName = awbResponse.response.data.courier_name;
              }

              // Request pickup for next day
              await shipRocketService.requestPickup(shiprocketResponse.shipment_id);

            } catch (awbError) {
              console.error('Error generating AWB or requesting pickup:', awbError);
              // Continue even if AWB generation fails
            }
          }
        } catch (shiprocketError) {
          console.error('Error creating Shiprocket order:', shiprocketError);
          // Don't fail the status update if Shiprocket fails
          // Admin can manually create the shipment
        }
      } else if ((status === 'cancelled' || status === 'refunded') && 
                 (previousStatus === 'confirmed' || previousStatus === 'processing' || previousStatus === 'shipped')) {
        // Restore stock when order is cancelled or refunded (only if it was confirmed before)
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      } else if (status === 'confirmed' && previousStatus !== 'confirmed') {
        // Increment sales count when order is confirmed for the first time
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { salesCount: item.quantity }
          });
        }
      } else if (status === 'delivered' && previousStatus !== 'delivered') {
        // Keep delivered logic for backward compatibility (no change needed)
      } else if ((status === 'cancelled' || status === 'refunded') &&
                 (previousStatus === 'confirmed' || previousStatus === 'processing' || previousStatus === 'shipped' || previousStatus === 'delivered')) {
        // Decrement sales count when confirmed order is cancelled/refunded
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { salesCount: -item.quantity }
          });
        }
      }

      // Mark as cancelled by admin when admin sets status to cancelled
      if (status === 'cancelled') {
        order.cancelledBy = cancelledBy || 'admin';
        if (cancellationReason) {
          order.cancellationReason = cancellationReason;
        } else if (note) {
          order.cancellationReason = note;
        }
      }

      await order.updateStatus(status, note);

      // Send status update email
      try {
        const user = await User.findById(order.user);
        if (user && status === 'shipped' && order.tracking?.trackingNumber) {
          // Send shipping notification with tracking info
          await sendOrderShippedEmail(order, user, {
            trackingNumber: order.tracking.trackingNumber,
            courierName: order.tracking.courierName || 'Standard Delivery',
            estimatedDelivery: order.tracking.estimatedDelivery,
          });
        }
        // For other statuses (processing, delivered, cancelled), implement as needed
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }

      // Create notification for user
      try {
        const notificationMessages = {
          pending: { title: 'Order Pending', message: `Your order #${order.orderNumber} is pending confirmation.` },
          confirmed: { title: 'Order Confirmed', message: `Your order #${order.orderNumber} has been confirmed and is being processed.` },
          processing: { title: 'Order Processing', message: `Your order #${order.orderNumber} is being prepared for shipment.` },
          shipped: { title: 'Order Shipped', message: `Your order #${order.orderNumber} has been shipped. Track it using tracking number: ${order.trackingNumber || 'N/A'}` },
          delivered: { title: 'Order Delivered', message: `Your order #${order.orderNumber} has been delivered. Thank you for shopping with us!` },
          cancelled: { title: 'Order Cancelled', message: `Your order #${order.orderNumber} has been cancelled. ${order.cancellationReason || ''}` },
          refunded: { title: 'Order Refunded', message: `Your order #${order.orderNumber} has been refunded. The amount will be credited to your account.` },
        };

        const notificationData = notificationMessages[status];
        if (notificationData) {
          await Notification.createNotification(order.user, {
            type: `order_${status}`,
            title: notificationData.title,
            message: notificationData.message,
            order: order._id,
            data: {
              orderNumber: order.orderNumber,
              status: status,
              trackingNumber: order.trackingNumber,
            },
          });
        }
      } catch (notificationError) {
        console.error('❌ Failed to create notification:', notificationError);
        // Don't fail the status update if notification fails
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message,
      });
    }
  }

  /**
   * Cancel order with Shiprocket cancellation and Razorpay refund
   * @route POST /api/orders/:id/cancel
   * @access Private
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }


      // Check if user owns this order or is admin
      const isOwner = order.user._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this order',
        });
      }

      // Check if order can be cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status: ${order.status}`,
        });
      }

      const cancellationResults = {
        orderCancelled: false,
        shiprocketCancelled: false,
        refundProcessed: false,
        stockRestored: false,
        errors: [],
      };

      // STEP 1: Cancel Shiprocket shipment (if exists)
      
      // return
      if (order.shiprocketShipmentId) {
        try {
          const cancelResult = await cancelShiprocketShipment(order.shiprocketShipmentId);
          if (cancelResult.success) {
            cancellationResults.shiprocketCancelled = true;
            order.statusHistory.push({
              status: 'cancelled',
              note: 'Shipment cancelled in Shiprocket',
              updatedAt: new Date(),
            });
          }
        } catch (shipError) {
          console.error('❌ Shiprocket cancellation failed:', shipError.message);
          cancellationResults.errors.push(`Shiprocket: ${shipError.message}`);
          // Continue with order cancellation even if Shiprocket fails
        }
      } else {
      }

      // STEP 2: Process refund for prepaid orders
      const isPrepaid = order.payment?.method !== 'cod';
      const isPaymentCompleted = order.payment?.status === 'completed';
      const hasRazorpayPaymentId = !!order.razorpayPaymentId;
      const isRefundNotProcessed = !order.refund?.id;

      if (isPrepaid && isPaymentCompleted && hasRazorpayPaymentId && isRefundNotProcessed) {
        try {
          const refundAmount = order.pricing?.total || 0;
          
          // Step 1: Create the refund
          const refund = await createRefund(order.razorpayPaymentId, refundAmount);
          
          // Step 2: Fetch complete refund details with timeline
          const completeRefundData = await fetchRefund(order.razorpayPaymentId, refund.id);
          
          // Step 3: Store complete refund information
          order.refund = {
            id: completeRefundData.id,
            paymentId: completeRefundData.payment_id,
            amount: completeRefundData.amount / 100, // Convert paise to rupees
            currency: completeRefundData.currency,
            status: completeRefundData.status,
            speed: completeRefundData.speed_requested || completeRefundData.speed_processed || 'normal',
            notes: completeRefundData.notes || {},
            createdAt: new Date(completeRefundData.created_at * 1000),
            processedAt: completeRefundData.processed_at ? new Date(completeRefundData.processed_at * 1000) : new Date(),
            batchId: completeRefundData.batch_id || null,
            razorpayData: completeRefundData, // Store complete Razorpay response
          };
          
          order.payment.status = 'refunded';
          cancellationResults.refundProcessed = true;
          
          order.statusHistory.push({
            status: 'cancelled',
            note: `Refund initiated: ₹${refundAmount} (Refund ID: ${refund.id}, Status: ${completeRefundData.status})`,
            updatedAt: new Date(),
          });
        } catch (refundError) {
          console.error('❌ Refund processing failed:', refundError.message);
          cancellationResults.errors.push(`Refund: ${refundError.message}`);
          
          // Mark refund as failed
          order.refund = {
            status: 'failed',
            amount: order.pricing?.total || 0,
            failureReason: refundError.message,
            processedAt: new Date(),
          };
          // Continue with order cancellation even if refund fails
        }
      } 
      // STEP 3: Restore product stock
      try {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
        cancellationResults.stockRestored = true;
      } catch (stockError) {
        console.error('❌ Error restoring stock:', stockError.message);
        cancellationResults.errors.push(`Stock: ${stockError.message}`);
      }

      // STEP 4: Update order status to cancelled
      order.cancellationReason = reason || 'No reason provided';
      order.cancelledBy = isAdmin ? 'admin' : 'customer';
      await order.updateStatus('cancelled', `Cancelled by ${order.cancelledBy}: ${reason || 'No reason provided'}`);
      cancellationResults.orderCancelled = true;

      // Create notification for order cancellation
      try {
        let notificationMessage = `Your order #${order.orderNumber} has been cancelled`;
        
        if (cancellationResults.refundProcessed) {
          notificationMessage += `. Refund of ₹${order.pricing?.total} has been initiated and will be processed within 5-7 business days`;
        } else if (order.payment?.method === 'cod') {
          notificationMessage += '. No payment was made for this order';
        }
        
        if (reason) {
          notificationMessage += `. Reason: ${reason}`;
        }

        await Notification.createNotification(order.user, {
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: notificationMessage,
          order: order._id,
          data: {
            orderNumber: order.orderNumber,
            status: 'cancelled',
            cancelledBy: order.cancelledBy,
            reason: reason || 'No reason provided',
            refundProcessed: cancellationResults.refundProcessed,
            refundAmount: cancellationResults.refundProcessed ? order.pricing?.total : 0,
          },
        });
      } catch (notificationError) {
        console.error('❌ Failed to create cancellation notification:', notificationError);
        // Don't fail the cancellation if notification fails
      }

      // Prepare response message
      let message = 'Order cancelled successfully';
      if (cancellationResults.refundProcessed) {
        message += `. Refund of ₹${order.pricing?.total} has been initiated`;
      }
      if (cancellationResults.errors.length > 0) {
        message += `. Note: ${cancellationResults.errors.join(', ')}`;
      }

      res.json({
        success: true,
        message,
        data: order,
        cancellationSummary: cancellationResults,
      });
    } catch (error) {
      console.error('❌ Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message,
      });
    }
  }

  /**
   * Refresh refund status from Razorpay
   * @route POST /api/orders/:id/refund/refresh
   * @access Private
   */
  async refreshRefundStatus(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if user owns this order or is admin
      const isOwner = order.user._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order',
        });
      }

      // Check if order has a refund
      if (!order.refund?.id) {
        return res.status(400).json({
          success: false,
          message: 'No refund found for this order',
        });
      }

      
      try {
        // Fetch latest refund data from Razorpay
        const completeRefundData = await fetchRefund(order.razorpayPaymentId, order.refund.id);
        
        // Update order with latest refund information
        order.refund = {
          id: completeRefundData.id,
          paymentId: completeRefundData.payment_id,
          amount: completeRefundData.amount / 100,
          currency: completeRefundData.currency,
          status: completeRefundData.status,
          speed: completeRefundData.speed_requested || completeRefundData.speed_processed || 'normal',
          notes: completeRefundData.notes || {},
          createdAt: new Date(completeRefundData.created_at * 1000),
          processedAt: completeRefundData.processed_at ? new Date(completeRefundData.processed_at * 1000) : order.refund.processedAt,
          batchId: completeRefundData.batch_id || null,
          razorpayData: completeRefundData,
        };
        
        await order.save();
        
        res.json({
          success: true,
          message: 'Refund status updated successfully',
          data: order,
        });
      } catch (fetchError) {
        console.error('❌ Error fetching refund status:', fetchError.message);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch refund status from Razorpay',
          error: fetchError.message,
        });
      }
    } catch (error) {
      console.error('❌ Refresh refund status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh refund status',
        error: error.message,
      });
    }
  }

  /**
   * Get all orders (Admin only)
   * @route GET /api/orders/admin/all
   * @access Private (Admin only)
   */
  async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sort = '-createdAt',
        search,
      } = req.query;

      // Exclude cancelled orders from admin view
      const query = {
        status: { $ne: 'cancelled' }
      };

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Order.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  /**
   * Track shipment
   * @route GET /api/orders/:id/track
   * @access Private
   */
  async trackShipment(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if user owns this order or is admin
      if (
        order.user.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order',
        });
      }

      if (!order.shiprocketShipmentId) {
        return res.status(400).json({
          success: false,
          message: 'Shipment tracking not available for this order',
        });
      }

      // Get tracking information from Shiprocket
      const trackingInfo = await shipRocketService.trackShipment(
        order.shiprocketShipmentId
      );

      res.json({
        success: true,
        data: trackingInfo,
      });
    } catch (error) {
      console.error('Track shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track shipment',
        error: error.message,
      });
    }
  }

  /**
   * Update order with shipment information
   * @route PUT /api/orders/:id/shipment
   * @access Private (Admin only)
   */
  async updateOrderShipment(req, res) {
    try {
      const { id } = req.params;
      const { shipmentOrderId, shipmentId, awb, courier } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Update shipment fields
      if (shipmentOrderId) order.shiprocketOrderId = shipmentOrderId;
      if (shipmentId) order.shiprocketShipmentId = shipmentId;
      if (awb) order.awbCode = awb;
      if (courier) order.courierName = courier;

      await order.save();

      res.json({
        success: true,
        message: 'Order shipment information updated successfully',
        data: order,
      });
    } catch (error) {
      console.error('Update order shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order shipment information',
        error: error.message,
      });
    }
  }
}

export default new OrderController();
