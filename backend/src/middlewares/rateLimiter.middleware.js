const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Custom handler for rate limit exceeded responses
const rateLimitHandler = (req, res, next, options) => {
  res.status(429).json({
    success: false,
    message: options.message || "Too many requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  });
};

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many registration attempts. Please try again after 15 minutes.",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many OTP verification attempts. Please try again after 10 minutes.",
});

const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many OTP resend requests. Please try again after 15 minutes.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many password reset requests. Please try again after 15 minutes.",
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many password reset attempts. Please try again after 15 minutes.",
});

module.exports = {
  globalLimiter,
  registerLimiter,
  loginLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
