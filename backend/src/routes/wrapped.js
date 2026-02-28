const express = require('express');
const ListeningHistory = require('../models/ListeningHistory');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get user's listening wrapped for a year
router.get('/', auth, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const history = await ListeningHistory.find({
      userId: req.user.id,
      listenedAt: { $gte: startDate, $lt: endDate }
    }).populate('musicId');

    // Calculate stats
    const totalMinutes = history.length * 3; // Assuming 3 min per song
    const topGenres = {};
    const topArtists = {};
    const listeningByMonth = {};

    history.forEach(entry => {
      const month = entry.listenedAt.getMonth();
      listeningByMonth[month] = (listeningByMonth[month] || 0) + 1;

      if (entry.musicId) {
        const genre = entry.musicId.genres?.[0]?.name || 'Unknown';
        const artist = entry.musicId.artist || 'Unknown';

        topGenres[genre] = (topGenres[genre] || 0) + 1;
        topArtists[artist] = (topArtists[artist] || 0) + 1;
      }
    });

    const wrapped = {
      year,
      totalMinutes,
      totalSongs: history.length,
      topGenre: Object.keys(topGenres).reduce((a, b) => topGenres[a] > topGenres[b] ? a : b, 'None'),
      topArtist: Object.keys(topArtists).reduce((a, b) => topArtists[a] > topArtists[b] ? a : b, 'None'),
      listeningByMonth,
      topGenres: Object.entries(topGenres).sort(([,a], [,b]) => b - a).slice(0, 5),
      topArtists: Object.entries(topArtists).sort(([,a], [,b]) => b - a).slice(0, 5)
    };

    res.json(wrapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;