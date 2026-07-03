const express = require('express');
const router = express.Router();

const WebSetting = require('../models/WebSetting');
const { protect } = require('../middlewares/auth');

//
// @route   GET /api/web-settings
// @desc    Get website settings
// @access  Public
//
router.get('/', async (req, res) => {
  try {
    const settings = await WebSetting.findOne();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//
// @route   POST /api/web-settings
// @desc    Create website settings
// @access  Private/Admin
//
router.post('/', protect, async (req, res) => {
  try {
    // Check if settings already exist
    const exists = await WebSetting.findOne();

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Web settings already exist',
      });
    }

    const settings = await WebSetting.create(req.body);

    res.status(201).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

//
// @route   PUT /api/web-settings/:id
// @desc    Update website settings
// @access  Private/Admin
//
router.put('/:id', protect, async (req, res) => {
  try {
    const settings = await WebSetting.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

//
// @route   DELETE /api/web-settings/:id
// @desc    Delete settings
// @access  Private/Admin
//
router.delete('/:id', protect, async (req, res) => {
  try {
    const settings = await WebSetting.findById(req.params.id);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    await settings.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Settings deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/', protect, async (req, res) => {
    try {
      const settings = await WebSetting.findOneAndUpdate(
        {},
        req.body,
        {
          new: true,
          upsert: true,
        }
      );
  
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });

  
module.exports = router;