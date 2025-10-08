const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        lessonId: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update course total enrollments when enrollment is created
enrollmentSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  const enrollmentCount = await this.constructor.countDocuments({
    course: this.course,
  });

  await Course.findByIdAndUpdate(this.course, {
    totalEnrollments: enrollmentCount,
  });
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
