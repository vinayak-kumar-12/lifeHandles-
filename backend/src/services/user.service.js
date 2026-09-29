const { query } = require("../config/db");
const ApiError = require("../utils/apiError");
const { hashPassword, comparePassword } = require("../utils/hash");

class UserService {
  /**
   * Get user profile details
   */
  static async getProfile(userId) {
    const userRes = await query(
      `SELECT id, full_name, email, phone, email_verified, profile_image, address, city, state, pincode, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new ApiError(404, "User account not found.");
    }

    const u = userRes.rows[0];
    return {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      emailVerified: u.email_verified,
      profileImage: u.profile_image,
      address: u.address || "",
      city: u.city || "",
      state: u.state || "",
      pincode: u.pincode || "",
      createdAt: u.created_at,
    };
  }

  /**
   * Update user profile details
   */
  static async updateProfile(userId, { fullName, phone, profileImage, address, city, state, pincode }) {
    // Check if phone number is being changed to another user's phone
    if (phone) {
      const existingPhone = await query(
        "SELECT id FROM users WHERE phone = $1 AND id != $2",
        [phone.trim(), userId]
      );
      if (existingPhone.rows.length > 0) {
        throw new ApiError(400, "Phone number is already associated with another account.");
      }
    }

    const currentProfile = await this.getProfile(userId);

    const updatedFullName = fullName !== undefined ? fullName.trim() : currentProfile.fullName;
    const updatedPhone = phone !== undefined ? phone.trim() : currentProfile.phone;
    const updatedProfileImage = profileImage !== undefined ? profileImage : currentProfile.profileImage;
    const updatedAddress = address !== undefined ? address : currentProfile.address;
    const updatedCity = city !== undefined ? city : currentProfile.city;
    const updatedState = state !== undefined ? state : currentProfile.state;
    const updatedPincode = pincode !== undefined ? pincode : currentProfile.pincode;

    const updateQuery = `
      UPDATE users
      SET full_name = $1, phone = $2, profile_image = $3, address = $4, city = $5, state = $6, pincode = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id, full_name, email, phone, email_verified, profile_image, address, city, state, pincode;
    `;

    const result = await query(updateQuery, [
      updatedFullName,
      updatedPhone,
      updatedProfileImage,
      updatedAddress,
      updatedCity,
      updatedState,
      updatedPincode,
      userId,
    ]);

    const u = result.rows[0];
    return {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      emailVerified: u.email_verified,
      profileImage: u.profile_image,
      address: u.address || "",
      city: u.city || "",
      state: u.state || "",
      pincode: u.pincode || "",
    };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const userRes = await query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      throw new ApiError(404, "User account not found.");
    }

    const isValid = await comparePassword(currentPassword, userRes.rows[0].password_hash);
    if (!isValid) {
      throw new ApiError(400, "Current password is incorrect.");
    }

    const newHash = await hashPassword(newPassword);
    await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [newHash, userId]);

    return { success: true, message: "Password updated successfully." };
  }
}

module.exports = UserService;
