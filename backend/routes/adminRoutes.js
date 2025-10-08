const express = require("express");
const {
  getDashboardStats,
  getUsers,
  getCourses,
  toggleCoursePublish,
  deleteCourse,
  updateUserRole,
  toggleUserActive,
  getEnrollmentStats,
  getRevenueStats,
  getSystemAnalytics,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard routes
router.get("/dashboard", getDashboardStats);
router.get("/analytics", getSystemAnalytics);

// User management
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/toggle-active", toggleUserActive);

// Course management
router.get("/courses", getCourses);
router.put("/courses/:id/toggle-publish", toggleCoursePublish);
router.delete("/courses/:id", deleteCourse);

// Statistics
router.get("/enrollments/stats", getEnrollmentStats);
router.get("/revenue/stats", getRevenueStats);

module.exports = router;
