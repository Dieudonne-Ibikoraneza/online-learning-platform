const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Course = require("./models/Course");
const connectDB = require("./config/db");
async function migrateFavoriteCounts() {
  try {
    console.log("🔄 Starting favorite counts migration...\n");

    // Connect to database
    await connectDB();

    // Get all courses
    const courses = await Course.find({ deletedAt: null });

    console.log(`📚 Found ${courses.length} courses to update\n`);

    let updatedCount = 0;

    for (const course of courses) {
      // Count users who have this course in favorites
      const favoriteCount = await User.countDocuments({
        favorites: course._id,
      });

      // Update course if count has changed
      if (course.favoriteCount !== favoriteCount) {
        await Course.findByIdAndUpdate(course._id, {
          favoriteCount: favoriteCount,
        });

        console.log(
          `✅ Updated ${course.title}: ${course.favoriteCount} → ${favoriteCount}`
        );
        updatedCount++;
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updatedCount} courses`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}
migrateFavoriteCounts();
