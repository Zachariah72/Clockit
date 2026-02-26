const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'story', 'comment', 'song'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for performance and uniqueness
likeSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);