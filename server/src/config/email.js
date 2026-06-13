import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * AWS SES Email Service Configuration
 * Handles all email communications including OTP verification and order confirmations
 */

// Create SES client instance
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-south-1', // Mumbai region by default
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Send email using AWS SES
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlBody - HTML email body
 * @param {string} params.textBody - Plain text email body (optional)
 * @returns {Promise<Object>} - SES response
 */
const sendEmail = async ({ to, subject, htmlBody, textBody }) => {
  try {
    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@iqrafashion.com',
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          ...(textBody && {
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
        return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Send OTP verification email
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  const subject = 'Verify Your Email - Apna Bazaar';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Iqra Fashion</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Your Fashion Destination</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello ${userName}!</h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                    Thank you for registering with Iqra Fashion. To complete your registration, please verify your email address using the OTP code below:
                  </p>
                  
                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center" style="background-color: #f8f9fa; border: 2px dashed #0F8A5F; border-radius: 8px; padding: 30px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                        <p style="margin: 0; color: #0F8A5F; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                    This OTP will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.
                  </p>
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      <strong>Security Tip:</strong> Never share your OTP with anyone. Iqra Fashion will never ask for your OTP via phone or email.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@iqrafashion.com" style="color: #0F8A5F; text-decoration: none;">support@iqrafashion.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © 2026 Iqra Fashion. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const textBody = `
    Hello ${userName}!
    
    Thank you for registering with Iqra Fashion.
    
    Your OTP code is: ${otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't request this verification, please ignore this email.
    
    Need help? Contact us at support@iqrafashion.com
    
    © 2026 Iqra Fashion. All rights reserved.
  `;
  
  return await sendEmail({ to: email, subject, htmlBody, textBody });
};

/**
 * Send order confirmation email to customer
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const orderItemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
            <strong style="color: #333;">${item.product?.name || 'Product'}</strong>
            ${item.size ? `<br><span style="font-size: 12px; color: #666;">Size: ${item.size}</span>` : ''}
            ${item.color ? `<br><span style="font-size: 12px; color: #666;">Color: ${item.color}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center; color: #666;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right; color: #666;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #0F8A5F;">
            ₹${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    const subject = `Order Confirmation - #${order.orderNumber} | Iqra Fashion`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Order Confirmed!</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Thank you for shopping with Iqra Fashion</p>
                  </td>
                </tr>
                
                <!-- Order Status Icon -->
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #d4edda; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                      <span style="color: #0F8A5F; font-size: 40px;">✓</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Your order has been confirmed and is being processed. We'll send you another email when your order ships.
                    </p>
                    
                    <!-- Order Number Box -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #0F8A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 20px; font-weight: bold;">${order.orderNumber}</p>
                    </div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Order Date:</td>
                        <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Payment Status:</td>
                        <td style="padding: 5px 0; text-align: right;">
                          <span style="background-color: ${order.paymentStatus === 'paid' ? '#d4edda' : '#fff3cd'}; color: ${order.paymentStatus === 'paid' ? '#155724' : '#856404'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                            ${order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Order Items -->
                    <h3 style="margin: 30px 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #0F8A5F; padding-bottom: 10px;">Order Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 12px; text-align: left; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Product</th>
                          <th style="padding: 12px; text-align: center; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Qty</th>
                          <th style="padding: 12px; text-align: right; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Price</th>
                          <th style="padding: 12px; text-align: right; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orderItemsHTML}
                      </tbody>
                    </table>
                    
                    <!-- Order Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; border-top: 2px solid #e9ecef; padding-top: 20px;">
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 15px;">Subtotal:</td>
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 15px;">Shipping:</td>
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${order.shippingCost.toFixed(2)}</td>
                      </tr>
                      ${order.discount ? `
                      <tr>
                        <td style="padding: 8px 0; color: #28a745; font-size: 15px;">Discount:</td>
                        <td style="padding: 8px 0; color: #28a745; font-size: 15px; text-align: right;">-₹${order.discount.toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 15px;">Tax:</td>
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${order.tax.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #0F8A5F;">
                        <td style="padding: 15px 0 0 0; color: #333; font-size: 20px; font-weight: bold;">Total:</td>
                        <td style="padding: 15px 0 0 0; color: #0F8A5F; font-size: 24px; font-weight: bold; text-align: right;">₹${order.total.toFixed(2)}</td>
                      </tr>
                    </table>
                    
                    <!-- Shipping Address -->
                    <h3 style="margin: 30px 0 15px 0; color: #333; font-size: 18px;">Shipping Address</h3>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0F8A5F;">
                      <p style="margin: 0 0 5px 0; color: #333; font-size: 15px; font-weight: bold;">${user.firstName} ${user.lastName}</p>
                      <p style="margin: 5px 0; color: #666; font-size: 14px; line-height: 1.5;">
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                        ${order.shippingAddress.country}<br>
                        ${user.phone ? `Phone: ${user.phone}` : ''}
                      </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Track Your Order
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                      Questions? Contact us at <a href="mailto:support@iqrafashion.com" style="color: #0F8A5F; text-decoration: none;">support@iqrafashion.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Iqra Fashion. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    const textBody = `
      Order Confirmation - Iqra Fashion
      
      Hi ${user.firstName}!
      
      Your order has been confirmed and is being processed.
      
      Order Number: ${order.orderNumber}
      Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
      Payment Status: ${order.paymentStatus}
      
      Order Total: ₹${order.total.toFixed(2)}
      
      Track your order at: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      
      Questions? Contact us at support@iqrafashion.com
      
      © ${new Date().getFullYear()} Iqra Fashion. All rights reserved.
    `;
    
    return await sendEmail({ 
      to: user.email, 
      subject, 
      htmlBody, 
      textBody 
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send order shipped notification email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {Object} trackingInfo - Shiprocket tracking information
 */
const sendOrderShippedEmail = async (order, user, trackingInfo = {}) => {
  try {
    const subject = `Your Order Has Shipped! - #${order.orderNumber} | Iqra Fashion`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📦 Your Order is On Its Way!</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Get ready to receive your items</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Great news! Your order <strong>#${order.orderNumber}</strong> has been shipped and is on its way to you.
                    </p>
                    
                    ${trackingInfo.awb ? `
                    <!-- Tracking Info -->
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #0F8A5F; border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px 0; color: #0F8A5F; font-size: 18px;">📍 Tracking Information</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Tracking Number:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold; font-family: monospace;">${trackingInfo.awb}</td>
                        </tr>
                        ${trackingInfo.courier_name ? `
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Courier:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold;">${trackingInfo.courier_name}</td>
                        </tr>
                        ` : ''}
                        ${trackingInfo.expected_delivery ? `
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Expected Delivery:</td>
                          <td style="padding: 8px 0; color: #0F8A5F; font-size: 14px; text-align: right; font-weight: bold;">${trackingInfo.expected_delivery}</td>
                        </tr>
                        ` : ''}
                      </table>
                      
                      ${trackingInfo.tracking_url ? `
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 0 0;">
                        <tr>
                          <td align="center">
                            <a href="${trackingInfo.tracking_url}" style="display: inline-block; background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold;">
                              Track Your Package
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- Shipping Address -->
                    <h3 style="margin: 30px 0 15px 0; color: #333; font-size: 18px;">Delivery Address</h3>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0F8A5F;">
                      <p style="margin: 0 0 5px 0; color: #333; font-size: 15px; font-weight: bold;">${user.firstName} ${user.lastName}</p>
                      <p style="margin: 5px 0; color: #666; font-size: 14px; line-height: 1.5;">
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                        ${order.shippingAddress.country}
                      </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; background-color: #fff; color: #0F8A5F; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; border: 2px solid #0F8A5F;">
                            View Order Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                      Questions? Contact us at <a href="mailto:support@iqrafashion.com" style="color: #0F8A5F; text-decoration: none;">support@iqrafashion.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Iqra Fashion. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    const textBody = `
      Your Order Has Shipped! - Iqra Fashion
      
      Hi ${user.firstName}!
      
      Your order #${order.orderNumber} has been shipped and is on its way to you.
      
      ${trackingInfo.awb ? `Tracking Number: ${trackingInfo.awb}` : ''}
      ${trackingInfo.courier_name ? `Courier: ${trackingInfo.courier_name}` : ''}
      ${trackingInfo.expected_delivery ? `Expected Delivery: ${trackingInfo.expected_delivery}` : ''}
      
      ${trackingInfo.tracking_url ? `Track your package: ${trackingInfo.tracking_url}` : ''}
      
      View order details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      
      Questions? Contact us at support@iqrafashion.com
      
      © ${new Date().getFullYear()} Iqra Fashion. All rights reserved.
    `;
    
    return await sendEmail({ 
      to: user.email, 
      subject, 
      htmlBody, 
      textBody 
    });
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    throw error;
  }
};

export {
  sendEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail
};

