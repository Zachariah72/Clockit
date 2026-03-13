const Playlist = require('../models/Playlist');

// Create a new playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverImage, theme } = req.body;
    const userId = req.user.id;

    const playlist = new Playlist({
      userId,
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      coverImage,
      theme,
      tracks: []
    });

    await playlist.save();
    return res.status(201).json(playlist);
  } catch (err) {
    console.error('Error creating playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all playlists for the current user
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    return res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a single playlist by id
const getPlaylistById = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    return res.json(playlist);
  } catch (err) {
    console.error('Error fetching playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update playlist details
const updatePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, isPublic, coverImage, theme } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (theme !== undefined) updates.theme = theme;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    return res.json(playlist);
  } catch (err) {
    console.error('Error updating playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a playlist
const deletePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, userId });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    return res.json({ message: 'Playlist deleted' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add a track to a playlist
const addTrack = async (req, res) => {
  try {
    const { trackId, source, metadata } = req.body;
    const userId = req.user.id;

    if (!trackId || !source) {
      return res.status(400).json({ message: 'Missing trackId or source' });
    }

    const playlist = await Playlist.findOne({ _id: req.params.id, userId });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    const trackExists = playlist.tracks.find(
      (t) => t.trackId === trackId && t.source === source
    );

    if (trackExists) {
      return res.status(400).json({ message: 'Track already in playlist' });
    }

    playlist.tracks.push({
      trackId,
      source,
      metadata,
      addedAt: Date.now()
    });

    await playlist.save();
    return res.json(playlist);
  } catch (err) {
    console.error('Error adding track to playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remove a track from a playlist
const removeTrack = async (req, res) => {
  try {
    const { trackId, source } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: req.params.id, userId });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    playlist.tracks = playlist.tracks.filter(
      (t) => !(t.trackId === trackId && t.source === source)
    );

    await playlist.save();
    return res.json(playlist);
  } catch (err) {
    console.error('Error removing track from playlist:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Placeholder to satisfy routes if referenced by playlists router
const getFollowedArtists = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get followed artists',
      error: error.message
    });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrack,
  removeTrack,
  getFollowedArtists
};
