// ============================================================
//  PadosiPro - User API Endpoints
// ============================================================

import { apiClient, getBaseUrl } from "./client";
import { tokenStorage } from "../services/tokenStorage";

export const userApi = {
  /**
   * GET /users/profile
   */
  getProfile: () => apiClient.get("/users/profile"),

  /**
   * PUT /users/profile
   */
  updateProfile: (profileData) => apiClient.put("/users/profile", profileData),

  /**
   * POST /users/change-password
   */
  changePassword: ({ currentPassword, newPassword }) =>
    apiClient.post("/users/change-password", { currentPassword, newPassword }),

  /**
   * POST /users/profile/upload-image
   * Uploads profile image using multipart/form-data
   */
  uploadProfileImage: async (imageUri) => {
    const token = await tokenStorage.getAccessToken();

    const formData = new FormData();
    // Extract filename and type from URI
    const uriParts = imageUri.split("/");
    const fileName = uriParts[uriParts.length - 1];
    const ext = fileName.split(".").pop().toLowerCase();
    const mimeType =
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      ext === "gif" ? "image/gif" :
      "image/jpeg";

    formData.append("profileImage", {
      uri: imageUri,
      name: fileName || `profile_${Date.now()}.jpg`,
      type: mimeType,
    });

    const response = await fetch(`${getBaseUrl()}/users/profile/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Do NOT set Content-Type for FormData — fetch handles it
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data?.message || "Failed to upload image");
      err.status = response.status;
      throw err;
    }
    return data;
  },

  /**
   * DELETE /users/profile/remove-image
   */
  removeProfileImage: () => apiClient.delete("/users/profile/remove-image"),
};
