const express = require("express");
const {
  getRatings,
  addRating,
  updateRating,
  deleteRating,
  getMyRating,
  getAllRatings,
  getRatingStats,
} = require("../controllers/ratingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/courses/:courseId/ratings", getRatings);
router.get("/courses/:courseId/rating-stats", getRatingStats);

// All routes below are protected
router.use(protect);

// Student routes
router.post("/courses/:courseId/ratings", addRating);
router.get("/courses/:courseId/my-rating", getMyRating);
router.put("/ratings/:id", updateRating);
router.delete("/ratings/:id", deleteRating);

// Admin only routes
router.get("/", authorize("admin"), getAllRatings);

module.exports = router;
