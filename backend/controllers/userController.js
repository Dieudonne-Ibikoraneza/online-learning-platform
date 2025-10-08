const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or account has been deleted",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // First check if user exists and is not deleted
    const existingUser = await User.findOne({
      _id: req.user.id,
      deletedAt: null,
    });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or account has been deleted",
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    console.log("Upload avatar request received:", {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      mimetype: req.file?.mimetype,
      user: req.user.id,
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    // Check if file has buffer (memory storage)
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file is empty or corrupted",
      });
    }

    console.log("Uploading to Cloudinary from memory buffer...");

    try {
      // Convert buffer to base64 for Cloudinary upload
      const fileStr = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      // Upload to Cloudinary using base64 string
      const result = await cloudinary.uploader.upload(fileStr, {
        folder: "online-learning-platform/avatars",
        width: 500,
        height: 500,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      });

      console.log("Cloudinary upload successful:", {
        public_id: result.public_id,
        url: result.secure_url,
      });

      // Get current user to check for existing avatar
      const currentUser = await User.findById(req.user.id);

      // Delete old avatar from Cloudinary if exists
      if (currentUser.avatar && currentUser.avatar.public_id) {
        try {
          await cloudinary.uploader.destroy(currentUser.avatar.public_id);
          console.log(
            "✅ Old avatar deleted from Cloudinary:",
            currentUser.avatar.public_id
          );
        } catch (deleteError) {
          console.log(
            "⚠️ Error deleting old avatar (might not exist):",
            deleteError.message
          );
          // Continue with update even if old avatar deletion fails
        }
      }

      // Update user with new avatar
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          avatar: {
            public_id: result.public_id, // Store public_id for future management
            url: result.secure_url,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      console.log("✅ User avatar updated in database");

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        data: user,
      });
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary upload error:", cloudinaryError);

      return res.status(500).json({
        success: false,
        message:
          "Error uploading image to Cloudinary: " + cloudinaryError.message,
      });
    }
  } catch (error) {
    console.error("❌ Avatar upload general error:", error);
    next(error);
  }
};

// @desc    Delete avatar
// @route   DELETE /api/users/avatar
// @access  Private
const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.avatar && user.avatar.public_id) {
      try {
        // Delete image from Cloudinary using the public_id
        const deleteResult = await cloudinary.uploader.destroy(
          user.avatar.public_id
        );
        console.log(
          "✅ Avatar deleted from Cloudinary:",
          user.avatar.public_id,
          deleteResult
        );
      } catch (deleteError) {
        console.log(
          "⚠️ Error deleting avatar from Cloudinary:",
          deleteError.message
        );
        // Continue even if Cloudinary deletion fails
      }

      // Remove avatar from user in database
      user.avatar = undefined;
      await user.save();

      console.log("✅ Avatar removed from user profile");
    } else {
      console.log("ℹ️ No avatar found to delete");
    }

    res.json({
      success: true,
      message: "Avatar deleted successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Delete avatar error:", error);
    next(error);
  }
};

// @desc    Delete my account (soft delete)
// @route   DELETE /api/users/profile
// @access  Private
const deleteMyAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's favorites before deletion
    const userFavorites = user.favorites;

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Soft delete - set deletedAt and isActive, but keep email and password unchanged
    user.isActive = false;
    user.deletedAt = new Date();

    // Clear personal data but keep email and password for identification
    user.name = `Deleted User`;
    user.avatar = undefined;
    user.bio = undefined;
    user.favorites = []; // Clear favorites

    await user.save();

    // Update favorite counts for all courses that were in user's favorites
    const { updateFavoriteCount } = require("./favoriteController");
    for (const courseId of userFavorites) {
      await updateFavoriteCount(courseId);
    }

    res.json({
      success: true,
      message: "Your account has been deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only) - including deleted ones
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    // Get ALL users including deleted ones (no filtering)
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only) - can see deleted users
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    // Remove the default query to find even deleted users
    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get only active users (for non-admin queries)
const getActiveUsers = async () => {
  return await User.find({ deletedAt: null }).select("-password");
};

// Helper function to get user by ID (active only)
const getActiveUserById = async (id) => {
  return await User.findOne({ _id: id, deletedAt: null }).select("-password");
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user permanently (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted permanently",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore deleted account (Admin only)
// @route   PUT /api/users/:id/restore
// @access  Private/Admin
const restoreUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Restore the user
    user.isActive = true;
    user.deletedAt = null;

    await user.save();

    res.json({
      success: true,
      message: "User account restored successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  deleteMyAccount,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  restoreUser,
};
