const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  deleteMyAccount,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  restoreUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload, handleMulterError } = require("../middleware/uploadMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes - accessible to all authenticated users
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post(
  "/avatar",
  upload.single("avatar"),
  handleMulterError,
  uploadAvatar
);
router.delete("/avatar", deleteAvatar);
router.delete("/profile", deleteMyAccount);

// Admin only routes
router.use(authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/restore", restoreUser);

module.exports = router;
