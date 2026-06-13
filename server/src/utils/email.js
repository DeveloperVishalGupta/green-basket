import nodemailer from 'nodemailer';

/**
 * Email Configuration for Order Confirmations
 * Uses Gmail SMTP in development mode
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Use app-specific password
    },
  });
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 */
const sendOrderConfirmation = async (order, user) => {
  try {
    const transporter = createTransporter();

    const emailHTML = generateOrderEmailTemplate(order, user);

    const mailOptions = {
      from: `"Iqra Fashion" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id} - Iqra Fashion`,
      html: emailHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @param {string} status - New status
 */
const sendOrderStatusUpdate = async (order, user, status) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const mailOptions = {
      from: `"Iqra Fashion" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - ${statusMessages[status]} #${order._id}`,
      html: generateStatusUpdateTemplate(order, user, status),
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Generate order confirmation email template
 */
const generateOrderEmailTemplate = (order, user) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          <img src="${item.product?.images?.[0]?.url || ''}" alt="${item.product?.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
          <div>
            <strong>${item.product?.name || 'Product'}</strong><br>
            <small style="color: #6b7280;">Qty: ${item.quantity}</small>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong>₹${(item.price * item.quantity).toLocaleString()}</strong>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Thank you for shopping with Iqra Fashion</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
            Hi <strong>${user.firstName}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Your order has been confirmed and will be delivered within 7-10 days. We'll send you another email when your order ships.
          </p>

          <!-- Order Summary Box -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>#${order._id}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order Date:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${new Date(order.createdAt).toLocaleDateString()}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Order Items -->
          <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${itemsHTML}
          </table>

          <!-- Price Summary -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
            <tr>
              <td style="padding: 8px 15px; color: #6b7280;">Subtotal</td>
              <td style="padding: 8px 15px; text-align: right; color: #374151;">₹${order.subtotal?.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 15px; color: #6b7280;">Delivery Fee</td>
              <td style="padding: 8px 15px; text-align: right; color: #374151;">₹${order.deliveryFee || 0}</td>
            </tr>
            ${order.codCharges ? `
            <tr>
              <td style="padding: 8px 15px; color: #6b7280;">COD Charges</td>
              <td style="padding: 8px 15px; text-align: right; color: #374151;">₹${order.codCharges}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 15px; font-size: 18px; font-weight: bold; color: #111827;">Total</td>
              <td style="padding: 12px 15px; text-align: right; font-size: 18px; font-weight: bold; color: #10b981;">₹${order.total?.toLocaleString()}</td>
            </tr>
          </table>

          <!-- Delivery Address -->
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px;">Delivery Address</h3>
            <p style="margin: 0; color: #374151; line-height: 1.6;">
              ${order.shippingAddress?.fullName || user.firstName + ' ' + user.lastName}<br>
              ${order.shippingAddress?.street || ''}<br>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}<br>
              ${order.shippingAddress?.phone || user.phone || ''}
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Track Your Order
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@iqrafashion.com" style="color: #10b981; text-decoration: none;">support@iqrafashion.com</a>
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Iqra Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate status update email template
 */
const generateStatusUpdateTemplate = (order, user, status) => {
  const statusConfig = {
    processing: {
      icon: '⚙️',
      title: 'Order Processing',
      message: 'Your order is being prepared for shipment.',
      color: '#3b82f6',
    },
    shipped: {
      icon: '🚚',
      title: 'Order Shipped',
      message: 'Your order is on its way!',
      color: '#f59e0b',
    },
    delivered: {
      icon: '✅',
      title: 'Order Delivered',
      message: 'Your order has been successfully delivered.',
      color: '#10b981',
    },
    cancelled: {
      icon: '❌',
      title: 'Order Cancelled',
      message: 'Your order has been cancelled.',
      color: '#ef4444',
    },
  };

  const config = statusConfig[status] || statusConfig.processing;

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background-color: ${config.color}; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${config.icon}</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${config.title}</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${user.firstName}</strong>,</p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">${config.message}</p>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280;">Order ID: <strong>#${order._id}</strong></p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display: inline-block; background-color: ${config.color}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold;">
              View Order Details
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export {
  sendOrderConfirmation,
  sendOrderStatusUpdate
};

