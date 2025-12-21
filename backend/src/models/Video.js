const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  url: String,
  thumbnail: String,
  duration: Number,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isDraft: { type: Boolean, default: false },
  duetOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  stitchOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  filters: [String],
  speed: { type: Number, default: 1 },
  voiceEffects: [String],
  captions: String,
  hashtags: [String],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  autoCaptions: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);