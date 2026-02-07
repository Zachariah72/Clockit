const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  duration: { type: Number }, // in seconds
  
  // Author info
  author: {
    username: { type: String, required: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Stats
  stats: {
    playCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 }
  },
  
  // Music info
  music: {
    title: { type: String },
    author: { type: String },
    duration: { type: Number }
  },
  
  // Upload metadata
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
videoSchema.index({ 'author.userId': 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Video', videoSchema);
