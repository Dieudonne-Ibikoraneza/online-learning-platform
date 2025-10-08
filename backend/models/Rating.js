const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot be more than 500 characters"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate ratings from same user for same course
ratingSchema.index({ user: 1, course: 1 }, { unique: true });

// Static method to get average rating and save to course
ratingSchema.statics.getAverageRating = async function (courseId) {
  const obj = await this.aggregate([
    {
      $match: { course: courseId, isActive: true },
    },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  try {
    const Course = mongoose.model("Course");
    if (obj.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: obj[0].totalRatings,
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        averageRating: 0,
        totalRatings: 0,
      });
    }
  } catch (err) {
    console.error("Error updating course rating:", err);
  }
};

// Call getAverageRating after save
ratingSchema.post("save", function () {
  this.constructor.getAverageRating(this.course);
});

// Call getAverageRating after remove (or soft delete)
ratingSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    doc.constructor.getAverageRating(doc.course);
  }
});

// Call getAverageRating after remove
ratingSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    doc.constructor.getAverageRating(doc.course);
  }
});

module.exports = mongoose.model("Rating", ratingSchema);
