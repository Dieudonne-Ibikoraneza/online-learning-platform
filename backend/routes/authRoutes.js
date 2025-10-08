const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updateDetails,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.post("/logout", logout);
router.get("/me", getMe);
router.put("/updatedetails", updateDetails);
router.put("/updatepassword", updatePassword);

module.exports = router;
