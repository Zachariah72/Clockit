const mongoose = require('mongoose');

const artistFollowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistId: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  artistImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate follows
artistFollowSchema.index({ userId: 1, artistId: 1 }, { unique: true });

// Index for efficient queries
artistFollowSchema.index({ userId: 1, createdAt: -1 });
artistFollowSchema.index({ artistId: 1 });

module.exports = mongoose.model('ArtistFollow', artistFollowSchema);
