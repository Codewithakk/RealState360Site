const mongoose = require('mongoose');

const webSettingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String, // image URL
      default: '',
    },

    favicon: {
      type: String,
      default: '',
    },

    aboutTitle: {
      type: String,
      default: '',
    },

    aboutDescription: {
      type: String,
      default: '',
    },

    aboutImage: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },

    website: {
      type: String,
      default: '',
    },

    facebook: {
      type: String,
      default: '',
    },

    instagram: {
      type: String,
      default: '',
    },

    twitter: {
      type: String,
      default: '',
    },

    linkedin: {
      type: String,
      default: '',
    },

    youtube: {
      type: String,
      default: '',
    },

    seoTitle: {
      type: String,
      default: '',
    },

    seoDescription: {
      type: String,
      default: '',
    },

    seoKeywords: {
      type: [String],
      default: [],
    },

    footerText: {
      type: String,
      default: '',
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WebSetting', webSettingSchema);