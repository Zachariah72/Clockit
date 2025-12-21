const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Playlist = require('../../backend/src/models/Playlist');

const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    let user;
    try {
      user = authenticate(req);
    } catch (error) {
      if (req.method !== 'GET') {
        return res.status(401).json({ message: 'Authentication required' });
      }
    }

    switch (req.method) {
      case 'GET':
        // Get user's playlists
        const playlists = await Playlist.find({ userId: user?.id }).populate('songs');
        return res.json(playlists);

      case 'POST':
        // Create new playlist
        const { name, description, isPublic } = req.body;
        const playlist = new Playlist({
          userId: user.id,
          name,
          description,
          isPublic: isPublic !== undefined ? isPublic : true
        });
        await playlist.save();
        return res.status(201).json(playlist);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Playlists API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};