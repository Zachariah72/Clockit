const mongoose = require('mongoose');

const userPresenceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'away', 'in-call'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPresence', userPresenceSchema);