const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Artist = require('../models/Artist');
const Song = require('../models/Song'); // Assuming you have a Song model

// Global search across multiple entities
const globalSearch = async (req, res) => {
  try {
    const { q: query, type, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    let results = [];

    // Search based on type or search all
    if (type === 'users' || !type) {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { display_name: searchRegex },
          { email: searchRegex }
        ]
      })
      .select('username display_name avatar_url bio followers_count')
      .limit(parseInt(limit))
      .lean();

      results.push(...users.map(user => ({
        id: user._id,
        type: 'user',
        title: user.username,
        subtitle: `${user.display_name || user.username} • ${user.followers_count || 0} followers`,
        image: user.avatar_url || '/api/placeholder/60/60',
        category: 'User'
      })));
    }

    if (type === 'playlists' || !type) {
      const playlists = await Playlist.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('created_by', 'username display_name')
      .select('name description cover_image song_count created_by')
      .limit(parseInt(limit))
      .lean();

      results.push(...playlists.map(playlist => ({
        id: playlist._id,
        type: 'playlist',
        title: playlist.name,
        subtitle: `${playlist.song_count} songs • ${playlist.created_by?.username || 'Unknown'}`,
        image: playlist.cover_image || '/api/placeholder/60/60',
        category: 'Playlist'
      })));
    }

    if (type === 'artists' || !type) {
      const artists = await Artist.find({
        $or: [
          { name: searchRegex },
          { bio: searchRegex }
        ]
      })
      .select('name bio avatar_url followers_count')
      .limit(parseInt(limit))
      .lean();

      results.push(...artists.map(artist => ({
        id: artist._id,
        type: 'artist',
        title: artist.name,
        subtitle: `${artist.followers_count || 0} followers`,
        image: artist.avatar_url || '/api/placeholder/60/60',
        category: 'Artist'
      })));
    }

    if (type === 'music' || !type) {
      // Assuming you have a Song model
      try {
        const songs = await Song.find({
          $or: [
            { title: searchRegex },
            { artist: searchRegex },
            { album: searchRegex }
          ]
        })
        .populate('artist', 'name')
        .select('title artist album cover_image duration')
        .limit(parseInt(limit))
        .lean();

        results.push(...songs.map(song => ({
          id: song._id,
          type: 'music',
          title: song.title,
          subtitle: `${song.artist?.name || song.artist} • ${song.album || 'Unknown Album'}`,
          image: song.cover_image || '/api/placeholder/60/60',
          category: 'Song'
        })));
      } catch (error) {
        // If Song model doesn't exist, skip music search
        console.log('Song model not available for search');
      }
    }

    // Sort results by relevance (you could implement more sophisticated ranking)
    results.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    res.json({
      success: true,
      data: {
        query,
        total: results.length,
        results: results.slice(0, parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Search suggestions/autocomplete
const searchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchRegex = new RegExp(`^${query}`, 'i');
    let suggestions = [];

    // Get username suggestions
    const users = await User.find({ username: searchRegex })
      .select('username')
      .limit(parseInt(limit))
      .lean();

    suggestions.push(...users.map(user => ({
      text: user.username,
      type: 'user'
    })));

    // Get playlist suggestions
    const playlists = await Playlist.find({ name: searchRegex })
      .select('name')
      .limit(parseInt(limit))
      .lean();

    suggestions.push(...playlists.map(playlist => ({
      text: playlist.name,
      type: 'playlist'
    })));

    // Get artist suggestions
    const artists = await Artist.find({ name: searchRegex })
      .select('name')
      .limit(parseInt(limit))
      .lean();

    suggestions.push(...artists.map(artist => ({
      text: artist.name,
      type: 'artist'
    })));

    // Remove duplicates and limit
    const uniqueSuggestions = suggestions
      .filter((item, index, self) =>
        index === self.findIndex(s => s.text === item.text)
      )
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { suggestions: uniqueSuggestions }
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

module.exports = {
  globalSearch,
  searchSuggestions
};