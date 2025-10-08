const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["pdf", "video", "image", "document", "link"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    public_id: String, // For Cloudinary files
    size: Number, // File size in bytes
    duration: Number, // For videos, in minutes
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a lesson title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add lesson content"],
    },
    video: {
      public_id: String,
      url: String,
      duration: Number, // in minutes
      originalName: String,
      size: Number,
    },
    resources: [resourceSchema],
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    // ... existing fields remain the same ...
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot be more than 200 characters"],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      public_id: String,
      url: String,
    },
    promoVideo: {
      public_id: String,
      url: String,
      duration: Number,
      originalName: String,
      size: Number,
    },
    lessons: [lessonSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number, // total course duration in minutes
      default: 0,
    },
    requirements: [String],
    learningOutcomes: [String],
    tags: [String],
    language: {
      type: String,
      default: "English",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for search functionality
courseSchema.index({
  title: "text",
  description: "text",
  shortDescription: "text",
  category: "text",
  tags: "text",
});

courseSchema.index({ favoriteCount: -1 });

// Calculate total lessons and duration before saving
courseSchema.pre("save", function (next) {
  this.totalLessons = this.lessons.length;
  this.totalDuration = this.lessons.reduce((total, lesson) => {
    return (
      total + (lesson.duration || (lesson.video ? lesson.video.duration : 0))
    );
  }, 0);
  next();
});

// Static method to get courses by instructor
courseSchema.statics.getByInstructor = function (instructorId) {
  return this.find({ instructor: instructorId, deletedAt: null });
};

module.exports = mongoose.model("Course", courseSchema);
