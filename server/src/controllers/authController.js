import crypto from "crypto";
import {
  APPROVAL_REQUIRED_ROLES,
  APPROVAL_STATUS,
  ROLES,
} from "../config/roles.js";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Authentication Controller
 * Handles user registration, login, logout, OTP verification
 */
class AuthController {
  /**
   * Register new user
   * @route POST /api/auth/register
   * @access Public
   */
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Create user with verification enabled (temporary - skip OTP)
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        isVerified: true, // Temporarily auto-verify users
      });

      // Send token response directly (skip OTP verification)
      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  /**
   * Register an admin, vendor or delivery partner.
   * - vendor / delivery_partner: created as "pending"; no token is issued
   *   until an admin approves the account.
   * - admin: requires the server-side invite code (ADMIN_REGISTRATION_CODE),
   *   so nobody can self-promote to admin. Disabled when the code isn't set.
   * @route POST /api/auth/register/staff
   * @access Public
   */
  async registerStaff(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        adminInviteCode,
        businessName,
        gstNumber,
        businessAddress,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        serviceArea,
      } = req.body;

      if (role === ROLES.ADMIN) {
        const expected = process.env.ADMIN_REGISTRATION_CODE;
        if (!expected) {
          return res.status(403).json({
            success: false,
            message: "Admin registration is currently disabled.",
          });
        }
        const given = Buffer.from(String(adminInviteCode || ""));
        const wanted = Buffer.from(expected);
        if (
          given.length !== wanted.length ||
          !crypto.timingSafeEqual(given, wanted)
        ) {
          return res.status(403).json({
            success: false,
            message: "Invalid admin invite code.",
          });
        }
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      const needsApproval = APPROVAL_REQUIRED_ROLES.includes(role);

      const userData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        isVerified: true, // Matches customer flow (OTP currently skipped)
        approvalStatus: needsApproval
          ? APPROVAL_STATUS.PENDING
          : APPROVAL_STATUS.APPROVED,
      };

      if (role === ROLES.VENDOR) {
        userData.vendorProfile = { businessName, gstNumber, businessAddress };
      } else if (role === ROLES.DELIVERY_PARTNER) {
        userData.deliveryProfile = {
          vehicleType,
          vehicleNumber,
          licenseNumber,
          serviceArea,
        };
      }

      const user = await User.create(userData);

      if (needsApproval) {
        return res.status(201).json({
          success: true,
          pendingApproval: true,
          message:
            "Registration received. You can log in once an admin approves your account.",
        });
      }

      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error("Register staff error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  /**
   * Verify OTP
   * @route POST /api/auth/verify-otp
   * @access Public
   */
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already verified",
        });
      }

      // Verify OTP
      const isValid = user.verifyOTP(otp);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      // Mark user as verified
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      // Send token response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        success: false,
        message: "OTP verification failed",
        error: error.message,
      });
    }
  }

  /**
   * Resend OTP
   * @route POST /api/auth/resend-otp
   * @access Public
   */
  async resendOTP(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already verified",
        });
      }

      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      // Prepare WhatsApp message for admin
      const adminWhatsApp = "919320206598"; // Admin WhatsApp number with country code
      const whatsappMessage = `*OTP Resend Request*%0A%0A*Customer Details:*%0AName: ${user.firstName} ${user.lastName}%0AEmail: ${user.email}%0APhone: ${user.phone}%0A%0A*New OTP Code:* ${otp}%0A%0A_Valid for 10 minutes_`;
      const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${whatsappMessage}`;

      res.json({
        success: true,
        message: "OTP sent successfully",
        whatsappLink, // Include WhatsApp link in response
        ...(process.env.NODE_ENV === "development" && { otp }),
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP",
        error: error.message,
      });
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // Get user with password
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Vendors / delivery partners can only log in once approved
      if (
        user.approvalStatus &&
        user.approvalStatus !== APPROVAL_STATUS.APPROVED
      ) {
        return res.status(403).json({
          success: false,
          approvalStatus: user.approvalStatus,
          message:
            user.approvalStatus === APPROVAL_STATUS.REJECTED
              ? "Your registration was rejected. Please contact support."
              : "Your account is awaiting admin approval.",
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        // Generate new OTP
        const otp = user.generateOTP();
        await user.save();

        return res.status(403).json({
          success: false,
          message: "Email not verified. Please verify your email first.",
          requiresVerification: true,
          ...(process.env.NODE_ENV === "development" && { otp }),
        });
      }

      // Send token response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   * @access Private
   */
  async logout(req, res) {
    try {
      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error.message,
      });
    }
  }

  /**
   * Get current logged in user
   * @route GET /api/auth/me
   * @access Private
   */
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);

      res.json({
        success: true,
        data: user, // Also include as data for consistency
      });
    } catch (error) {
      console.error("Get me error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      });
    }
  }

  /**
   * Update current logged in user
   * @route PUT /api/auth/me
   * @access Private
   */
  async updateMe(req, res) {
    try {
      const { firstName, lastName, phone, avatar, addresses } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (avatar !== undefined) user.avatar = avatar;
      if (addresses !== undefined) user.addresses = addresses;

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update me error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, a reset link has been sent.",
        });
      }

      const resetToken = user.generatePasswordResetToken();

      await user.save({ validateBeforeSave: false });

      const resetURL = `${process.env.CLIENT_URL}reset-password/${resetToken}`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Green Basket</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Password Reset Request</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName || "there"},</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset the password for your Green Basket account. Click the button below to choose a new password.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetURL}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin: 20px 0; padding: 16px 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                          This link will expire in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </div>

                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px; line-height: 1.5;">
                        If the button above doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetURL}" style="color: #16a34a; word-break: break-all;">${resetURL}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                        Need help? Contact us at <a href="mailto:contact.greenbasket.in@gmail.com" style="color: #16a34a; text-decoration: none;">contact.greenbasket.in@gmail.com</a>
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
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

      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        html,
      });

      res.json({
        success: true,
        message: "Password reset link sent successfully.",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: "Unable to send email",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select("+password");

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Reset link is invalid or expired.",
        });
      }

      user.password = req.body.password;

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.json({
        success: true,
        message: "Password updated successfully.",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Unable to reset password",
      });
    }
  }
}

export default new AuthController();
