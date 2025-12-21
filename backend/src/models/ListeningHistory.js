const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'MusicReference', required: true },
  listenedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);