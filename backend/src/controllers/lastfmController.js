const axios = require('axios');

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

// Search tracks using Last.fm
const searchTracks = async (req, res) => {
  const { q, limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'track.search',
        track: q,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    // Transform Last.fm response to match our expected format
    const tracks = response.data.results.trackmatches.track.map(track => ({
      id: `${track.name}-${track.artist}`.replace(/[^a-zA-Z0-9]/g, '_'),
      name: track.name,
      artists: [{ name: track.artist }],
      album: {
        name: track.album || 'Unknown Album',
        images: [
          { url: track.image?.[2]?.['#text'] || '/placeholder.svg' } // Medium image
        ]
      },
      duration_ms: 30000, // Last.fm doesn't provide duration, using 30s default
      preview_url: null, // Last.fm doesn't provide previews
      external_urls: {
        lastfm: track.url
      },
      source: 'lastfm'
    }));

    res.json({
      tracks: {
        items: tracks
      }
    });

  } catch (error) {
    console.error('Last.fm search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search tracks on Last.fm' });
  }
};

// Get track info
const getTrackInfo = async (req, res) => {
  const { artist, track } = req.params;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'track.getInfo',
        artist: artist,
        track: track,
        api_key: LASTFM_API_KEY,
        format: 'json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm track info error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get track info from Last.fm' });
  }
};

// Get top tracks for an artist
const getArtistTopTracks = async (req, res) => {
  const { artist } = req.params;
  const { limit = 10 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'artist.getTopTracks',
        artist: artist,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    // Transform to our format
    const tracks = response.data.toptracks.track.map(track => ({
      id: `${track.name}-${track.artist.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
      name: track.name,
      artists: [{ name: track.artist.name }],
      album: {
        name: 'Various Albums',
        images: [
          { url: track.image?.[2]?.['#text'] || '/placeholder.svg' }
        ]
      },
      duration_ms: track.duration ? parseInt(track.duration) * 1000 : 30000,
      preview_url: null,
      external_urls: {
        lastfm: track.url
      },
      source: 'lastfm'
    }));

    res.json({
      tracks: {
        items: tracks
      }
    });

  } catch (error) {
    console.error('Last.fm artist tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get artist tracks from Last.fm' });
  }
};

// Get similar tracks
const getSimilarTracks = async (req, res) => {
  const { artist, track } = req.params;
  const { limit = 10 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'track.getSimilar',
        artist: artist,
        track: track,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    // Transform to our format
    const tracks = response.data.similartracks.track.map(track => ({
      id: `${track.name}-${track.artist.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
      name: track.name,
      artists: [{ name: track.artist.name }],
      album: {
        name: 'Similar Tracks',
        images: [
          { url: track.image?.[2]?.['#text'] || '/placeholder.svg' }
        ]
      },
      duration_ms: 30000,
      preview_url: null,
      external_urls: {
        lastfm: track.url
      },
      source: 'lastfm'
    }));

    res.json({
      tracks: {
        items: tracks
      }
    });

  } catch (error) {
    console.error('Last.fm similar tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get similar tracks from Last.fm' });
  }
};

// Get trending tracks
const getTrendingTracks = async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'chart.getTopTracks',
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    // Transform to our format
    const tracks = response.data.tracks.track.map(track => ({
      id: `${track.name}-${track.artist.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
      name: track.name,
      artists: [{ name: track.artist.name }],
      album: {
        name: 'Trending',
        images: [
          { url: track.image?.[2]?.['#text'] || '/placeholder.svg' }
        ]
      },
      duration_ms: 30000,
      preview_url: null,
      external_urls: {
        lastfm: track.url
      },
      source: 'lastfm'
    }));

    res.json({
      tracks: {
        items: tracks
      }
    });

  } catch (error) {
    console.error('Last.fm trending tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get trending tracks from Last.fm' });
  }
};

// Get album info
const getAlbumInfo = async (req, res) => {
  const { artist, album } = req.params;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'album.getInfo',
        artist: artist,
        album: album,
        api_key: LASTFM_API_KEY,
        format: 'json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm album info error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get album info from Last.fm' });
  }
};

// Get artist info
const getArtistInfo = async (req, res) => {
  const { artist } = req.params;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'artist.getInfo',
        artist: artist,
        api_key: LASTFM_API_KEY,
        format: 'json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm artist info error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get artist info from Last.fm' });
  }
};

// Get artist top albums
const getArtistTopAlbums = async (req, res) => {
  const { artist } = req.params;
  const { limit = 10 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'artist.getTopAlbums',
        artist: artist,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm artist albums error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get artist albums from Last.fm' });
  }
};

// Get similar artists
const getSimilarArtists = async (req, res) => {
  const { artist } = req.params;
  const { limit = 10 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'artist.getSimilar',
        artist: artist,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm similar artists error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get similar artists from Last.fm' });
  }
};

// Search albums
const searchAlbums = async (req, res) => {
  const { q, limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'album.search',
        album: q,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm album search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search albums on Last.fm' });
  }
};

// Search artists
const searchArtists = async (req, res) => {
  const { q, limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'artist.search',
        artist: q,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm artist search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search artists on Last.fm' });
  }
};

// Get top artists chart
const getTopArtists = async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'chart.getTopArtists',
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm top artists error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get top artists from Last.fm' });
  }
};

// Get top albums chart
const getTopAlbums = async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'tag.getTopAlbums',
        tag: 'rock', // You can make this dynamic
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm top albums error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get top albums from Last.fm' });
  }
};

// Get tag info and top tracks for a genre/tag
const getTagInfo = async (req, res) => {
  const { tag } = req.params;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'tag.getInfo',
        tag: tag,
        api_key: LASTFM_API_KEY,
        format: 'json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Last.fm tag info error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get tag info from Last.fm' });
  }
};

// Get top tracks for a tag/genre
const getTagTopTracks = async (req, res) => {
  const { tag } = req.params;
  const { limit = 20 } = req.query;

  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: 'tag.getTopTracks',
        tag: tag,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: limit
      }
    });

    // Transform to our track format
    const tracks = response.data.tracks.track.map(track => ({
      id: `${track.name}-${track.artist.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
      name: track.name,
      artists: [{ name: track.artist.name }],
      album: {
        name: tag,
        images: [
          { url: track.image?.[2]?.['#text'] || '/placeholder.svg' }
        ]
      },
      duration_ms: track.duration ? parseInt(track.duration) * 1000 : 30000,
      preview_url: null,
      external_urls: {
        lastfm: track.url
      },
      source: 'lastfm'
    }));

    res.json({
      tracks: {
        items: tracks
      }
    });

  } catch (error) {
    console.error('Last.fm tag tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get tag tracks from Last.fm' });
  }
};

module.exports = {
  searchTracks,
  getTrackInfo,
  getArtistTopTracks,
  getSimilarTracks,
  getTrendingTracks,
  getAlbumInfo,
  getArtistInfo,
  getArtistTopAlbums,
  getSimilarArtists,
  searchAlbums,
  searchArtists,
  getTopArtists,
  getTopAlbums,
  getTagInfo,
  getTagTopTracks
};