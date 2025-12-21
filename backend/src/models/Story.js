const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  mediaUrl: String,
  type: { type: String, enum: ['photo', 'video', 'text'], default: 'photo' },
  isPrivate: { type: Boolean, default: false },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);