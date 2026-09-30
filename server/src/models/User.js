import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

/**
 * User Schema
 * Handles authentication and user profile management
 * Supports email/password and OTP verification
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
    avatar: {
      url: String,
      publicId: String,
    },
    addresses: [
      {
        label: {
          type: String,
          required: true,
        },
        fullName: {
          type: String,
        },
        phone: {
          type: String,
        },
        street: {
          type: String,
          required: true,
          maxlength: [185, "Address cannot exceed 185 characters"],
        },
        area: {
          type: String,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
          default: "India",
        },
        landmark: {
          type: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        // Map-confirmed coordinates for this address, set when the
        // customer picks/drags a pin on the map (add-address page or
        // checkout's delivery-location confirmation step).
        location: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    deliveryPreference: {
      date: Date,
      selectedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
// Note: email index is created automatically by unique: true
userSchema.index({ role: 1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare passwords
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate and save OTP for email verification
 * @returns {string} Generated OTP code
 */
userSchema.methods.generateOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };

  return otp;
};

/**
 * Verify OTP code
 * @param {string} otpCode - OTP code to verify
 * @returns {boolean}
 */
userSchema.methods.verifyOTP = function (otpCode) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }

  if (new Date() > this.otp.expiresAt) {
    return false; // OTP expired
  }

  return this.otp.code === otpCode;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);
