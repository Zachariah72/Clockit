const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: String, // optional, for grouping like 'Rock', 'Electronic'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Genre', genreSchema);