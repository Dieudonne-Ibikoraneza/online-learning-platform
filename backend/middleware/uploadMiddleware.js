const multer = require("multer");

// Use memory storage for all files
const storage = multer.memoryStorage();

// Enhanced file filter for images, videos, and PDFs
const fileFilter = (req, file, cb) => {
  // Check if the file is an image, video, or PDF
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, videos, and PDF files are allowed!"), false);
  }
};

// Create different upload configurations for different file types
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Specific configuration for avatars (smaller files)
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatars!"), false);
    }
  },
});

// Configuration for thumbnails
const uploadThumbnail = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for thumbnails
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for thumbnails!"), false);
    }
  },
});

// Configuration for videos (larger files)
const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  },
});

// Configuration for PDFs and resources
const uploadResource = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 50MB for PDFs/resources
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("application/pdf") ||
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, image, and video files are allowed for resources!"
        ),
        false
      );
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. ${error.message}`,
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field or too many files",
      });
    }
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
};

module.exports = {
  upload,
  uploadAvatar,
  uploadThumbnail,
  uploadVideo,
  uploadResource,
  handleMulterError,
};
