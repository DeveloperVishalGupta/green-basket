import User from '../models/User.js';
import { sendTokenResponse } from '../utils/jwt.js';

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
          message: 'Email already registered',
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
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
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

      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified',
        });
      }

      // Verify OTP
      const isValid = user.verifyOTP(otp);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Mark user as verified
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      // Send token response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
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
          message: 'User not found',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified',
        });
      }

      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      // Prepare WhatsApp message for admin
      const adminWhatsApp = '919320206598'; // Admin WhatsApp number with country code
      const whatsappMessage = `*OTP Resend Request*%0A%0A*Customer Details:*%0AName: ${user.firstName} ${user.lastName}%0AEmail: ${user.email}%0APhone: ${user.phone}%0A%0A*New OTP Code:* ${otp}%0A%0A_Valid for 10 minutes_`;
      const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${whatsappMessage}`;

      res.json({
        success: true,
        message: 'OTP sent successfully',
        whatsappLink, // Include WhatsApp link in response
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
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
          message: 'Please provide email and password',
        });
      }

      // Get user with password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        // Generate new OTP
        const otp = user.generateOTP();
        await user.save();

        return res.status(403).json({
          success: false,
          message: 'Email not verified. Please verify your email first.',
          requiresVerification: true,
          ...(process.env.NODE_ENV === 'development' && { otp }),
        });
      }

      // Send token response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
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
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
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
        user: user,
        data: user, // Also include as data for consistency
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
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
          message: 'User not found',
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
        message: 'Profile updated successfully',
        user: user,
        data: user,
      });
    } catch (error) {
      console.error('Update me error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }
}

export default new AuthController();
