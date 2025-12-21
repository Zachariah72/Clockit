const express = require('express');
const Artist = require('../models/Artist');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get all artists
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find().populate('genres');
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist by ID
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('genres');
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow artist
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    if (!artist.followers.includes(req.user.id)) {
      artist.followers.push(req.user.id);
      await artist.save();
    }

    res.json({ message: 'Followed artist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow artist
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    artist.followers = artist.followers.filter(id => id.toString() !== req.user.id);
    await artist.save();

    res.json({ message: 'Unfollowed artist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's followed artists
router.get('/followed', auth, async (req, res) => {
  try {
    const artists = await Artist.find({ followers: req.user.id }).populate('genres');
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;