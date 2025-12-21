const mongoose = require('mongoose');

const listeningGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  currentSong: { type: mongoose.Schema.Types.ObjectId, ref: 'MusicReference' },
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicReference' }],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ListeningGroup', listeningGroupSchema);