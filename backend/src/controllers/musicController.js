const ListeningHistory = require('../models/ListeningHistory');
const Song = require('../models/Song');
const axios = require('axios');

// Record a new listening event with scalability in mind (upsert & prune)
const recordHistory = async (req, res) => {
  try {
    const { trackId, source, metadata } = req.body;
    const userId = req.user.id;

    if (!trackId || !source) {
      return res.status(400).json({ message: 'Missing trackId or source' });
    }

    // 1. Upsert strategy: If user played this track before, just update the timestamp
    // This prevents table bloat for 10k users who replay songs.
    const filter = { userId, trackId, source };
    const update = {
      metadata,
      playedAt: new Date()
    };

    await ListeningHistory.findOneAndUpdate(filter, update, { upsert: true, new: true });

    // 2. Pruning strategy: Keep only last 50 for the user
    // In a high-traffic env, we might do this via a worker/cron to save latency, 
    // but for now, we'll do an async prune.
    const prune = async () => {
      const count = await ListeningHistory.countDocuments({ userId });
      if (count > 50) {
        const oldest = await ListeningHistory.find({ userId })
          .sort({ playedAt: 1 })
          .limit(count - 50);

        if (oldest.length > 0) {
          const idsToPrune = oldest.map(record => record._id);
          await ListeningHistory.deleteMany({ _id: { $in: idsToPrune } });
        }
      }
    };

    prune().catch(err => console.error('History prune error:', err));

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

// Unified Search Aggregator (Internal + External)
const searchMusic = async (req, res) => {
  try {
    const { q, limit = 15 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // Run searches in parallel for low latency
    const results = await Promise.allSettled([
      // 1. Internal DB
      Song.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean(),

      // 2. Deezer API (Fast public previews)
      axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`),

      // 3. Optional: Spotify Search Proxy (If configured)
      // For now, we'll focus on Internal + Deezer
    ]);

    const formattedResults = [];

    // Map Internal
    if (results[0].status === 'fulfilled') {
      results[0].value.forEach(t => {
        formattedResults.push({
          id: t._id,
          title: t.title,
          artist: t.artist,
          artwork: t.coverImage,
          duration: t.duration,
          url: t.audioFile,
          source: 'local'
        });
      });
    }

    // Map Deezer
    if (results[1].status === 'fulfilled' && results[1].value.data.data) {
      results[1].value.data.data.forEach(t => {
        formattedResults.push({
          id: `deezer_${t.id}`,
          title: t.title,
          artist: t.artist.name,
          artwork: t.album.cover_medium,
          duration: t.duration,
          url: t.preview,
          source: 'soundcloud', // Map to soundcloud/deezer player source in frontend
          metadata: {
            album: t.album.title,
            deezerId: t.id
          }
        });
      });
    }

    // Sort or paginate results as needed
    res.json(formattedResults);
  } catch (err) {
    console.error('Search aggregator error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordHistory,
  getHistory,
  searchMusic
};
