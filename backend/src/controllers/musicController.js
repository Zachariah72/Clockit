const ListeningHistory = require('../models/ListeningHistory');
const Song = require('../models/Song');

// Record a new listening event
const recordHistory = async (req, res) => {
  try {
    const { trackId, source, metadata } = req.body;
    const userId = req.user.id;

    if (!trackId || !source) {
      return res.status(400).json({ message: 'Missing trackId or source' });
    }

    // Keep only the last 50 tracks in DB strategy:
    // We insert a new record, then we could prune or just let it grow and query limit-50.
    // Optimal for 10k users: Insert and periodically prune or just indexing is enough for history.
    
    const newEntry = new ListeningHistory({
      userId,
      trackId,
      source,
      metadata,
      playedAt: new Date()
    });

    await newEntry.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error recording history:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's listening history
const getHistory = async (req, res) => {
  try {
    const history = await ListeningHistory.find({ userId: req.user.id })
      .sort({ playedAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unified Search Aggregator (Internal + External mocks/proxies)
const searchMusic = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // 1. Search internal DB
    const internalTracks = await Song.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);

    // 2. Format internal tracks to unified schema
    const results = internalTracks.map(t => ({
      id: t._id,
      title: t.title,
      artist: t.artist, // Should be populated if needed
      artwork: t.coverImage,
      duration: t.duration,
      url: t.audioFile,
      source: 'local'
    }));

    // In a real implementation, we would also fetch from SoundCloud/Spotify APIs here.
    // For now, we return internal results.
    
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordHistory,
  getHistory,
  searchMusic
};
