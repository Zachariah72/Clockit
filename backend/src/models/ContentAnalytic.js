const mongoose = require('mongoose');

const contentAnalyticSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['video', 'story', 'post', 'music'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 }, // in seconds for videos
  completionRate: { type: Number, default: 0 }, // for stories/videos
  listens: { type: Number, default: 0 }, // for music
  saves: { type: Number, default: 0 }, // for music/playlists
  engagement: { type: Number, default: 0 }, // calculated field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContentAnalytic', contentAnalyticSchema);