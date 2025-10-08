const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Rating = require("../models/Rating");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const totalCourses = await Course.countDocuments({ deletedAt: null });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRatings = await Rating.countDocuments({ isActive: true });

    // Get user counts by role
    const userCountsByRole = await User.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get course counts by status and category
    const courseCountsByStatus = await Course.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$isPublished",
          count: { $sum: 1 },
        },
      },
    ]);

    const courseCountsByCategory = await Course.aggregate([
      { $match: { deletedAt: null, isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(10);

    // Get top rated courses
    const topRatedCourses = await Course.find({
      isPublished: true,
      deletedAt: null,
      averageRating: { $gte: 4 },
    })
      .populate("instructor", "name")
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(10);

    // Get enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$enrolledAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Calculate revenue (if you had payment integration)
    const totalRevenue = 0; // Placeholder for future payment integration

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalRatings,
          totalRevenue,
        },
        userStats: {
          byRole: userCountsByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          totalActive: totalUsers,
        },
        courseStats: {
          byStatus: courseCountsByStatus.reduce((acc, item) => {
            acc[item._id ? "published" : "draft"] = item.count;
            return acc;
          }, {}),
          byCategory: courseCountsByCategory,
        },
        recentActivity: {
          enrollments: recentEnrollments,
          topRatedCourses,
        },
        trends: {
          enrollments: enrollmentTrends,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const role = req.query.role;
    const search = req.query.search;

    // Build query
    let query = { deletedAt: null };

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses with admin filters
// @route   GET /api/admin/courses
// @access  Private (Admin)
const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page, 10) || 10;
    const status = req.query.status; // 'published', 'draft', 'all'
    const category = req.query.category;
    const search = req.query.search;

    // Build query
    let query = { deletedAt: null };

    if (status && status !== "all") {
      query.isPublished = status === "published";
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Course.countDocuments(query);

    // Get unique categories for filter
    const categories = await Course.distinct("category", { deletedAt: null });

    res.json({
      success: true,
      data: courses,
      filters: {
        categories,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle course publish status (admin override)
// @route   PUT /api/admin/courses/:id/toggle-publish
// @access  Private (Admin)
const toggleCoursePublish = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${
        course.isPublished ? "published" : "unpublished"
      } successfully`,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (admin override)
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Soft delete
    course.deletedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: "Course deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be student, instructor, or admin",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin)
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollment statistics
// @route   GET /api/admin/enrollments/stats
// @access  Private (Admin)
const getEnrollmentStats = async (req, res, next) => {
  try {
    const period = req.query.period || "month"; // day, week, month, year

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "day":
        dateFilter = {
          enrolledAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
        };
        break;
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { enrolledAt: { $gte: weekAgo } };
        break;
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { enrolledAt: { $gte: monthAgo } };
        break;
      case "year":
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        dateFilter = { enrolledAt: { $gte: yearAgo } };
        break;
    }

    const totalEnrollments = await Enrollment.countDocuments();
    const periodEnrollments = await Enrollment.countDocuments(dateFilter);

    // Top enrolled courses
    const topEnrolledCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: "$course",
          enrollments: { $sum: 1 },
        },
      },
      {
        $sort: { enrollments: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          "course.title": 1,
          "course.instructor": 1,
          "course.category": 1,
          enrollments: 1,
        },
      },
    ]);

    // Enrollment growth
    const enrollmentGrowth = await Enrollment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.json({
      success: true,
      data: {
        totalEnrollments,
        periodEnrollments,
        period,
        topEnrolledCourses,
        enrollmentGrowth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue statistics (placeholder for payment integration)
// @route   GET /api/admin/revenue/stats
// @access  Private (Admin)
const getRevenueStats = async (req, res, next) => {
  try {
    // Placeholder data - integrate with payment system later
    const revenueData = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      topGrossingCourses: [],
      revenueTrend: [],
    };

    res.json({
      success: true,
      data: revenueData,
      message: "Revenue tracking will be available after payment integration",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getSystemAnalytics = async (req, res, next) => {
  try {
    // User growth
    const userGrowth = await User.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Course growth
    const courseGrowth = await Course.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Platform engagement
    const avgRating = await Rating.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
        },
      },
    ]);

    const totalCourseDuration = await Course.aggregate([
      { $match: { deletedAt: null, isPublished: true } },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$totalDuration" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        courseGrowth,
        engagement: {
          averageRating: avgRating[0]?.average || 0,
          totalCourseHours: Math.round(
            (totalCourseDuration[0]?.totalDuration || 0) / 60
          ),
          totalEnrollments: await Enrollment.countDocuments(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};