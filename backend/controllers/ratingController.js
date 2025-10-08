const Rating = require("../models/Rating");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");

// @desc    Get ratings for a course
// @route   GET /api/courses/:courseId/ratings
// @access  Public
const getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({
      course: req.params.courseId,
      isActive: true,
    })
      .populate("user", "name avatar")
      .sort("-createdAt");

    res.json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add rating and comment to course
// @route   POST /api/courses/:courseId/ratings
// @access  Private (Students)
const addRating = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5",
      });
    }

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

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to rate it",
      });
    }

    // Check if user already rated this course
    const existingRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message:
          "You have already rated this course. You can update your existing rating.",
      });
    }

    // Create rating
    const newRating = await Rating.create({
      user: userId,
      course: courseId,
      rating,
      comment: comment || "",
    });

    // Populate user details
    await newRating.populate("user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Rating added successfully",
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rating and comment
// @route   PUT /api/ratings/:id
// @access  Private (Rating owner)
const updateRating = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    let ratingDoc = await Rating.findById(req.params.id);

    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    // Check if user owns the rating
    if (ratingDoc.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this rating",
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5",
      });
    }

    // Update fields
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    ratingDoc = await Rating.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name avatar");

    res.json({
      success: true,
      message: "Rating updated successfully",
      data: ratingDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rating (soft delete)
// @route   DELETE /api/ratings/:id
// @access  Private (Rating owner or Admin)
const deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    // Check if user owns the rating or is admin
    if (rating.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this rating",
      });
    }

    // Soft delete
    rating.isActive = false;
    await rating.save();

    res.json({
      success: true,
      message: "Rating deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's rating for a specific course
// @route   GET /api/courses/:courseId/my-rating
// @access  Private (Students)
const getMyRating = async (req, res, next) => {
  try {
    const rating = await Rating.findOne({
      user: req.user.id,
      course: req.params.courseId,
      isActive: true,
    }).populate("user", "name avatar");

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "You have not rated this course yet",
      });
    }

    res.json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ratings (Admin only)
// @route   GET /api/ratings
// @access  Private (Admin)
const getAllRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find()
      .populate("user", "name email")
      .populate("course", "title")
      .sort("-createdAt");

    res.json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rating statistics for a course
// @route   GET /api/courses/:courseId/rating-stats
// @access  Public
const getRatingStats = async (req, res, next) => {
  try {
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const stats = await Rating.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(req.params.courseId), // Use new keyword
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Calculate distribution
    const totalRatings = stats.reduce((sum, stat) => sum + stat.count, 0);
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    stats.forEach((stat) => {
      distribution[stat._id] = stat.count;
    });

    // Get course for average rating
    const course = await Course.findById(req.params.courseId).select(
      "averageRating totalRatings"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: {
        averageRating: course.averageRating || 0,
        totalRatings: course.totalRatings || 0,
        distribution,
        percentages: {
          1:
            totalRatings > 0
              ? Math.round((distribution[1] / totalRatings) * 100)
              : 0,
          2:
            totalRatings > 0
              ? Math.round((distribution[2] / totalRatings) * 100)
              : 0,
          3:
            totalRatings > 0
              ? Math.round((distribution[3] / totalRatings) * 100)
              : 0,
          4:
            totalRatings > 0
              ? Math.round((distribution[4] / totalRatings) * 100)
              : 0,
          5:
            totalRatings > 0
              ? Math.round((distribution[5] / totalRatings) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Rating stats error:", error);
    next(error);
  }
};

module.exports = {
  getRatings,
  addRating,
  updateRating,
  deleteRating,
  getMyRating,
  getAllRatings,
  getRatingStats,
};
