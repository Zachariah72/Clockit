const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  album: { type: String },
  genre: [{ type: String }],
  duration: { type: Number, required: true }, // in seconds
  releaseDate: { type: Date },
  coverImage: { type: String }, // URL to cover art
  audioFile: { type: String, required: true }, // URL to audio file
  lyrics: { type: String },

  // Streaming stats
  playCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },

  // Metadata
  bpm: { type: Number },
  key: { type: String },
  tags: [{ type: String }],

  // Status
  isExplicit: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },

  // Relations
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  featuredIn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }], // Reels/Stories featuring this song

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ tags: 1 });
songSchema.index({ playCount: -1 });

module.exports = mongoose.model('Song', songSchema);