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
        res.status(201).json(playlist);
    } catch (err) {
        console.error('Error creating playlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all playlists for the current user
const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(playlists);
    } catch (err) {
        console.error('Error fetching playlists:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific playlist by ID
const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ _id: req.params.id });

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check visibility
        if (!playlist.isPublic && playlist.userId.toString() !== req.user.id) {
            return res.status(12: export const getFollowedArtists = async () => {
                return api.get < any[] > ('/artists/follow/following');
            };
            403).json({ message: 'Private playlist' });
        }

        res.json(playlist);
    } catch (err) {
        console.error('Error fetching playlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update playlist details
const updatePlaylist = async (req, res) => {
    try {
        const { name, description, isPublic, coverImage, theme } = req.body;
        const userId = req.user.id;

        const playlist = await Playlist.findOneAndUpdate(
            { _id: req.params.id, userId },
            { name, description, isPublic, coverImage, theme, updatedAt: Date.now() },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or unauthorized' });
        }

        res.json(playlist);
    } catch (err) {
        console.error('Error updating playlist:', err);
        res.status(500).json({ message: 'Server error' });
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

        res.json({ message: 'Playlist deleted' });
    } catch (err) {
        console.error('Error deleting playlist:', err);
        res.status(500).json({ message: 'Server error' });
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

        // Check if track already exists in playlist to avoid duplicates
        const trackExists = playlist.tracks.find(t => t.trackId === trackId && t.source === source);
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
        res.json(playlist);
    } catch (err) {
        console.error('Error adding track to playlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove a track from a playlist
const removeTrack = async (req, res) => {
    try {
        const { trackId, source } = req.body; // or identify by sub-doc ID
        const userId = req.user.id;

        const playlist = await Playlist.findOne({ _id: req.params.id, userId });

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or unauthorized' });
        }

        playlist.tracks = playlist.tracks.filter(t => !(t.trackId === trackId && t.source === source));

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        console.error('Error removing track from playlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addTrack,
    removeTrack
};
