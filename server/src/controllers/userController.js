import User from '../models/User.js';
import {
  getAvailability,
  getTodayId,
  getTomorrowId,
  isTodayOrTomorrow,
} from '../utils/deliveryCapacity.js';

/**
 * User Controller
 * Handles user profile and address management
 */
class UserController {
  /**
   * Get user profile
   * @route GET /api/users/profile
   * @access Private
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message,
      });
    }
  }

  /**
   * Update user profile
   * @route PUT /api/users/profile
   * @access Private
   */
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, avatar } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }

  /**
   * Change password
   * @route PUT /api/users/password
   * @access Private
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current and new password',
        });
      }

      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message,
      });
    }
  }

  /**
   * Get all addresses
   * @route GET /api/users/addresses
   * @access Private
   */
  async getAddresses(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user.addresses,
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses',
        error: error.message,
      });
    }
  }

  /**
   * Add new address
   * @route POST /api/users/addresses
   * @access Private
   */
  async addAddress(req, res) {
    try {
      const { label, fullName, phone, street, area, city, state, zipCode, country, landmark, isDefault, lat, lng } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      // Add new address
      user.addresses.push({
        label,
        fullName,
        phone,
        street,
        area,
        city,
        state,
        zipCode,
        country: country || 'India',
        landmark,
        isDefault: isDefault || false,
        location: lat != null && lng != null ? { lat, lng } : undefined,
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: user.addresses[user.addresses.length - 1],
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add address',
        error: error.message,
      });
    }
  }

  /**
   * Update address
   * @route PUT /api/users/addresses/:id
   * @access Private
   */
  async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const { label, fullName, phone, street, area, city, state, zipCode, country, landmark, isDefault, lat, lng } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = user.addresses.id(id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      // Update fields
      if (label !== undefined) address.label = label;
      if (fullName !== undefined) address.fullName = fullName;
      if (phone !== undefined) address.phone = phone;
      if (street !== undefined) address.street = street;
      if (area !== undefined) address.area = area;
      if (city !== undefined) address.city = city;
      if (state !== undefined) address.state = state;
      if (zipCode !== undefined) address.zipCode = zipCode;
      if (country !== undefined) address.country = country;
      if (landmark !== undefined) address.landmark = landmark;
      if (isDefault !== undefined) address.isDefault = isDefault;
      if (lat != null && lng != null) address.location = { lat, lng };

      await user.save();

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update address',
        error: error.message,
      });
    }
  }

  /**
   * Delete address
   * @route DELETE /api/users/addresses/:id
   * @access Private
   */
  async deleteAddress(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = user.addresses.id(id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      user.addresses.pull(id);
      await user.save();

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
        error: error.message,
      });
    }
  }

  /**
   * Set default address
   * @route PUT /api/users/addresses/:id/default
   * @access Private
   */
  async setDefaultAddress(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const address = user.addresses.id(id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      // Unset all defaults
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });

      // Set this as default
      address.isDefault = true;

      await user.save();

      res.json({
        success: true,
        message: 'Default address set successfully',
        data: address,
      });
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default address',
        error: error.message,
      });
    }
  }
  /**
   * Get delivery date availability (defaults to today + tomorrow)
   * @route GET /api/users/delivery-availability
   * @access Private
   */
  async getDeliveryAvailability(req, res) {
    try {
      const { dates } = req.query;
      const dateIds = dates
        ? dates.split(',').map((d) => d.trim()).filter(Boolean)
        : [getTodayId(), getTomorrowId()];

      const availability = await getAvailability(dateIds);

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error('Get delivery availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery availability',
        error: error.message,
      });
    }
  }

  /**
   * Set the user's delivery date preference
   * @route PUT /api/users/delivery-preference
   * @access Private
   */
  async setDeliveryPreference(req, res) {
    try {
      const { date } = req.body;

      if (!date || !isTodayOrTomorrow(date)) {
        return res.status(400).json({
          success: false,
          message: 'Delivery date must be today or tomorrow',
        });
      }

      const availability = await getAvailability([date]);
      if (!availability[date]) {
        return res.status(400).json({
          success: false,
          message: 'Selected delivery date is no longer available',
          code: 'DELIVERY_DATE_UNAVAILABLE',
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.deliveryPreference = {
        date: new Date(date),
        selectedAt: new Date(),
      };

      await user.save();

      res.json({
        success: true,
        message: 'Delivery preference saved',
        data: user,
      });
    } catch (error) {
      console.error('Set delivery preference error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save delivery preference',
        error: error.message,
      });
    }
  }
}

export default new UserController();
