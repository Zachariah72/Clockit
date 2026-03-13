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
  }
});

const listeningGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  currentTrack: trackSchema,
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  lastSyncAt: { type: Date, default: Date.now },
  playlist: [trackSchema],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for discovery
listeningGroupSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('ListeningGroup', listeningGroupSchema);