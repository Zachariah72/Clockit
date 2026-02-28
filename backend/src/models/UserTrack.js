const mongoose = require('mongoose');

const userTrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true }, // Artist name as string for uploaded tracks
  album: { type: String },
  genre: [{ type: String }],
  duration: { type: Number, required: true }, // in seconds
  coverImage: { type: String }, // URL to cover art (optional for uploads)
  audioFile: { type: String, required: true }, // Path to uploaded audio file
  fileSize: { type: Number, required: true }, // File size in bytes
  mimeType: { type: String, required: true }, // Audio file MIME type

  // User who uploaded the track
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Metadata
  tags: [{ type: String }],
  description: { type: String },

  // Status
  isPublic: { type: Boolean, default: false }, // Whether other users can see this track
  isExplicit: { type: Boolean, default: false },

  // Streaming stats
  playCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for search
userTrackSchema.index({ title: 'text', artist: 'text', album: 'text' });
userTrackSchema.index({ genre: 1 });
userTrackSchema.index({ tags: 1 });
userTrackSchema.index({ uploadedBy: 1 });
userTrackSchema.index({ isPublic: 1 });
userTrackSchema.index({ playCount: -1 });

module.exports = mongoose.model('UserTrack', userTrackSchema);