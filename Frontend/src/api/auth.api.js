// ============================================================
//  PadosiPro - Auth API Endpoints
// ============================================================

import { apiClient } from "./client";

export const authApi = {
  /**
   * POST /auth/register
   */
  register: ({ fullName, email, phone, password }) =>
    apiClient.post("/auth/register", { fullName, email, phone, password }),

  /**
   * POST /auth/verify-otp
   */
  verifyOTP: ({ email, otp }) =>
    apiClient.post("/auth/verify-otp", { email, otp }),

  /**
   * POST /auth/resend-otp
   */
  resendOTP: ({ email }) =>
    apiClient.post("/auth/resend-otp", { email }),

  /**
   * POST /auth/login
   */
  login: ({ email, password }) =>
    apiClient.post("/auth/login", { email, password }),

  /**
   * POST /auth/refresh
   */
  refresh: ({ refreshToken }) =>
    apiClient.post("/auth/refresh", { refreshToken }),

  /**
   * POST /auth/logout
   */
  logout: ({ refreshToken }) =>
    apiClient.post("/auth/logout", { refreshToken }),

  /**
   * POST /auth/logout-all
   */
  logoutAll: () =>
    apiClient.post("/auth/logout-all"),

  /**
   * GET /auth/me
   */
  getMe: () =>
    apiClient.get("/auth/me"),

  /**
   * POST /auth/forgot-password
   */
  forgotPassword: ({ email }) =>
    apiClient.post("/auth/forgot-password", { email }),

  /**
   * POST /auth/reset-password
   */
  resetPassword: ({ token, newPassword }) =>
    apiClient.post("/auth/reset-password", { token, newPassword }),
};
