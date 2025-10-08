const express = require("express");
const {
  toggleFavorite,
  getFavorites,
  getFavoriteStatus,
  removeFavorite,
  clearFavorites,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

// Toggle favorite status
router.post("/courses/:courseId/toggle", toggleFavorite);

// Get favorite status for a specific course
router.get("/courses/:courseId/status", getFavoriteStatus);

// Get all favorites
router.get("/", getFavorites);

// Remove specific course from favorites
router.delete("/courses/:courseId", removeFavorite);

// Clear all favorites
router.delete("/", clearFavorites);

module.exports = router;
