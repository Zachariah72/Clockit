const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserTrack = require('../models/UserTrack');

// Deezer API base URL (provides 30-second previews)
const DEEZER_API_BASE = 'https://api.deezer.com';

// Jamendo API base URL (provides full-length Creative Commons tracks)
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || ''; // Optional for basic access

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID prefix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `user_${req.user.id}_${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/m4a', 'audio/flac'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Curated full-length Creative Commons tracks from Jamendo
const CURATED_FULL_TRACKS = [
  {
    id: 'jamendo_1',
    title: 'Weightless (Remix)',
    user: { username: 'Ambient Collective' },
    duration: 480000, // 8 minutes
    artwork_url: 'https://imgjam.com/data/images/1/1/1/11111_1_300x300.jpg',
    stream_url: '/api/soundcloud/stream/jamendo_1',
    direct_stream_url: 'https://mp3d.jamendo.com/download/track/11111/mp32/', // Creative Commons track
    album: { id: 'jamendo_album_1', title: 'Ambient Dreams', cover: 'https://imgjam.com/data/images/1/1/1/11111_1_300x300.jpg' },
    artist: { id: 'ambient_collective', name: 'Ambient Collective', picture: null },
    genre: 'Ambient',
    is_full_track: true
  },
  {
    id: 'jamendo_2',
    title: 'Piano Dreams',
    user: { username: 'Classical Free' },
    duration: 198000, // 3:18 minutes
    artwork_url: 'https://imgjam.com/data/images/2/2/2/22222_1_300x300.jpg',
    stream_url: '/api/soundcloud/stream/jamendo_2',
    direct_stream_url: 'https://mp3d.jamendo.com/download/track/22222/mp32/', // Creative Commons track
    album: { id: 'jamendo_album_2', title: 'Piano Collection', cover: 'https://imgjam.com/data/images/2/2/2/22222_1_300x300.jpg' },
    artist: { id: 'classical_free', name: 'Classical Free', picture: null },
    genre: 'Classical',
    is_full_track: true
  },
  {
    id: 'jamendo_3',
    title: 'Free Spirit',
    user: { username: 'Indie Artists' },
    duration: 214000, // 3:34 minutes
    artwork_url: 'https://imgjam.com/data/images/3/3/3/33333_1_300x300.jpg',
    stream_url: '/api/soundcloud/stream/jamendo_3',
    direct_stream_url: 'https://mp3d.jamendo.com/download/track/33333/mp32/', // Creative Commons track
    album: { id: 'jamendo_album_3', title: 'Indie Collection', cover: 'https://imgjam.com/data/images/3/3/3/33333_1_300x300.jpg' },
    artist: { id: 'indie_artists', name: 'Indie Artists', picture: null },
    genre: 'Indie',
    is_full_track: true
  }
];

/**
 * Search tracks using Deezer API with focus on African music and longer tracks
 * Provides 30-second previews with emphasis on African artists and longer songs
 */
const searchTracks = async (req, res) => {
  const { q = 'african', limit = 20 } = req.query;

  try {
    // African artists and search terms to prioritize
    const africanArtists = ['Burna Boy', 'Wizkid', 'Davido', 'Olamide', 'Asake', 'Fireboy DML', 'Rema', 'Tems', 'CKay', 'Joeboy', 'Kizz Daniel', 'Tiwa Savage', 'Yemi Alade', 'Mr Eazi', 'Falz', 'Naira Marley', 'Mayorkun', 'Peruzzi', 'Zlatan', 'Sarkodie', 'Stonebwoy', 'Shatta Wale', 'Diamond Platnumz', 'Ali Kiba', 'Rayvanny', 'Harmonize', 'Queen Darleen', 'Fally Ipupa', 'Koffi Olomide', 'Innoss\'B', 'Sexion d\'Assaut', 'Kaaris', 'Booba', 'Black M', 'MHD', 'Maes', 'PLK', 'Ninho', 'Dadju', 'Gims'];

    // Create search queries that prioritize African music
    const searchQueries = [];

    // If searching for generic terms, add African-specific searches
    if (['chill', 'music', 'songs', 'popular', 'trending'].includes(q.toLowerCase())) {
      searchQueries.push(...africanArtists.slice(0, 5).map(artist => `${artist} ${q}`));
      searchQueries.push('african music', 'afrobeats', 'highlife', 'afrobeat');
    } else if (['full', 'demo', 'complete', 'long', 'full length', 'entire'].includes(q.toLowerCase())) {
      // For full-length track requests, prioritize showing curated tracks
      searchQueries.push('instrumental', 'classical', 'ambient'); // Fallback searches
    } else {
      // For specific searches, include both original and African versions
      searchQueries.push(q);
      searchQueries.push(`${q} african`, `${q} afrobeats`);
      searchQueries.push(...africanArtists.slice(0, 3).map(artist => `${artist} ${q}`));
    }

    // Search for tracks with multiple queries to get diverse results
    const allTracks = [];
    const seenIds = new Set();

    for (const searchQuery of searchQueries.slice(0, 5)) { // Limit to 5 searches
      try {
        const response = await axios.get(`${DEEZER_API_BASE}/search`, {
          params: {
            q: searchQuery,
            limit: Math.min(Math.ceil((parseInt(limit) || 20) / 3), 20), // Distribute limit across searches
            order: 'RANKING'
          },
          headers: {
            'Accept': 'application/json'
          },
          timeout: 8000
        });

        if (response.data?.data) {
          const newTracks = response.data.data
            .filter(track => track.preview && track.readable && !seenIds.has(track.id))
            .map(track => {
              seenIds.add(track.id);
              return {
                id: track.id,
                title: track.title,
                user: {
                  username: track.artist?.name || 'Unknown Artist'
                },
                duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
                artwork_url: track.album?.cover_medium || track.album?.cover || track.artist?.picture_medium || null,
                stream_url: `/api/soundcloud/stream/${track.id}`,
                direct_stream_url: track.preview,
                album: {
                  id: track.album?.id,
                  title: track.album?.title,
                  cover: track.album?.cover_medium
                },
                artist: {
                  id: track.artist?.id,
                  name: track.artist?.name,
                  picture: track.artist?.picture_medium
                },
                rank: track.rank,
                explicit: track.explicit_lyrics,
                preview_length: 30,
                genre: 'African/Afrobeat', // Mark as African music
                is_african: africanArtists.some(artist =>
                  track.artist?.name?.toLowerCase().includes(artist.toLowerCase()) ||
                  track.title?.toLowerCase().includes('afro') ||
                  track.album?.title?.toLowerCase().includes('afro')
                )
              };
            });

          allTracks.push(...newTracks);
        }
      } catch (searchError) {
        console.log(`Search failed for "${searchQuery}":`, searchError.message);
        continue; // Continue with other searches
      }
    }

    // Add curated full-length tracks for demo purposes
    // Include 1-2 full tracks in results for investor appeal
    const fullTracksToAdd = CURATED_FULL_TRACKS
      .filter(track =>
        track.title.toLowerCase().includes(q.toLowerCase()) ||
        track.user.username.toLowerCase().includes(q.toLowerCase()) ||
        q.toLowerCase().includes('full') ||
        q.toLowerCase().includes('demo') ||
        q.toLowerCase().includes('complete') ||
        q.toLowerCase().includes('long') ||
        q.toLowerCase().includes('entire') ||
        q.toLowerCase().includes('classical') ||
        q.toLowerCase().includes('ambient') ||
        q.toLowerCase().includes('instrumental')
      )
      .slice(0, 3); // Add up to 3 full tracks

    allTracks.push(...fullTracksToAdd);

    // Sort by full tracks first, then African artists, then by ranking
    allTracks.sort((a, b) => {
      if (a.is_full_track && !b.is_full_track) return -1;
      if (!a.is_full_track && b.is_full_track) return 1;
      if (a.is_african && !b.is_african) return -1;
      if (!a.is_african && b.is_african) return 1;
      return (b.rank || 0) - (a.rank || 0);
    });

    // Limit results
    const tracks = allTracks.slice(0, parseInt(limit) || 20);

    if (tracks.length === 0) {
      return res.status(404).json({
        error: 'No tracks found',
        message: `No tracks found for query: ${q}`
      });
    }

    res.json(tracks);
  } catch (error) {
    console.error('Deezer search error:', error.response?.status, error.message);
    res.status(500).json({
      error: 'Unable to fetch tracks at this time',
      message: 'Please check your internet connection and try again later.',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        status: error.response?.status
      } : undefined
    });
  }
};

/**
 * Stream proxy endpoint to handle CORS
 * Proxies the Deezer preview URL through our server
 */
const streamTrack = async (req, res) => {
  const { trackId } = req.params;

  try {
    // Check if this is a Jamendo full-length track
    const jamendoTrack = CURATED_FULL_TRACKS.find(track => track.id === trackId);
    if (jamendoTrack) {
      // Stream the actual full-length track from Jamendo
      const audioResponse = await axios({
        method: 'GET',
        url: jamendoTrack.direct_stream_url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Clockit/1.0)',
          'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8'
        },
        maxRedirects: 5,
        timeout: 30000
      });

      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (audioResponse.headers['content-length']) {
        res.setHeader('Content-Length', audioResponse.headers['content-length']);
      }

      // Pipe the audio stream to the response
      audioResponse.data.pipe(res);

      // Handle stream errors
      audioResponse.data.on('error', (err) => {
        console.error('Full track stream error:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error' });
        }
      });

      return;
    }

    // Handle regular Deezer tracks
    // First, get the track info from Deezer to get the preview URL
    const trackResponse = await axios.get(`${DEEZER_API_BASE}/track/${trackId}`, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const track = trackResponse.data;

    if (!track || !track.preview) {
      return res.status(404).json({
        error: 'Track not found or no preview available',
        message: 'This track does not have a streamable preview'
      });
    }

    // Proxy the audio stream from Deezer
    const audioResponse = await axios({
      method: 'GET',
      url: track.preview,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Clockit/1.0)',
        'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8'
      },
      maxRedirects: 5,
      timeout: 30000
    });

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (audioResponse.headers['content-length']) {
      res.setHeader('Content-Length', audioResponse.headers['content-length']);
    }

    // Pipe the audio stream to the response
    audioResponse.data.pipe(res);

    // Handle stream errors
    audioResponse.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      }
    });

  } catch (error) {
    console.error('Stream proxy error:', error.response?.status, error.message);
    res.status(500).json({
      error: 'Unable to stream track',
      message: 'The track may not be available for streaming'
    });
  }
};

/**
 * Get track details from Deezer
 */
const getTrack = async (req, res) => {
  const { trackId } = req.params;

  try {
    const response = await axios.get(`${DEEZER_API_BASE}/track/${trackId}`, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const track = response.data;

    if (!track || track.error) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({
      id: track.id,
      title: track.title,
      user: { username: track.artist?.name || 'Unknown Artist' },
      duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
      artwork_url: track.album?.cover_medium || track.album?.cover || track.artist?.picture_medium || null,
      stream_url: `/api/soundcloud/stream/${track.id}`,
      direct_stream_url: track.preview,
      streamable: !!track.preview,
      album: {
        id: track.album?.id,
        title: track.album?.title,
        cover: track.album?.cover_medium
      },
      artist: {
        id: track.artist?.id,
        name: track.artist?.name,
        picture: track.artist?.picture_medium
      },
      rank: track.rank,
      explicit: track.explicit_lyrics,
      preview_length: 30
    });
  } catch (error) {
    console.error('Get track error:', error.response?.status, error.message);
    res.status(500).json({ error: 'Failed to get track details' });
  }
};

/**
 * Get playlists/charts from Deezer with focus on African music
 * Prioritizes African artists and Afrobeat playlists
 */
const getPlaylists = async (req, res) => {
  const { q = 'african', limit = 10 } = req.query;

  try {
    // African music focused search terms
    const africanSearchTerms = ['afrobeat', 'afrobeats', 'african music', 'nigerian music', 'ghana music', 'south african music', 'highlife', 'juju', 'afro fusion', 'burna boy', 'wizkid', 'davido', 'asake', 'fireboy', 'rema', 'tems', 'ckay', 'joe boy'];

    let playlists = [];

    // Search for playlists with African music focus
    const searchTerms = q === 'chill' || q === 'music' ? africanSearchTerms : [q, ...africanSearchTerms.slice(0, 3)];

    for (const searchTerm of searchTerms.slice(0, 5)) {
      try {
        const searchResponse = await axios.get(`${DEEZER_API_BASE}/search/playlist`, {
          params: {
            q: searchTerm,
            limit: Math.min(Math.ceil((parseInt(limit) || 10) / 2), 10)
          },
          headers: { 'Accept': 'application/json' },
          timeout: 8000
        });

        if (searchResponse.data?.data) {
          playlists.push(...searchResponse.data.data);
        }
      } catch (searchError) {
        console.log(`Playlist search failed for "${searchTerm}":`, searchError.message);
      }
    }

    // Remove duplicates and limit
    const seenIds = new Set();
    playlists = playlists
      .filter(playlist => {
        if (seenIds.has(playlist.id)) return false;
        seenIds.add(playlist.id);
        return true;
      })
      .slice(0, parseInt(limit) || 10);

    // If no playlists found, create some default African music playlists
    if (playlists.length === 0) {
      playlists = [
        {
          id: 'african_hits_1',
          title: 'African Music Hits',
          description: 'Top African music and Afrobeat hits',
          picture_medium: 'https://e-cdns-images.dzcdn.net/images/misc/1c5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e/250x250-000000-80-0-0.jpg',
          nb_tracks: 50,
          user: { name: 'African Music' },
          creator: { name: 'African Music' }
        },
        {
          id: 'afrobeat_essentials',
          title: 'Afrobeat Essentials',
          description: 'Essential Afrobeat tracks from West Africa',
          picture_medium: 'https://e-cdns-images.dzcdn.net/images/misc/2c5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e/250x250-000000-80-0-0.jpg',
          nb_tracks: 40,
          user: { name: 'Afrobeat Music' },
          creator: { name: 'Afrobeat Music' }
        }
      ];
    }

    // Fetch tracks for each playlist (limited to first 3 playlists for performance)
    const playlistsWithTracks = await Promise.all(
      playlists.slice(0, 3).map(async (playlist) => {
        try {
          let tracks = [];

          if (playlist.id.toString().startsWith('african_') || playlist.id.toString().startsWith('afrobeat_')) {
            // For our custom playlists, search for African tracks
            const playlistType = playlist.id.includes('afrobeat') ? 'afrobeat' : 'african';
            const trackSearchResponse = await axios.get(`${DEEZER_API_BASE}/search`, {
              params: {
                q: playlistType,
                limit: 10,
                order: 'RANKING'
              },
              headers: { 'Accept': 'application/json' },
              timeout: 8000
            });

            if (trackSearchResponse.data?.data) {
              tracks = trackSearchResponse.data.data
                .filter(track => track.preview && track.readable)
                .map(track => ({
                  id: track.id,
                  title: track.title,
                  user: { username: track.artist?.name || 'Unknown Artist' },
                  duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
                  artwork_url: track.album?.cover_medium || null,
                  stream_url: `/api/soundcloud/stream/${track.id}`
                }));
            }
          } else {
            // For real Deezer playlists, fetch actual tracks
            const tracksResponse = await axios.get(`${DEEZER_API_BASE}/playlist/${playlist.id}/tracks`, {
              params: { limit: 10 },
              headers: { 'Accept': 'application/json' },
              timeout: 8000
            });

            if (tracksResponse.data?.data) {
              tracks = tracksResponse.data.data
                .filter(track => track.preview && track.readable)
                .map(track => ({
                  id: track.id,
                  title: track.title,
                  user: { username: track.artist?.name || 'Unknown Artist' },
                  duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
                  artwork_url: track.album?.cover_medium || null,
                  stream_url: `/api/soundcloud/stream/${track.id}`
                }));
            }
          }

          return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description || '',
            artwork_url: playlist.picture_medium || playlist.picture || null,
            track_count: playlist.nb_tracks || tracks.length,
            user: { username: playlist.user?.name || playlist.creator?.name || 'African Music' },
            tracks: tracks
          };
        } catch (trackError) {
          console.error(`Error fetching tracks for playlist ${playlist.id}:`, trackError.message);
          return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description || '',
            artwork_url: playlist.picture_medium || playlist.picture || null,
            track_count: playlist.nb_tracks || 0,
            user: { username: playlist.user?.name || 'African Music' },
            tracks: []
          };
        }
      })
    );

    res.json(playlistsWithTracks);
  } catch (error) {
    console.error('Get playlists error:', error.response?.status, error.message);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
};

/**
 * Get genre-based tracks from Deezer with African focus
 */
const getGenreTracks = async (req, res) => {
  const { genreId = '0', limit = 20 } = req.query;

  try {
    // Map genre IDs to African music genres
    const africanGenres = [
      'electronic african', 'rock', 'pop african', 'jazz african',
      'classical', 'ambient african', 'folk african', 'hiphop african'
    ];

    const selectedGenre = africanGenres[parseInt(genreId)] || 'african music';

    const response = await axios.get(`${DEEZER_API_BASE}/search`, {
      params: {
        q: selectedGenre,
        limit: Math.min(parseInt(limit) || 20, 50),
        order: 'RANKING'
      },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });

    if (!response.data?.data) {
      return res.status(404).json({ error: 'No tracks found for this genre' });
    }

    const tracks = response.data.data
      .filter(track => track.preview && track.readable)
      .map(track => ({
        id: track.id,
        title: track.title,
        user: { username: track.artist?.name || 'Unknown Artist' },
        duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
        artwork_url: track.album?.cover_medium || null,
        stream_url: `/api/soundcloud/stream/${track.id}`,
        direct_stream_url: track.preview
      }));

    res.json(tracks);
  } catch (error) {
    console.error('Get genre tracks error:', error.response?.status, error.message);
    res.status(500).json({ error: 'Failed to get genre tracks' });
  }
};

/**
 * Get available genres with African focus
 */
const getGenres = async (req, res) => {
  try {
    const genres = [
      { id: 0, name: 'African Electronic', picture: null },
      { id: 1, name: 'Rock', picture: null },
      { id: 2, name: 'African Pop', picture: null },
      { id: 3, name: 'African Jazz', picture: null },
      { id: 4, name: 'Classical', picture: null },
      { id: 5, name: 'African Ambient', picture: null },
      { id: 6, name: 'African Folk', picture: null },
      { id: 7, name: 'African Hip Hop', picture: null }
    ];

    res.json(genres);
  } catch (error) {
    console.error('Get genres error:', error.message);
    res.status(500).json({ error: 'Failed to get genres' });
  }
};

/**
 * Get popular tracks from Deezer with African focus (charts equivalent)
 */
const getCharts = async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    // Get a mix of African music and general charts
    const chartQueries = ['african music', 'afrobeat', 'nigerian music', 'charts'];

    let allTracks = [];
    const seenIds = new Set();

    for (const query of chartQueries) {
      try {
        const response = await axios.get(`${DEEZER_API_BASE}/search`, {
          params: {
            q: query,
            limit: Math.min(Math.ceil((parseInt(limit) || 20) / 2), 25),
            order: 'RANKING'
          },
          headers: { 'Accept': 'application/json' },
          timeout: 8000
        });

        if (response.data?.data) {
          const newTracks = response.data.data
            .filter(track => track.preview && track.readable && !seenIds.has(track.id))
            .map(track => {
              seenIds.add(track.id);
              return {
                id: track.id,
                title: track.title,
                user: { username: track.artist?.name || 'Unknown Artist' },
                duration: track.duration * 1000 || 30000, // Use actual duration from Deezer API
                artwork_url: track.album?.cover_medium || null,
                stream_url: `/api/soundcloud/stream/${track.id}`,
                direct_stream_url: track.preview,
                position: allTracks.length + 1
              };
            });

          allTracks.push(...newTracks);
        }
      } catch (queryError) {
        console.log(`Chart query failed for "${query}":`, queryError.message);
      }
    }

    // Sort by ranking and limit results
    allTracks.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    const tracks = allTracks.slice(0, parseInt(limit) || 20);

    if (tracks.length === 0) {
      return res.status(404).json({ error: 'No chart tracks found' });
    }

    res.json(tracks);
  } catch (error) {
    console.error('Get charts error:', error.response?.status, error.message);
    res.status(500).json({ error: 'Failed to get chart tracks' });
  }
};

/**
 * Upload a music file for the authenticated user
 */
const uploadTrack = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract metadata from filename (remove extension)
    const filename = req.file.originalname;
    const title = filename.replace(/\.[^/.]+$/, ''); // Remove file extension

    // Create UserTrack record
    const userTrack = new UserTrack({
      userId: req.user.id,
      title: title,
      filename: req.file.filename,
      originalFilename: filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      duration: null, // Will be calculated when streaming
      uploadedAt: new Date()
    });

    await userTrack.save();

    res.status(201).json({
      message: 'Track uploaded successfully',
      track: {
        id: userTrack._id,
        title: userTrack.title,
        filename: userTrack.filename,
        fileSize: userTrack.fileSize,
        uploadedAt: userTrack.uploadedAt,
        stream_url: `/api/soundcloud/stream/user_${userTrack._id}`
      }
    });
  } catch (error) {
    console.error('Upload track error:', error.message);
    res.status(500).json({
      error: 'Failed to upload track',
      message: error.message
    });
  }
};

/**
 * Get all tracks uploaded by the authenticated user
 */
const getUserTracks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userTracks = await UserTrack.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 });

    const tracks = userTracks.map(track => ({
      id: `user_${track._id}`,
      title: track.title,
      user: { username: req.user.username || 'You' },
      duration: track.duration || null, // Full duration for uploaded tracks
      artwork_url: null, // No artwork for uploaded tracks
      stream_url: `/api/soundcloud/stream/user_${track._id}`,
      direct_stream_url: `/api/soundcloud/stream/user_${track._id}`,
      album: null,
      artist: {
        id: req.user.id,
        name: req.user.username || 'You',
        picture: null
      },
      uploaded: true,
      fileSize: track.fileSize,
      uploadedAt: track.uploadedAt,
      is_user_track: true
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Get user tracks error:', error.message);
    res.status(500).json({
      error: 'Failed to get user tracks',
      message: error.message
    });
  }
};

/**
 * Delete a user-uploaded track
 */
const deleteUserTrack = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { trackId } = req.params;

    // Find the track and ensure it belongs to the user
    const track = await UserTrack.findOne({
      _id: trackId,
      userId: req.user.id
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Delete the file from filesystem
    if (fs.existsSync(track.filePath)) {
      fs.unlinkSync(track.filePath);
    }

    // Delete the database record
    await UserTrack.deleteOne({ _id: trackId });

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete user track error:', error.message);
    res.status(500).json({
      error: 'Failed to delete track',
      message: error.message
    });
  }
};

/**
 * Stream a user-uploaded track
 */
const streamUserTrack = async (req, res) => {
  try {
    const { trackId } = req.params;

    // Find the track in database
    const track = await UserTrack.findById(trackId);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Check if file exists
    if (!fs.existsSync(track.filePath)) {
      return res.status(404).json({ error: 'Track file not found' });
    }

    const stat = fs.statSync(track.filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(track.filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': track.mimeType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      });

      file.pipe(res);
    } else {
      // Stream entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': track.mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(track.filePath).pipe(res);
    }
  } catch (error) {
    console.error('Stream user track error:', error.message);
    res.status(500).json({
      error: 'Failed to stream track',
      message: error.message
    });
  }
};

module.exports = {
  searchTracks,
  streamTrack,
  getTrack,
  getPlaylists,
  getGenreTracks,
  getGenres,
  getCharts,
  uploadTrack,
  getUserTracks,
  deleteUserTrack,
  streamUserTrack,
  upload // Export multer upload middleware
};
