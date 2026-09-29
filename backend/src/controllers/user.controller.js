const UserService = require("../services/user.service");
const sendResponse = require("../utils/apiResponse");
const fs = require("fs");
const path = require("path");

class UserController {
  /**
   * GET /api/users/profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      return sendResponse(res, 200, "User profile retrieved successfully.", { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updatedUser = await UserService.updateProfile(req.user.id, req.body);
      return sendResponse(res, 200, "Profile updated successfully.", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const result = await UserService.changePassword(req.user.id, req.body);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/profile/upload-image
   * Expects multipart/form-data with field name "profileImage"
   */
  static async uploadProfileImage(req, res, next) {
    try {
      if (!req.file) {
        return sendResponse(res, 400, "No image file provided.");
      }

      // Build the public URL for the uploaded image
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Delete old profile image file if exists
      const currentProfile = await UserService.getProfile(req.user.id);
      if (currentProfile.profileImage && currentProfile.profileImage.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "../../..", currentProfile.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update profile_image in DB
      const updatedUser = await UserService.updateProfile(req.user.id, {
        profileImage: imageUrl,
      });

      return sendResponse(res, 200, "Profile image uploaded successfully.", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/profile/remove-image
   */
  static async removeProfileImage(req, res, next) {
    try {
      const currentProfile = await UserService.getProfile(req.user.id);

      // Delete the file from disk
      if (currentProfile.profileImage && currentProfile.profileImage.startsWith("/uploads/")) {
        const filePath = path.join(__dirname, "../../..", currentProfile.profileImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Set profile_image to null in DB
      const updatedUser = await UserService.updateProfile(req.user.id, {
        profileImage: null,
      });

      return sendResponse(res, 200, "Profile image removed successfully.", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
