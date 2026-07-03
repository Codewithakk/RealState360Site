const express = require('express');
const router = express.Router();
const House = require('../models/House');
const Room = require('../models/Room');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [
      totalHouses,
      totalRooms,
      totalSubmissions,
      unreadSubmissions,
      totalViews,
      recentSubmissions
    ] = await Promise.all([
      House.countDocuments(),
      Room.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      House.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Contact.find().sort('-createdAt').limit(5)
    ]);
    
    // Get monthly views for chart
    const monthlyViews = await House.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          views: { $sum: '$views' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get service distribution
    const serviceDistribution = await Contact.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalHouses,
        totalRooms,
        totalSubmissions,
        unreadSubmissions,
        totalViews: totalViews[0]?.total || 0,
        recentSubmissions,
        monthlyViews,
        serviceDistribution
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;