const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_2026";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_2026";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generates a short-lived JWT access token (15 minutes).
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

/**
 * Generates a long-lived JWT refresh token (7 days).
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

/**
 * Verifies JWT access token.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verifies JWT refresh token.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
