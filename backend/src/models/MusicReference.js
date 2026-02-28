const mongoose = require('mongoose');

const musicReferenceSchema = new mongoose.Schema({
  title: String,
  artist: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  url: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MusicReference', musicReferenceSchema);