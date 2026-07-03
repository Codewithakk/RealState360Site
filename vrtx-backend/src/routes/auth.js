const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middlewares/auth');

// @route   POST /api/auth/register
// @desc    Register user (admin only)
// @access  Private/Admin
router.post('/register', protect, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer'
    });
    
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

module.exports = router;