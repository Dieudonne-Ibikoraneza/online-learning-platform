const express = require("express");
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentStatus,
} = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/courses/:courseId/enroll", enrollInCourse);
router.get("/my-courses", getMyEnrollments);
router.get("/courses/:courseId/enrollment-status", getEnrollmentStatus);

module.exports = router;
