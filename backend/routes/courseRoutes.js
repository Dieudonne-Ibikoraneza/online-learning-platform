const express = require("express");
const {
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
} = require("../controllers/courseController");
const {
  uploadPromoVideo,
  uploadLessonVideo,
  uploadResource,
  deleteResource,
  deleteLessonVideo,
  deletePromoVideo,
} = require("../controllers/mediaController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  uploadThumbnail: thumbnailUpload,
  uploadVideo,
  uploadResource: resourceUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse);

// All routes below are protected
router.use(protect);

// Instructor/Admin routes
router.post("/", authorize("instructor", "admin"), createCourse);
router.get(
  "/instructor/my-courses",
  authorize("instructor", "admin"),
  getInstructorCourses
);

// Course management routes
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.put("/:id/publish", togglePublishCourse);
router.put(
  "/:id/thumbnail",
  thumbnailUpload.single("thumbnail"),
  uploadThumbnail
);

// Promo video routes
router.put("/:id/promo-video", uploadVideo.single("video"), uploadPromoVideo);
router.delete("/:id/promo-video", deletePromoVideo);

// Lesson management routes
router.post("/:id/lessons", addLesson);
router.put("/:id/lessons/:lessonId", updateLesson);
router.delete("/:id/lessons/:lessonId", deleteLesson);

// Lesson video routes
router.put(
  "/:courseId/lessons/:lessonId/video",
  uploadVideo.single("video"),
  uploadLessonVideo
);
router.delete("/:courseId/lessons/:lessonId/video", deleteLessonVideo);

// Resource routes
router.post(
  "/:courseId/lessons/:lessonId/resources",
  resourceUpload.single("resource"),
  uploadResource
);
router.delete(
  "/:courseId/lessons/:lessonId/resources/:resourceId",
  deleteResource
);

module.exports = router;
