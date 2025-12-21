const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['video', 'story'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feed', feedSchema);