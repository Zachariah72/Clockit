const express = require('express');
const Genre = require('../models/Genre');
const router = express.Router();

// Get all genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed genres (one-time or admin)
router.post('/seed', async (req, res) => {
  const genreList = [
    'Pop', 'Hip-Hop/Rap', 'R&B/Soul', 'Classic Rock', 'Alternative Rock', 'Indie Rock', 'Metal', 'Punk',
    'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass', 'Jazz', 'Blues', 'Classical', 'Gospel',
    'Reggae', 'Dancehall', 'Afrobeat', 'Afropop', 'Amapiano', 'Reggaeton', 'Salsa', 'Bachata', 'Latin Pop',
    'Country', 'Folk', 'Indie', 'K-Pop', 'J-Pop', 'C-Pop', 'Bollywood', 'Indian Classical', 'Indian Pop',
    'Arabic', 'Middle Eastern', 'Caribbean', 'Lo-Fi', 'Instrumental', 'Soundtracks', 'Scores', 'Experimental', 'Alternative'
  ];

  try {
    const genres = await Genre.insertMany(genreList.map(name => ({ name })));
    res.json({ message: 'Genres seeded', genres });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;