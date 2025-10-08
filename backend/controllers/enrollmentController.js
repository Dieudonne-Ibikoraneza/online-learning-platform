const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @desc    Enroll in a course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (Students)
const enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
      deletedAt: null,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: userId,
      course: courseId,
    });

    await enrollment.populate("course", "title instructor");

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private (Students)
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        select:
          "title description thumbnail instructor category difficulty price averageRating totalLessons totalDuration",
        populate: {
          path: "instructor",
          select: "name avatar",
        },
      })
      .sort("-enrolledAt");

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user is enrolled in a course
// @route   GET /api/courses/:courseId/enrollment-status
// @access  Private (Students)
const getEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    res.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentStatus,
};
