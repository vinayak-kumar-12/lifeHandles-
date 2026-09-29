const crypto = require("crypto");
const { query } = require("../config/db");
const ApiError = require("../utils/apiError");
const {
  hashPassword,
  comparePassword,
  hashToken,
  generateOTP,
  generateRandomToken,
} = require("../utils/hash");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");
const mailerService = require("./mailer.service");

class AuthService {
  /**
   * Register a new user account.
   */
  static async registerUser({ fullName, email, phone, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check existing email
    const existingEmail = await query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existingEmail.rows.length > 0) {
      throw new ApiError(400, "An account with this email address already exists.");
    }

    // 2. Check existing phone
    const existingPhone = await query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );
    if (existingPhone.rows.length > 0) {
      throw new ApiError(400, "An account with this phone number already exists.");
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // 4. Insert user into EXISTING users table
    const insertUserQuery = `
      INSERT INTO users (id, full_name, email, phone, password_hash, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
      RETURNING id, full_name, email, phone, email_verified;
    `;
    const userResult = await query(insertUserQuery, [
      userId,
      fullName.trim(),
      normalizedEmail,
      phone.trim(),
      passwordHash,
    ]);
    const newUser = userResult.rows[0];

    // 5. Generate secure 6-digit OTP & store hash in EXISTING email_verification_otps table
    const otp = generateOTP();
    const otpHash = hashToken(otp);
    const otpId = crypto.randomUUID();

    // Remove any previous unverified OTP records for this user
    await query("DELETE FROM email_verification_otps WHERE user_id = $1", [userId]);

    const insertOtpQuery = `
      INSERT INTO email_verification_otps (id, user_id, otp_hash, attempts, expires_at, created_at)
      VALUES ($1, $2, $3, 0, NOW() + INTERVAL '10 minutes', NOW());
    `;
    await query(insertOtpQuery, [otpId, userId, otpHash]);

    // 6. Send OTP via Nodemailer
    await mailerService.sendVerificationOTP(normalizedEmail, fullName, otp);

    return {
      success: true,
      message: "Registration successful. Please verify your email with the 6-digit OTP sent.",
    };
  }

  /**
   * Verify email address using submitted 6-digit OTP.
   */
  static async verifyEmailOTP(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const userRes = await query(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (userRes.rows.length === 0) {
      throw new ApiError(400, "Invalid email or OTP request.");
    }
    const user = userRes.rows[0];

    if (user.email_verified) {
      throw new ApiError(400, "Email address is already verified. Please log in.");
    }

    // 2. Find latest OTP record for user
    const otpRes = await query(
      "SELECT * FROM email_verification_otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );
    if (otpRes.rows.length === 0) {
      throw new ApiError(400, "No OTP verification request found. Please request a new OTP.");
    }
    const otpRecord = otpRes.rows[0];

    // 3. Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      await query("DELETE FROM email_verification_otps WHERE id = $1", [otpRecord.id]);
      throw new ApiError(400, "OTP code has expired. Please request a new OTP.");
    }

    // 4. Check max attempts (5)
    if (otpRecord.attempts >= 5) {
      await query("DELETE FROM email_verification_otps WHERE id = $1", [otpRecord.id]);
      throw new ApiError(400, "Maximum OTP verification attempts exceeded. Please request a new OTP.");
    }

    // 5. Compare OTP hashes
    const submittedHash = hashToken(otp);
    if (submittedHash !== otpRecord.otp_hash) {
      const nextAttempts = otpRecord.attempts + 1;
      await query(
        "UPDATE email_verification_otps SET attempts = $1 WHERE id = $2",
        [nextAttempts, otpRecord.id]
      );
      const remainingAttempts = 5 - nextAttempts;
      throw new ApiError(
        400,
        `Invalid OTP code. ${remainingAttempts > 0 ? remainingAttempts : 0} attempts remaining.`
      );
    }

    // 6. Update user email_verified status and clear OTP record
    await query(
      "UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1",
      [user.id]
    );
    await query("DELETE FROM email_verification_otps WHERE user_id = $1", [user.id]);

    return {
      success: true,
      message: "Email address verified successfully. You can now log in.",
    };
  }

  /**
   * Resend a new OTP for email verification.
   */
  static async resendVerificationOTP(email) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const userRes = await query(
      "SELECT id, full_name, email_verified FROM users WHERE email = $1",
      [normalizedEmail]
    );

    // Generic response to avoid revealing user existence
    const genericResponse = {
      success: true,
      message: "If an unverified account exists with this email, a new OTP has been sent.",
    };

    if (userRes.rows.length === 0) {
      return genericResponse;
    }
    const user = userRes.rows[0];

    if (user.email_verified) {
      throw new ApiError(400, "Email address is already verified. Please log in.");
    }

    // 2. Cooldown check (60 seconds)
    const lastOtpRes = await query(
      "SELECT created_at FROM email_verification_otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );
    if (lastOtpRes.rows.length > 0) {
      const lastCreatedAt = new Date(lastOtpRes.rows[0].created_at).getTime();
      const now = Date.now();
      const elapsedSeconds = (now - lastCreatedAt) / 1000;
      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        throw new ApiError(429, `Please wait ${remaining} seconds before requesting another OTP.`);
      }
    }

    // 3. Clear old OTP records
    await query("DELETE FROM email_verification_otps WHERE user_id = $1", [user.id]);

    // 4. Generate new 6-digit OTP & store hash
    const otp = generateOTP();
    const otpHash = hashToken(otp);
    const otpId = crypto.randomUUID();

    await query(
      `INSERT INTO email_verification_otps (id, user_id, otp_hash, attempts, expires_at, created_at)
       VALUES ($1, $2, $3, 0, NOW() + INTERVAL '10 minutes', NOW());`,
      [otpId, user.id, otpHash]
    );

    // 5. Send OTP via Nodemailer
    await mailerService.sendVerificationOTP(normalizedEmail, user.full_name, otp);

    return genericResponse;
  }

  /**
   * Authenticate user login and return JWT token pair.
   */
  static async loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const userRes = await query(
      "SELECT id, full_name, email, phone, password_hash, profile_image, address, city, state, pincode, email_verified FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      throw new ApiError(401, "Invalid email address or password.");
    }

    const user = userRes.rows[0];

    // 2. Verify password with bcrypt
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email address or password.");
    }

    // 3. Check if email is verified
    if (!user.email_verified) {
      throw new ApiError(
        403,
        "Email address is not verified. Please verify your email before logging in.",
        "EMAIL_NOT_VERIFIED"
      );
    }

    // 4. Generate Access & Refresh tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    // 5. Hash refresh token & store ONLY token_hash in EXISTING refresh_tokens table
    const refreshTokenHash = hashToken(refreshToken);
    const tokenId = crypto.randomUUID();

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', NOW());`,
      [tokenId, user.id, refreshTokenHash]
    );

    return {
      success: true,
      message: "Login successful.",
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
        profileImage: user.profile_image,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      },
    };
  }

  /**
   * Refresh JWT access token using a valid refresh token with rotation.
   */
  static async refreshAccessToken(refreshToken) {
    const tokenHash = hashToken(refreshToken);

    // 1. Find matching refresh token record
    const tokenRes = await query(
      "SELECT id, user_id, token_hash, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1",
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const tokenRecord = tokenRes.rows[0];

    // 2. Reuse detection: If token was already revoked, revoke ALL tokens for this user!
    if (tokenRecord.revoked_at !== null) {
      await query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
        [tokenRecord.user_id]
      );
      throw new ApiError(
        401,
        "Refresh token reuse detected. All active user sessions have been revoked for security."
      );
    }

    // 3. Check token expiration
    if (new Date() > new Date(tokenRecord.expires_at)) {
      throw new ApiError(401, "Refresh token has expired. Please log in again.");
    }

    // 4. Find user to attach payload
    const userRes = await query(
      "SELECT id, email FROM users WHERE id = $1",
      [tokenRecord.user_id]
    );
    if (userRes.rows.length === 0) {
      throw new ApiError(401, "User session invalid.");
    }
    const user = userRes.rows[0];

    // 5. Revoke current refresh token (Refresh Token Rotation)
    await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [tokenRecord.id]);

    // 6. Generate new access and refresh tokens
    const newAccessToken = generateAccessToken({ id: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newTokenHash = hashToken(newRefreshToken);
    const newTokenId = crypto.randomUUID();

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', NOW());`,
      [newTokenId, user.id, newTokenHash]
    );

    return {
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  /**
   * Revoke current session refresh token.
   */
  static async logoutUser(refreshToken) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
        [tokenHash]
      );
    }
    return {
      success: true,
      message: "Logged out successfully.",
    };
  }

  /**
   * Revoke all refresh tokens for authenticated user.
   */
  static async logoutAllSessions(userId) {
    await query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId]
    );
    return {
      success: true,
      message: "Logged out from all active devices successfully.",
    };
  }

  /**
   * Initiate forgot password flow by generating reset token and emailing user.
   */
  static async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();

    const genericResponse = {
      success: true,
      message: "If an account exists with this email address, a password reset link has been sent.",
    };

    const userRes = await query(
      "SELECT id, full_name FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (userRes.rows.length === 0) {
      return genericResponse;
    }
    const user = userRes.rows[0];

    // Generate reset token string and hash
    const resetToken = generateRandomToken();
    const tokenHash = hashToken(resetToken);
    const resetId = crypto.randomUUID();

    // Invalidate existing active reset tokens
    await query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [user.id]
    );

    // Insert into EXISTING password_reset_tokens table
    await query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes', NOW());`,
      [resetId, user.id, tokenHash]
    );

    // Send email
    await mailerService.sendPasswordResetEmail(normalizedEmail, user.full_name, resetToken);

    return genericResponse;
  }

  /**
   * Reset user password using reset token.
   */
  static async resetPassword(token, newPassword) {
    const tokenHash = hashToken(token);

    // 1. Find token record
    const tokenRes = await query(
      "SELECT * FROM password_reset_tokens WHERE token_hash = $1",
      [tokenHash]
    );
    if (tokenRes.rows.length === 0) {
      throw new ApiError(400, "Invalid or expired password reset token.");
    }
    const tokenRecord = tokenRes.rows[0];

    // 2. Check if used or expired
    if (tokenRecord.used_at !== null) {
      throw new ApiError(400, "Password reset token has already been used.");
    }
    if (new Date() > new Date(tokenRecord.expires_at)) {
      throw new ApiError(400, "Password reset token has expired. Please request a new one.");
    }

    // 3. Hash new password & update users table
    const passwordHash = await hashPassword(newPassword);
    await query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, tokenRecord.user_id]
    );

    // 4. Mark reset token as used
    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1", [tokenRecord.id]);

    // 5. Revoke all active refresh tokens for user
    await query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [tokenRecord.user_id]
    );

    return {
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    };
  }

  /**
   * Fetch current authenticated user profile.
   */
  static async getCurrentUser(userId) {
    const userRes = await query(
      "SELECT id, full_name, email, phone, email_verified, profile_image, address, city, state, pincode, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new ApiError(404, "User account not found.");
    }

    const user = userRes.rows[0];

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
        profileImage: user.profile_image,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        createdAt: user.created_at,
      },
    };
  }
}

module.exports = AuthService;
