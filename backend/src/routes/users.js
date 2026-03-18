const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');
const OnboardingPreference = require('../models/OnboardingPreference');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save onboarding preferences
router.post('/onboarding', auth, async (req, res) => {
  try {
    const { musicGenres, moodModes, contentInterests, hobbiesActivities } = req.body;
    const userId = req.user.id;

    let preference = await OnboardingPreference.findOne({ userId });
    if (preference) {
      preference.musicGenres = musicGenres || [];
      preference.moodModes = moodModes || [];
      preference.contentInterests = contentInterests || [];
      preference.hobbiesActivities = hobbiesActivities || [];
      preference.completed = true;
    } else {
      preference = new OnboardingPreference({
        userId,
        musicGenres: musicGenres || [],
        moodModes: moodModes || [],
        contentInterests: contentInterests || [],
        hobbiesActivities: hobbiesActivities || [],
        completed: true
      });
    }
    await preference.save();
    res.json({ message: 'Onboarding preferences saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user playlists
router.get('/playlists', auth, async (req, res) => {
  try {
    const Playlist = require('../models/Playlist');
    const playlists = await Playlist.find({ userId: req.user.id });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create playlist
router.post('/playlists', auth, async (req, res) => {
  try {
    const Playlist = require('../models/Playlist');
    const { name, description, isPublic } = req.body;
    const playlist = new Playlist({
      userId: req.user.id,
      name,
      description,
      isPublic
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update safety settings
router.put('/safety', auth, async (req, res) => {
  try {
    const { isPrivate, commentControls, duetPermissions, stitchPermissions, downloadPermissions, sensitiveContent, twoFactorEnabled, screenTimeLimit } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, {
      isPrivate,
      commentControls,
      duetPermissions,
      stitchPermissions,
      downloadPermissions,
      sensitiveContent,
      twoFactorEnabled,
      screenTimeLimit
    }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user suggestions to follow
router.get('/suggestions', auth, async (req, res) => {
  try {
    const Follow = require('../models/Follow');
    const following = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = following.map(f => f.following);
    followingIds.push(req.user.id);
    
    const suggested = await User.find({ _id: { $nin: followingIds } })
      .select('username displayName profileImage avatar_url')
      .limit(5);
      
    res.json(suggested.map(u => ({
      id: u._id,
      name: u.displayName || u.username,
      handle: `@${u.username}`,
      image: u.profileImage || u.avatar_url || 'https://picsum.photos/seed/user/100/100',
      subtitle: 'Suggested for you'
    })));
  } catch (err) {
    console.error("Suggestions error", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    
    const Follow = require('../models/Follow');
    const existingFollow = await Follow.findOne({ follower: req.user.id, following: targetUserId });
    
    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      return res.json({ action: 'unfollowed' });
    } else {
      const follow = new Follow({ follower: req.user.id, following: targetUserId });
      await follow.save();
      
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: targetUserId,
        senderId: req.user.id,
        type: 'follow',
        message: 'started following you',
        targetUrl: `/profile/${req.user.id}`
      });
      
      return res.json({ action: 'followed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;