import nodemailer from 'nodemailer';

/**
 * Email Service Configuration
 * Handles all email communications including OTP verification and order
 * confirmations, via the same SMTP account already used for password
 * reset (see src/utils/sendEmail.js) — AWS SES was configured but never
 * had real credentials, so it silently failed on every send.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Domain used for the synthetic Message-ID we assign to an order's first
 * email, purely as a stable anchor for threading — it's never expected to
 * resolve to a real mailbox.
 */
const THREAD_DOMAIN =
  (process.env.SMTP_EMAIL || 'greenbasket.com').split('@')[1] ||
  'greenbasket.com';

/**
 * The one Message-ID every email about a given order shares a thread with.
 * Deterministic from the order id alone, so it's identical no matter which
 * function/process sends the mail.
 * @param {string} orderId
 */
const orderThreadRootId = (orderId) => `<order-${orderId}@${THREAD_DOMAIN}>`;

/**
 * Send email via SMTP
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlBody - HTML email body
 * @param {string} params.textBody - Plain text email body (optional)
 * @param {string} [params.orderId] - When provided, threads this email with
 *   every other email sent about the same order (same orderId → one
 *   continuing thread in the customer's inbox; a different orderId always
 *   starts its own separate thread).
 * @param {boolean} [params.isThreadRoot] - Mark this send as the first
 *   email in the order's thread (order confirmation). Every later email for
 *   that orderId replies to it; omit for any email that isn't the first.
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async ({
  to,
  subject,
  htmlBody,
  textBody,
  orderId,
  isThreadRoot = false,
}) => {
  try {
    const mailOptions = {
      from: `"Green Basket" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html: htmlBody,
      text: textBody,
    };

    if (orderId) {
      const rootMessageId = orderThreadRootId(orderId);
      if (isThreadRoot) {
        // Fix this email's own Message-ID so later emails for this order
        // can reference it — without this, replies would have nothing
        // real to point to.
        mailOptions.messageId = rootMessageId;
      } else {
        mailOptions.inReplyTo = rootMessageId;
        mailOptions.references = rootMessageId;
        // Several clients (Gmail included) weigh a matching "Re: " subject
        // alongside the reference headers when deciding whether to group
        // messages into one conversation — cheap to add, and harmless if
        // the client ignores it and relies on the headers alone.
        if (!/^re:/i.test(subject)) {
          mailOptions.subject = `Re: ${subject}`;
        }
      }
    }

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
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
  const subject = 'Verify Your Email - Green Basket';
  
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
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Green Basket</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Your Fresh Grocery Destination</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello ${userName}!</h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                    Thank you for registering with Green Basket. To complete your registration, please verify your email address using the OTP code below:
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
                      <strong>Security Tip:</strong> Never share your OTP with anyone. Green Basket will never ask for your OTP via phone or email.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@greenbasket.com" style="color: #0F8A5F; text-decoration: none;">support@greenbasket.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © 2026 Green Basket. All rights reserved.
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
    
    Thank you for registering with Green Basket.
    
    Your OTP code is: ${otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't request this verification, please ignore this email.
    
    Need help? Contact us at support@greenbasket.com
    
    © 2026 Green Basket. All rights reserved.
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
            <strong style="color: #333;">${item.name || 'Product'}</strong>
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

    const subject = `Order Confirmation - #${order.orderNumber} | Green Basket`;
    
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
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Thank you for shopping with Green Basket</p>
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
                          <span style="background-color: ${order.payment?.status === 'completed' ? '#d4edda' : '#fff3cd'}; color: ${order.payment?.status === 'completed' ? '#155724' : '#856404'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                            ${order.payment?.status}
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
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${order.pricing.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 15px;">Shipping:</td>
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${(order.pricing.shippingFee || 0).toFixed(2)}</td>
                      </tr>
                      ${order.pricing.discount ? `
                      <tr>
                        <td style="padding: 8px 0; color: #28a745; font-size: 15px;">Discount:</td>
                        <td style="padding: 8px 0; color: #28a745; font-size: 15px; text-align: right;">-₹${order.pricing.discount.toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 15px;">Tax:</td>
                        <td style="padding: 8px 0; color: #333; font-size: 15px; text-align: right;">₹${(order.pricing.tax || 0).toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #0F8A5F;">
                        <td style="padding: 15px 0 0 0; color: #333; font-size: 20px; font-weight: bold;">Total:</td>
                        <td style="padding: 15px 0 0 0; color: #0F8A5F; font-size: 24px; font-weight: bold; text-align: right;">₹${order.pricing.total.toFixed(2)}</td>
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
                      Questions? Contact us at <a href="mailto:support@greenbasket.com" style="color: #0F8A5F; text-decoration: none;">support@greenbasket.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Green Basket. All rights reserved.
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
      Order Confirmation - Green Basket
      
      Hi ${user.firstName}!
      
      Your order has been confirmed and is being processed.
      
      Order Number: ${order.orderNumber}
      Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
      Payment Status: ${order.payment?.status}

      Order Total: ₹${order.pricing.total.toFixed(2)}
      
      Track your order at: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      
      Questions? Contact us at support@greenbasket.com
      
      © ${new Date().getFullYear()} Green Basket. All rights reserved.
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      htmlBody,
      textBody,
      orderId: order._id,
      isThreadRoot: true,
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send a confirmation email listing what the customer just changed on
 * their own order (items/address/delivery schedule/notes) — see
 * orderController.updateOrder, which builds the `changes` array passed in
 * here (the same shape stored in order.editHistory).
 * @param {Object} order - The order after the edit was applied
 * @param {Object} user - User details
 * @param {Array<{field: string, previous: any, updated: any}>} changes
 */
const sendOrderUpdatedEmail = async (order, user, changes = []) => {
  try {
    const changesHTML = changes
      .map(
        (change) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; color: #333; font-size: 14px; font-weight: 600;">
            ${change.field}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; color: #dc3545; font-size: 14px; text-decoration: line-through;">
            ${change.previous}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; color: #0F8A5F; font-size: 14px; font-weight: 600;">
            ${change.updated}
          </td>
        </tr>
      `,
      )
      .join('');

    const subject = `Your Order Was Updated - #${order.orderNumber} | Green Basket`;

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Updated</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Order Updated</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Here's a summary of your changes</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      You (or someone on your account) just updated order
                      <strong>#${order.orderNumber}</strong>. Here's exactly what changed:
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 10px 12px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Field</th>
                          <th style="padding: 10px 12px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Before</th>
                          <th style="padding: 10px 12px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">After</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${changesHTML}
                      </tbody>
                    </table>

                    <!-- New Total Box -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #0F8A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #666; font-size: 14px;">Updated Order Total</p>
                      <p style="margin: 5px 0 0 0; color: #0F8A5F; font-size: 20px; font-weight: bold;">₹${order.pricing.total.toFixed(2)}</p>
                    </div>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            View Order
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px; line-height: 1.5;">
                      Didn't make this change? Contact us right away at
                      <a href="mailto:support@greenbasket.com" style="color: #0F8A5F;">support@greenbasket.com</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                      Questions? Contact us at <a href="mailto:support@greenbasket.com" style="color: #0F8A5F; text-decoration: none;">support@greenbasket.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Green Basket. All rights reserved.
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
      Order Updated - Green Basket

      Hi ${user.firstName}!

      Order #${order.orderNumber} was just updated:
      ${changes.map((c) => `- ${c.field}: ${c.previous} -> ${c.updated}`).join('\n')}

      Updated Order Total: ₹${order.pricing.total.toFixed(2)}

      View your order at: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}

      Didn't make this change? Contact us right away at support@greenbasket.com

      © ${new Date().getFullYear()} Green Basket. All rights reserved.
    `;

    return await sendEmail({
      to: user.email,
      subject,
      htmlBody,
      textBody,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error sending order updated email:', error);
    throw error;
  }
};

/**
 * Send the loyalty-reward email once a customer hits an order-count
 * milestone (see services/loyaltyService.js).
 * @param {Object} user - User details
 * @param {Object} coupon - The Coupon document just created
 */
const sendCouponUnlockedEmail = async (user, coupon) => {
  try {
    const subject = `You've Unlocked a Reward! 🎉 | Green Basket`;
    const discountLabel =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% off`
        : `₹${coupon.discountValue} off`;
    const expiryLabel = coupon.expiresAt
      ? new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reward Unlocked</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 You Did It!</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">You've completed ${coupon.milestone} orders with Green Basket</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Thank you for being a loyal customer! As a reward, here's a coupon for your next order:
                    </p>

                    <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                      <p style="margin: 0; color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Coupon Code</p>
                      <p style="margin: 8px 0; color: #333; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${coupon.code}</p>
                      <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">${discountLabel}</p>
                    </div>

                    ${
                      expiryLabel
                        ? `<p style="margin: 0 0 20px 0; color: #999999; font-size: 13px; text-align: center;">Valid until ${expiryLabel}</p>`
                        : ''
                    }

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/cart" style="display: inline-block; background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Shop Now
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
                      Questions? Contact us at <a href="mailto:support@greenbasket.com" style="color: #0F8A5F; text-decoration: none;">support@greenbasket.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Green Basket. All rights reserved.
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
      You Unlocked a Reward! - Green Basket

      Hi ${user.firstName}!

      Thank you for completing ${coupon.milestone} orders! Here's your coupon:

      Code: ${coupon.code}
      Discount: ${discountLabel}
      ${expiryLabel ? `Valid until: ${expiryLabel}` : ''}

      Shop now: ${process.env.CLIENT_URL || 'http://localhost:3000'}/cart

      © ${new Date().getFullYear()} Green Basket. All rights reserved.
    `;

    return await sendEmail({ to: user.email, subject, htmlBody, textBody });
  } catch (error) {
    console.error('Error sending coupon unlocked email:', error);
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
    const subject = `Your Order Has Shipped! - #${order.orderNumber} | Green Basket`;
    
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
                      Questions? Contact us at <a href="mailto:support@greenbasket.com" style="color: #0F8A5F; text-decoration: none;">support@greenbasket.com</a>
                    </p>
                    <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} Green Basket. All rights reserved.
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
      Your Order Has Shipped! - Green Basket
      
      Hi ${user.firstName}!
      
      Your order #${order.orderNumber} has been shipped and is on its way to you.
      
      ${trackingInfo.awb ? `Tracking Number: ${trackingInfo.awb}` : ''}
      ${trackingInfo.courier_name ? `Courier: ${trackingInfo.courier_name}` : ''}
      ${trackingInfo.expected_delivery ? `Expected Delivery: ${trackingInfo.expected_delivery}` : ''}
      
      ${trackingInfo.tracking_url ? `Track your package: ${trackingInfo.tracking_url}` : ''}
      
      View order details: ${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}
      
      Questions? Contact us at support@greenbasket.com
      
      © ${new Date().getFullYear()} Green Basket. All rights reserved.
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      htmlBody,
      textBody,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    throw error;
  }
};

/**
 * Send new-order alert email to the store admin/vendor.
 * @param {Object} order - Order details
 * @param {Object} user - Customer who placed the order
 */
const sendAdminOrderNotificationEmail = async (order, user) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    if (!adminEmail) return { success: false, error: 'No admin email configured' };

    const orderItemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">
            <strong style="color: #333;">${item.name || 'Product'}</strong>
            ${item.size ? `<br><span style="font-size: 12px; color: #666;">Size: ${item.size}</span>` : ''}
            ${item.color ? `<br><span style="font-size: 12px; color: #666;">Color: ${item.color}</span>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: center; color: #666;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: bold; color: #0F8A5F;">₹${item.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const customerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer';
    const subject = `New Order #${order.orderNumber} - Green Basket`;

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #0F8A5F 0%, #0A6B47 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">New Order Received</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px;">
                    <div style="background-color: #f8f9fa; border-left: 4px solid #0F8A5F; padding: 15px; margin: 0 0 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 20px; font-weight: bold;">${order.orderNumber}</p>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Customer:</td>
                        <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Phone:</td>
                        <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold;">${order.shippingAddress?.phone || user?.phone || '-'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Payment Method:</td>
                        <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold; text-transform: uppercase;">${order.payment?.method}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Payment Status:</td>
                        <td style="padding: 5px 0; color: #333; font-size: 14px; text-align: right; font-weight: bold; text-transform: uppercase;">${order.payment?.status}</td>
                      </tr>
                    </table>

                    <h3 style="margin: 25px 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid #0F8A5F; padding-bottom: 8px;">Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 10px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Product</th>
                          <th style="padding: 10px; text-align: center; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qty</th>
                          <th style="padding: 10px; text-align: right; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orderItemsHTML}
                      </tbody>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border-top: 2px solid #0F8A5F; padding-top: 10px;">
                      <tr>
                        <td style="padding: 10px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">Order Total:</td>
                        <td style="padding: 10px 0 0 0; color: #0F8A5F; font-size: 20px; font-weight: bold; text-align: right;">₹${order.pricing.total.toFixed(2)}</td>
                      </tr>
                    </table>

                    <h3 style="margin: 25px 0 10px 0; color: #333; font-size: 16px;">Delivery Address</h3>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #0F8A5F;">
                      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                        ${customerName}<br>
                        ${order.shippingAddress?.street}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}<br>
                        ${order.shippingAddress?.country}
                      </p>
                    </div>
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
      New Order Received - Green Basket

      Order Number: ${order.orderNumber}
      Customer: ${customerName}
      Phone: ${order.shippingAddress?.phone || user?.phone || '-'}
      Payment Method: ${order.payment?.method}
      Payment Status: ${order.payment?.status}

      Order Total: ₹${order.pricing.total.toFixed(2)}

      Delivery Address:
      ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}, ${order.shippingAddress?.country}
    `;

    return await sendEmail({ to: adminEmail, subject, htmlBody, textBody });
  } catch (error) {
    console.error('Error sending admin order notification email:', error);
    throw error;
  }
};

export {
  sendEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendOrderUpdatedEmail,
  sendCouponUnlockedEmail,
  sendOrderShippedEmail,
  sendAdminOrderNotificationEmail
};

