const mongoose = require('mongoose');

const musicShareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },

  shareType: {
    type: String,
    enum: ['messages', 'social', 'friends', 'link'],
    required: true
  },

  platform: {
    type: String,
    enum: ['messages', 'facebook', 'twitter', 'instagram', 'tiktok', 'whatsapp', 'telegram', 'other'],
    default: 'other'
  },

  recipientUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  shareUrl: String,

  sharedAt: {
    type: Date,
    default: Date.now
  },

  // Analytics
  clicks: {
    type: Number,
    default: 0
  },

  playsFromShare: {
    type: Number,
    default: 0
  }
});

// Indexes
musicShareSchema.index({ userId: 1, sharedAt: -1 });
musicShareSchema.index({ songId: 1, sharedAt: -1 });
musicShareSchema.index({ shareType: 1, sharedAt: -1 });

module.exports = mongoose.model('MusicShare', musicShareSchema);