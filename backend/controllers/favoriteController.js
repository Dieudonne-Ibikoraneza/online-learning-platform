const User = require("../models/User");
const Course = require("../models/Course");

// Helper function to update favorite count for a course
const updateFavoriteCount = async (courseId) => {
  try {
    const favoriteCount = await User.countDocuments({
      favorites: courseId,
    });

    await Course.findByIdAndUpdate(courseId, {
      favoriteCount: favoriteCount,
    });

    console.log(
      `✅ Updated favorite count for course ${courseId}: ${favoriteCount}`
    );
  } catch (error) {
    console.error("Error updating favorite count:", error);
  }
};

// @desc    Add/Remove course from favorites
// @route   POST /api/favorites/courses/:courseId/toggle
// @access  Private (Students)
const toggleFavorite = async (req, res, next) => {
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

    const user = await User.findById(userId);

    // Check if course is already in favorites
    const isFavorite = user.favorites.includes(courseId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites.pull(courseId);
      await user.save();

      // Update favorite count
      await updateFavoriteCount(courseId);

      res.json({
        success: true,
        message: "Course removed from favorites",
        data: {
          isFavorite: false,
          course: {
            _id: course._id,
            title: course.title,
          },
        },
      });
    } else {
      // Add to favorites
      user.favorites.push(courseId);
      await user.save();

      // Update favorite count
      await updateFavoriteCount(courseId);

      res.json({
        success: true,
        message: "Course added to favorites",
        data: {
          isFavorite: true,
          course: {
            _id: course._id,
            title: course.title,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite courses
// @route   GET /api/favorites
// @access  Private (Students)
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      match: {
        isPublished: true,
        deletedAt: null,
      },
      select:
        "title description thumbnail instructor category difficulty price averageRating totalRatings totalStudents totalDuration favoriteCount",
      populate: {
        path: "instructor",
        select: "name avatar",
      },
    });

    // Filter out any null courses (in case of deleted courses still in favorites)
    const validFavorites = user.favorites.filter((course) => course !== null);

    res.json({
      success: true,
      count: validFavorites.length,
      data: validFavorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a course is in user's favorites
// @route   GET /api/favorites/courses/:courseId/status
// @access  Private (Students)
const getFavoriteStatus = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(courseId);

    res.json({
      success: true,
      data: {
        isFavorite,
        courseId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove course from favorites
// @route   DELETE /api/favorites/courses/:courseId
// @access  Private (Students)
const removeFavorite = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const user = await User.findById(userId);

    // Check if course is in favorites
    if (!user.favorites.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is not in your favorites",
      });
    }

    // Remove from favorites
    user.favorites.pull(courseId);
    await user.save();

    // Update favorite count
    await updateFavoriteCount(courseId);

    res.json({
      success: true,
      message: "Course removed from favorites",
      data: {
        courseId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all favorites
// @route   DELETE /api/favorites
// @access  Private (Students)
const clearFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Get all course IDs that will be removed
    const courseIds = user.favorites;

    user.favorites = [];
    await user.save();

    // Update favorite counts for all affected courses
    for (const courseId of courseIds) {
      await updateFavoriteCount(courseId);
    }

    res.json({
      success: true,
      message: "All favorites cleared",
      data: {
        clearedCount: courseIds.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  getFavoriteStatus,
  removeFavorite,
  clearFavorites,
};
