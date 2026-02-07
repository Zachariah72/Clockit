const axios = require('axios');
const querystring = require('querystring');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Cache for client credentials token
let clientToken = null;
let tokenExpiry = null;

// Get client credentials token
const getClientCredentialsToken = async () => {
  if (clientToken && tokenExpiry && Date.now() < tokenExpiry) {
    return clientToken;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'client_credentials'
    }), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    clientToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return clientToken;
  } catch (error) {
    console.error('Client credentials error:', error.response?.data || error.message);
    throw error;
  }
};

// Get Spotify authorization URL
const getSpotifyAuthUrl = (req, res) => {
  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming playlist-read-private playlist-read-collaborative';
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: 'spotify_auth'
  })}`;

  res.json({ authUrl });
};

// Handle Spotify OAuth callback
const handleSpotifyCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      user: profileResponse.data
    });

  } catch (error) {
    console.error('Spotify OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
};

// Refresh Spotify access token
const refreshSpotifyToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = tokenResponse.data;

    res.json({
      accessToken: access_token,
      expiresIn: expires_in
    });

  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

// Search Spotify tracks
const searchTracks = async (req, res) => {
  const { q, limit = 20 } = req.query;
  const { accessToken } = req.body;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?${querystring.stringify({
      q: q,
      type: 'track',
      limit: limit
    })}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
};

// Search tracks with client credentials (for public access)
const searchTracksPublic = async (req, res) => {
  const { q, limit = 50 } = req.query;

  try {
    const token = await getClientCredentialsToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?${querystring.stringify({
      q: q,
      type: 'track',
      limit: limit
    })}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Public search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
};

// Get user's playlists
const getUserPlaylists = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Get playlists error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
};

// Get playlist tracks
const getPlaylistTracks = async (req, res) => {
  const { playlistId } = req.params;
  const { accessToken } = req.body;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Get playlist tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get playlist tracks' });
  }
};

// Get user's top tracks
const getTopTracks = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Get top tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get top tracks' });
  }
};

// Get currently playing track
const getCurrentlyPlaying = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Get currently playing error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get currently playing track' });
  }
};

// Control playback
const controlPlayback = async (req, res) => {
  const { action, deviceId, uris, position_ms } = req.body;
  const { accessToken } = req.body;

  try {
    let url, method = 'PUT', data = {};

    switch (action) {
      case 'play':
        url = `https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;
        data = uris ? { uris } : {};
        if (position_ms) data.position_ms = position_ms;
        break;
      case 'pause':
        url = 'https://api.spotify.com/v1/me/player/pause';
        break;
      case 'next':
        url = 'https://api.spotify.com/v1/me/player/next';
        break;
      case 'previous':
        url = 'https://api.spotify.com/v1/me/player/previous';
        break;
      case 'seek':
        url = `https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Playback control error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to control playback' });
  }
};

module.exports = {
  getSpotifyAuthUrl,
  handleSpotifyCallback,
  refreshSpotifyToken,
  searchTracks,
  searchTracksPublic,
  getUserPlaylists,
  getPlaylistTracks,
  getTopTracks,
  getCurrentlyPlaying,
  controlPlayback
};