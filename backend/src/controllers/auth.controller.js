const AuthService = require("../services/auth.service");
const sendResponse = require("../utils/apiResponse");

class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      return sendResponse(res, 201, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  static async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyEmailOTP(email, otp);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/resend-otp
   */
  static async resendOTP(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerificationOTP(email);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.loginUser(req.body);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshAccessToken(refreshToken);
      return sendResponse(res, 200, "Access token refreshed successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.logoutUser(refreshToken);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout-all
   */
  static async logoutAll(req, res, next) {
    try {
      const result = await AuthService.logoutAllSessions(req.user.id);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const result = await AuthService.getCurrentUser(req.user.id);
      return sendResponse(res, 200, "User profile retrieved successfully.", result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
