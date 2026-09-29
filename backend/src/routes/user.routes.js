const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const authenticateJWT = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// All user endpoints require authentication
router.get("/profile", authenticateJWT, UserController.getProfile);
router.put("/profile", authenticateJWT, UserController.updateProfile);
router.patch("/profile", authenticateJWT, UserController.updateProfile);
router.post("/change-password", authenticateJWT, UserController.changePassword);

// Profile image upload (multipart/form-data)
router.post(
  "/profile/upload-image",
  authenticateJWT,
  upload.single("profileImage"),
  UserController.uploadProfileImage
);

// Remove profile image
router.delete("/profile/remove-image", authenticateJWT, UserController.removeProfileImage);

module.exports = router;
