const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const House = require('../models/House');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/rooms/house/:houseId
// @desc    Get all rooms for a house
// @access  Public
router.get('/house/:houseId', async (req, res) => {
  try {
    const rooms = await Room.find({ houseId: req.params.houseId }).sort('order');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('houseId', 'title');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    // Check if house exists
    const house = await House.findById(req.body.houseId);
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }
    
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;