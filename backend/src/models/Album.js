const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  releaseDate: { type: Date, required: true },
  coverArt: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicReference' }],
  isReleased: { type: Boolean, default: false },
  preSaveUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema);