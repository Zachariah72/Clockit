const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: String, required: true },
  source: { type: String, enum: ['local', 'spotify', 'soundcloud'], required: true },
  metadata: {
    title: { type: String },
    artist: { type: String },
    artwork: { type: String },
    duration: { type: Number },
    url: { type: String }
  },
  playedAt: { type: Date, default: Date.now }
});

// Index for performance (getting user's latest history)
listeningHistorySchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);