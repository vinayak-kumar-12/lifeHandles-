const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authenticateJWT = require("../middlewares/auth.middleware");
const {
  registerLimiter,
  loginLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require("../middlewares/rateLimiter.middleware");

const {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../utils/validators");

// Public Authentication Endpoints
router.post("/register", registerLimiter, validate(registerSchema), AuthController.register);
router.post("/verify-otp", verifyOtpLimiter, validate(verifyOtpSchema), AuthController.verifyOTP);
router.post("/resend-otp", resendOtpLimiter, validate(resendOtpSchema), AuthController.resendOTP);
router.post("/login", loginLimiter, validate(loginSchema), AuthController.login);
router.post("/refresh", validate(refreshSchema), AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

// Protected Authentication Endpoints
router.post("/logout-all", authenticateJWT, AuthController.logoutAll);
router.get("/me", authenticateJWT, AuthController.getMe);

module.exports = router;
