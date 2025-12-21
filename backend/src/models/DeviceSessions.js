const mongoose = require('mongoose');

const deviceSessionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  deviceId: {
    type: String,
    required: true
  },

  deviceInfo: {
    name: String,
    model: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'desktop']
    },
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String,
    userAgent: String
  },

  location: {
    ip: String,
    country: String,
    city: String,
    timezone: String
  },

  sessionToken: {
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastActivity: {
    type: Date,
    default: Date.now
  },

  loginTime: {
    type: Date,
    default: Date.now
  },

  logoutTime: Date,

  isCurrentDevice: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for user + device
deviceSessionsSchema.index({ userId: 1, deviceId: 1 });
deviceSessionsSchema.index({ sessionToken: 1 });
deviceSessionsSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('DeviceSessions', deviceSessionsSchema);