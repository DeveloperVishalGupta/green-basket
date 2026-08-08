import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import sendEmail from "../utils/sendEmail.js";
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").optional().trim(),
    validate,
  ],
  authController.register,
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for email verification
 * @access  Public
 */
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp").notEmpty().withMessage("OTP is required"),
    validate,
  ],
  authController.verifyOTP,
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post(
  "/resend-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    validate,
  ],
  authController.resendOTP,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login,
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current logged in user
 * @access  Private
 */
router.put("/me", authenticate, authController.updateMe);

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      email: "developer.vishaal@gmail.com",
      subject: "Testing Email",
      html: "<h2>Email sent successfully 🎉</h2>",
    });

    res.json({
      success: true,
      message: "Email sent",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email required"), validate],
  authController.forgotPassword,
);

router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validate,
  ],
  authController.resetPassword,
);

export default router;
