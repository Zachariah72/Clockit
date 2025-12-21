const mongoose = require('mongoose');

const userPresenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPresence', userPresenceSchema);