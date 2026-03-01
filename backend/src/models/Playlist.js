const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  source: { type: String, enum: ['local', 'spotify', 'soundcloud'], required: true },
  metadata: {
    title: String,
    artist: String,
    artwork: String,
    duration: Number,
    url: String
  },
  addedAt: { type: Date, default: Date.now }
});

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  coverImage: String,
  tracks: [trackSchema],
  isPublic: { type: Boolean, default: true },
  theme: {
    primaryColor: String,
    gradient: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
playlistSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for performance
playlistSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);