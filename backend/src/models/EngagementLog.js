const mongoose = require('mongoose');

const engagementLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, required: true },
  action: { type: String, enum: ['view', 'like', 'comment', 'share', 'listen', 'save', 'follow', 'message', 'call'], required: true },
  duration: { type: Number, default: 0 }, // for watch time, call duration, etc.
  metadata: Object, // additional data like country, device, etc.
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EngagementLog', engagementLogSchema);