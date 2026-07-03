// models/House.js

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
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

    features: [
      {
        type: String
      }
    ],

    hotspots: [
      {
        pitch: Number,
        yaw: Number,

        type: {
          type: String,
          default: 'info'
        },

        text: String,

        linkUrl: String
      }
    ],

    order: {
      type: Number,
      default: 0
    }
  },
  {
    _id: true
  }
);

const houseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },

    subtitle: {
      type: String,
      required: [true, 'Please add a subtitle'],
      trim: true
    },

    location: {
      type: String,
      required: [true, 'Please add a location']
    },

    price: {
      type: String,
      required: [true, 'Please add a price']
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 0
    },

    bathrooms: {
      type: Number,
      required: true,
      min: 0
    },

    area: {
      type: String,
      required: true
    },

    year: {
      type: String
    },

    description: {
      type: String,
      required: [true, 'Please add a description']
    },

    longDescription: {
      type: String
    },

    features: [
      {
        type: String
      }
    ],

    image: {
      type: String,
      required: [true, 'Please add a cover image']
    },

    images: [
      {
        type: String
      }
    ],

    gallery: [
      {
        type: String
      }
    ],

    videoUrl: {
      type: String
    },

    panorama: {
      type: String
    },

    rooms: [roomSchema],

    isActive: {
      type: Boolean,
      default: true
    },

    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('House', houseSchema);