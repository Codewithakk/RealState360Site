const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');
const { upload,uploadMultiple } = require('../middlewares/uploads');

// @route   POST /api/upload/panorama
// @desc    Upload a panorama image
// @access  Private/Admin
router.post('/panorama', protect, authorize('admin', 'editor'), upload.single('panorama'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/panoramas/${req.file.filename}`;
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/upload/image
// @desc    Upload a regular image
// @access  Private/Admin
router.post('/image', protect, authorize('admin', 'editor'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/upload/gallery
// @desc    Upload multiple gallery images
// @access  Private/Admin
router.post('/gallery', protect, authorize('admin', 'editor'), upload.array('gallery', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const files = req.files.map(file => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/upload/video
// @desc    Upload a video
// @access  Private/Admin
router.post('/video', protect, authorize('admin', 'editor'), upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/videos/${req.file.filename}`;
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/upload/:type/:filename
// @desc    Delete an uploaded file
// @access  Private/Admin
router.delete('/:type/:filename', protect, authorize('admin'), (req, res) => {
  try {
    const { type, filename } = req.params;
    let filePath;
    
    switch(type) {
      case 'panorama':
        filePath = path.join(__dirname, '../../uploads/panoramas', filename);
        break;
      case 'image':
        filePath = path.join(__dirname, '../../uploads/images', filename);
        break;
      case 'video':
        filePath = path.join(__dirname, '../../uploads/videos', filename);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid file type' });
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;