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

module.exports = router;