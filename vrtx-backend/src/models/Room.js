const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    trim: true
  },
  icon: {
    type: String,
    default: '🛋️'
  },
  panorama: {
    type: String,
    required: [true, 'Please add a panorama image']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  dimensions: {
    type: String
  },
  features: [{
    type: String
  }],
  hotspots: [{
    pitch: Number,
    yaw: Number,
    type: { type: String, default: 'info' },
    text: String,
    linkUrl: String
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);