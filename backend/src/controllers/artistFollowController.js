const ArtistFollow = require('../models/ArtistFollow');

// Follow an artist
const followArtist = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { artistId, artistName, artistImage } = req.body;

    if (!artistId || !artistName) {
      return res.status(400).json({ error: 'artistId and artistName are required' });
    }

    // Check if already following
    const existing = await ArtistFollow.findOne({ userId, artistId });
    if (existing) {
      return res.status(400).json({ error: 'Already following this artist' });
    }

    const follow = new ArtistFollow({
      userId,
      artistId,
      artistName,
      artistImage
    });

    await follow.save();
    res.status(201).json({ message: 'Successfully followed artist', follow });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already following this artist' });
    }
    console.error('Error following artist:', error);
    res.status(500).json({ error: 'Failed to follow artist' });
  }
};

// Unfollow an artist
const unfollowArtist = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({ error: 'artistId is required' });
    }

    const result = await ArtistFollow.deleteOne({ userId, artistId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not following this artist' });
    }

    res.json({ message: 'Successfully unfollowed artist' });
  } catch (error) {
    console.error('Error unfollowing artist:', error);
    res.status(500).json({ error: 'Failed to unfollow artist' });
  }
};

// Check if following an artist
const checkArtistFollow = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({ error: 'artistId is required' });
    }

    const follow = await ArtistFollow.findOne({ userId, artistId });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking artist follow:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
};

// Get all followed artists for a user
const getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const follows = await ArtistFollow.find({ userId }).sort({ createdAt: -1 });
    res.json(follows);
  } catch (error) {
    console.error('Error getting followed artists:', error);
    res.status(500).json({ error: 'Failed to get followed artists' });
  }
};

// Check multiple artists follow status
const checkMultipleArtistFollows = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { artistIds } = req.body;

    if (!artistIds || !Array.isArray(artistIds)) {
      return res.status(400).json({ error: 'artistIds array is required' });
    }

    const follows = await ArtistFollow.find({ userId, artistId: { $in: artistIds } });
    const followingMap = follows.reduce((acc, follow) => {
      acc[follow.artistId] = true;
      return acc;
    }, {});

    res.json({ following: followingMap });
  } catch (error) {
    console.error('Error checking multiple artist follows:', error);
    res.status(500).json({ error: 'Failed to check follow statuses' });
  }
};

module.exports = {
  followArtist,
  unfollowArtist,
  checkArtistFollow,
  getFollowedArtists,
  checkMultipleArtistFollows
};
