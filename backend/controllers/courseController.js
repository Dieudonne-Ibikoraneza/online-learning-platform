const Course = require("../models/Course");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc    Get all courses (with filtering, sorting, pagination)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit", "search"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Only show published courses that are not deleted
    let query = Course.find({
      ...reqQuery,
      isPublished: true,
      deletedAt: null,
    }).populate("instructor", "name email avatar");

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search },
      });
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Course.countDocuments({
      isPublished: true,
      deletedAt: null,
    });

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const courses = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.json({
      success: true,
      count: courses.length,
      pagination,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate("instructor", "name email avatar bio");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res, next) => {
  try {
    // Add instructor to req.body
    req.body.instructor = req.user.id;

    // Check if user is instructor or admin
    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructors and admins can create courses",
      });
    }

    const course = await Course.create(req.body);

    // Populate instructor details
    await course.populate("instructor", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email avatar");

    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    // Remove this course from all users' favorites
    await User.updateMany(
      { favorites: req.params.id },
      { $pull: { favorites: req.params.id } }
    );

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

// @desc    Upload course thumbnail
// @route   PUT /api/courses/:id/thumbnail
// @access  Private (Instructor/Admin)
const uploadThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: "online-learning-platform/thumbnails",
      width: 800,
      height: 450,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    });

    // Delete old thumbnail if exists
    if (course.thumbnail && course.thumbnail.public_id) {
      try {
        await cloudinary.uploader.destroy(course.thumbnail.public_id);
      } catch (deleteError) {
        console.log("Error deleting old thumbnail:", deleteError.message);
      }
    }

    // Update course with new thumbnail
    course.thumbnail = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await course.save();

    res.json({
      success: true,
      message: "Thumbnail uploaded successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor/Admin)
const getInstructorCourses = async (req, res, next) => {
  try {
    // Check if user is instructor or admin
    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructors and admins can access this route",
      });
    }

    const courses = await Course.find({
      instructor: req.user.id,
      deletedAt: null,
    })
      .populate("instructor", "name email avatar")
      .sort("-createdAt");

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Instructor/Admin)
const togglePublishCourse = async (req, res, next) => {
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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
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

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Private (Instructor/Admin)
const addLesson = async (req, res, next) => {
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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Add lesson to course
    course.lessons.push(req.body);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/courses/:id/lessons/:lessonId
// @access  Private (Instructor/Admin)
const updateLesson = async (req, res, next) => {
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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson._id.toString() === req.params.lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Update lesson fields including resources
    course.lessons[lessonIndex] = {
      ...course.lessons[lessonIndex].toObject(),
      ...req.body,
      // Resources will be included in req.body if sent from frontend
    };

    console.log(
      "Updated lesson resources:",
      course.lessons[lessonIndex].resources
    );

    await course.save();
    await course.populate("instructor", "name email avatar");

    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/courses/:id/lessons/:lessonId
// @access  Private (Instructor/Admin)
const deleteLesson = async (req, res, next) => {
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

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Remove lesson
    course.lessons = course.lessons.filter(
      (lesson) => lesson._id.toString() !== req.params.lessonId
    );

    await course.save();

    res.json({
      success: true,
      message: "Lesson deleted successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  getInstructorCourses,
  togglePublishCourse,
  addLesson,
  updateLesson,
  deleteLesson,
};
