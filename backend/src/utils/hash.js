const bcrypt = require("bcrypt");
const crypto = require("crypto");

/**
 * Hashes password using bcrypt.
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares plaintext password with stored bcrypt hash.
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Hashes OTP or tokens using SHA-256 for secure storage.
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generates a cryptographically secure random hex token.
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  hashPassword,
  comparePassword,
  hashToken,
  generateOTP,
  generateRandomToken,
};
