const express = require('express');
const router = express.Router();
const { uploadResource, handleMulterError } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');

// @desc    Upload resource (image/video/pdf) to Cloudinary
// @route   POST /api/upload/resource
// @access  Private
router.post(
    '/resource',
    protect,
    uploadResource.single('image') || uploadResource.single('video') || uploadResource.single('pdf'),
    handleMulterError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a file',
                });
            }

            const file = req.file;

            // Determine resource type and folder based on mimetype
            let folder;
            let resourceType = 'auto';

            if (file.mimetype.startsWith('image/')) {
                folder = 'online-learning-platform/resources/images';
                resourceType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                folder = 'online-learning-platform/resources/videos';
                resourceType = 'video';
            } else if (file.mimetype === 'application/pdf') {
                folder = 'online-learning-platform/resources/documents';
                resourceType = 'raw'; // For PDFs
            } else {
                folder = 'online-learning-platform/resources/documents';
                resourceType = 'raw'; // For other documents
            }

            // Convert buffer to base64 for Cloudinary
            const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

            // Upload to Cloudinary with appropriate settings
            const uploadOptions = {
                folder: folder,
                resource_type: resourceType,
            };

            // Add quality optimization for images
            if (resourceType === 'image') {
                uploadOptions.quality = 'auto';
                uploadOptions.fetch_format = 'auto';
            }

            const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

            res.json({
                success: true,
                message: 'Resource uploaded successfully',
                data: {
                    public_id: result.public_id,
                    url: result.url,
                    secure_url: result.secure_url,
                    resource_type: resourceType === 'raw' ? 'pdf' : resourceType,
                    format: result.format,
                    bytes: result.bytes,
                },
            });
        } catch (error) {
            console.error('Resource upload error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload resource',
            });
        }
    }
);

module.exports = router;