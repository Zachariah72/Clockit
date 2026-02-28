const express = require('express');
const Album = require('../models/Album');
const Artist = require('../models/Artist');
const Notification = require('../models/Notification');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get all albums
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find().populate('artist').populate('genres').populate('tracks');
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get album by ID
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('artist').populate('genres').populate('tracks');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pre-save album
router.post('/:id/presave', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    if (!album.preSaveUsers.includes(req.user.id)) {
      album.preSaveUsers.push(req.user.id);
      await album.save();
    }

    res.json({ message: 'Pre-saved album' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Release album (admin/artist only - simplified)
router.post('/:id/release', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('artist');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    album.isReleased = true;
    await album.save();

    // Notify followers
    const artist = await Artist.findById(album.artist._id).populate('followers');
    const notifications = artist.followers.map(follower => ({
      userId: follower._id,
      type: 'new_release',
      message: `New album "${album.title}" by ${artist.name} is now available!`
    }));

    await Notification.insertMany(notifications);

    res.json({ message: 'Album released and notifications sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming albums for pre-save
router.get('/upcoming', async (req, res) => {
  try {
    const upcoming = await Album.find({ isReleased: false, releaseDate: { $gte: new Date() } })
      .populate('artist')
      .sort({ releaseDate: 1 });
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;