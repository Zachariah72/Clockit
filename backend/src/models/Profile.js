const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: String,
  avatar: String,
  location: String,
  website: String,
  followedGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);