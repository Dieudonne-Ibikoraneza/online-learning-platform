const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const ffmpeg = require('fluent-ffmpeg'); // We'll install this for video processing

// @desc    Upload promo video for course
// @route   PUT /api/courses/:id/promo-video
// @access  Private (Instructor/Admin)
const uploadPromoVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const course = await Course.findOne({ 
      _id: req.params.id, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    console.log('Uploading promo video to Cloudinary...', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary with video optimization
    const result = await cloudinary.uploader.upload(fileStr, {
      resource_type: 'video',
      folder: 'online-learning-platform/promo-videos',
      chunk_size: 6000000, // 6MB chunks
      eager: [
        { width: 1280, height: 720, crop: 'limit', format: 'mp4' },
        { width: 854, height: 480, crop: 'limit', format: 'mp4' },
        { width: 640, height: 360, crop: 'limit', format: 'mp4' }
      ],
      eager_async: true
    });

    console.log('Promo video uploaded successfully:', {
      public_id: result.public_id,
      url: result.secure_url,
      duration: result.duration
    });

    // Delete old promo video if exists
    if (course.promoVideo && course.promoVideo.public_id) {
      try {
        await cloudinary.uploader.destroy(course.promoVideo.public_id, { resource_type: 'video' });
        console.log('Old promo video deleted from Cloudinary');
      } catch (deleteError) {
        console.log('Error deleting old promo video:', deleteError.message);
      }
    }

    // Update course with new promo video
    course.promoVideo = {
      public_id: result.public_id,
      url: result.secure_url,
      duration: Math.round(result.duration || 0),
      originalName: req.file.originalname,
      size: req.file.size
    };

    await course.save();

    res.json({
      success: true,
      message: 'Promo video uploaded successfully',
      data: course
    });
  } catch (error) {
    console.error('Promo video upload error:', error);
    next(error);
  }
};

// @desc    Upload lesson video
// @route   PUT /api/courses/:courseId/lessons/:lessonId/video
// @access  Private (Instructor/Admin)
const uploadLessonVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const course = await Course.findOne({ 
      _id: req.params.courseId, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Find the lesson
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    console.log('Uploading lesson video to Cloudinary...', {
      lesson: lesson.title,
      originalName: req.file.originalname,
      size: req.file.size
    });

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, {
      resource_type: 'video',
      folder: 'online-learning-platform/lesson-videos',
      chunk_size: 6000000, // 6MB chunks
      eager: [
        { width: 1280, height: 720, crop: 'limit', format: 'mp4' },
        { width: 854, height: 480, crop: 'limit', format: 'mp4' }
      ],
      eager_async: true
    });

    console.log('Lesson video uploaded successfully:', {
      public_id: result.public_id,
      duration: result.duration
    });

    // Delete old video if exists
    if (lesson.video && lesson.video.public_id) {
      try {
        await cloudinary.uploader.destroy(lesson.video.public_id, { resource_type: 'video' });
      } catch (deleteError) {
        console.log('Error deleting old lesson video:', deleteError.message);
      }
    }

    // Update lesson with new video
    lesson.video = {
      public_id: result.public_id,
      url: result.secure_url,
      duration: Math.round(result.duration || 0),
      originalName: req.file.originalname,
      size: req.file.size
    };

    // Update lesson duration if not set
    if (!lesson.duration) {
      lesson.duration = Math.round(result.duration || 0);
    }

    await course.save();

    res.json({
      success: true,
      message: 'Lesson video uploaded successfully',
      data: course
    });
  } catch (error) {
    console.error('Lesson video upload error:', error);
    next(error);
  }
};

// @desc    Upload resource (PDF, document, etc.) to lesson
// @route   POST /api/courses/:courseId/lessons/:lessonId/resources
// @access  Private (Instructor/Admin)
const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    console.log('File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const course = await Course.findOne({ 
      _id: req.params.courseId, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Find the lesson
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const { name, type = 'document' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for the resource'
      });
    }

    console.log('Uploading resource to Cloudinary...', {
      name,
      type,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype
    });

    // Determine resource type and Cloudinary parameters
    let resourceType = 'auto';
    let folder = 'online-learning-platform/resources';
    
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
      folder = 'online-learning-platform/resource-images';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      folder = 'online-learning-platform/resource-videos';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
      folder = 'online-learning-platform/resource-pdfs';
    } else {
      // For other document types
      resourceType = 'raw';
      folder = 'online-learning-platform/resource-documents';
    }

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      // Add unique public_id to avoid conflicts
      public_id: `resource_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    // Add specific options for different file types
    if (resourceType === 'image') {
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
    } else if (resourceType === 'video') {
      uploadOptions.chunk_size = 7000000;
    }

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    console.log('Resource uploaded successfully:', {
      public_id: result.public_id,
      url: result.secure_url,
      resource_type: result.resource_type
    });

    // Create resource object
    const resource = {
      name,
      type,
      url: result.secure_url,
      public_id: result.public_id,
      size: req.file.size,
      order: lesson.resources.length
    };

    // Add duration for videos
    if (resourceType === 'video' && result.duration) {
      resource.duration = Math.round(result.duration);
    }

    // Add resource to lesson
    lesson.resources.push(resource);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      data: {
        course,
        resource: lesson.resources[lesson.resources.length - 1]
      }
    });
  } catch (error) {
    console.error('Resource upload error:', error);
    
    // Handle Cloudinary specific errors
    if (error.message && error.message.includes('Invalid image file')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Please upload a valid file.'
      });
    }
    
    next(error);
  }
};

// @desc    Delete resource from lesson
// @route   DELETE /api/courses/:courseId/lessons/:lessonId/resources/:resourceId
// @access  Private (Instructor/Admin)
const deleteResource = async (req, res, next) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.courseId, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Find the lesson
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Find the resource
    const resource = lesson.resources.id(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Delete from Cloudinary
    if (resource.public_id) {
      try {
        const resourceType = resource.type === 'pdf' ? 'raw' : resource.type;
        await cloudinary.uploader.destroy(resource.public_id, { 
          resource_type: resourceType 
        });
        console.log('Resource deleted from Cloudinary:', resource.public_id);
      } catch (deleteError) {
        console.log('Error deleting resource from Cloudinary:', deleteError.message);
      }
    }

    // Remove resource from lesson
    lesson.resources.pull(req.params.resourceId);
    await course.save();

    res.json({
      success: true,
      message: 'Resource deleted successfully',
      data: course
    });
  } catch (error) {
    console.error('Resource deletion error:', error);
    next(error);
  }
};

// @desc    Delete lesson video
// @route   DELETE /api/courses/:courseId/lessons/:lessonId/video
// @access  Private (Instructor/Admin)
const deleteLessonVideo = async (req, res, next) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.courseId, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Find the lesson
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Delete video from Cloudinary if exists
    if (lesson.video && lesson.video.public_id) {
      try {
        await cloudinary.uploader.destroy(lesson.video.public_id, { resource_type: 'video' });
        console.log('Lesson video deleted from Cloudinary');
      } catch (deleteError) {
        console.log('Error deleting lesson video:', deleteError.message);
      }
    }

    // Remove video from lesson
    lesson.video = undefined;
    await course.save();

    res.json({
      success: true,
      message: 'Lesson video deleted successfully',
      data: course
    });
  } catch (error) {
    console.error('Lesson video deletion error:', error);
    next(error);
  }
};

// @desc    Delete promo video
// @route   DELETE /api/courses/:id/promo-video
// @access  Private (Instructor/Admin)
const deletePromoVideo = async (req, res, next) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      deletedAt: null 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Delete promo video from Cloudinary if exists
    if (course.promoVideo && course.promoVideo.public_id) {
      try {
        await cloudinary.uploader.destroy(course.promoVideo.public_id, { resource_type: 'video' });
        console.log('Promo video deleted from Cloudinary');
      } catch (deleteError) {
        console.log('Error deleting promo video:', deleteError.message);
      }
    }

    // Remove promo video from course
    course.promoVideo = undefined;
    await course.save();

    res.json({
      success: true,
      message: 'Promo video deleted successfully',
      data: course
    });
  } catch (error) {
    console.error('Promo video deletion error:', error);
    next(error);
  }
};

module.exports = {
  uploadPromoVideo,
  uploadLessonVideo,
  uploadResource,
  deleteResource,
  deleteLessonVideo,
  deletePromoVideo
};