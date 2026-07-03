const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middlewares/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions
// @access  Private/Admin
router.get('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const submissions = await Contact.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));
    
    res.status(200).json({ 
      success: true, 
      count: submissions.length, 
      data: submissions 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission
// @access  Private/Admin
router.get('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update submission status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { status, replyMessage } = req.body;
    
    const submission = await Contact.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    submission.status = status;
    if (status === 'replied') {
      submission.repliedAt = Date.now();
      if (replyMessage) submission.replyMessage = replyMessage;
    }
    
    await submission.save();
    
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    await submission.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;