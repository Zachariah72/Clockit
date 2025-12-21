const express = require('express');
const ListeningHistory = require('../models/ListeningHistory');
const auth = require('../middlewares/auth');

const router = express.Router();

// Record listening
router.post('/', auth, async (req, res) => {
  try {
    const { musicId } = req.body;
    const history = new ListeningHistory({
      userId: req.user.id,
      musicId
    });
    await history.save();
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's listening history
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await ListeningHistory.find({ userId: req.user.id })
      .populate('musicId')
      .sort({ listenedAt: -1 })
      .limit(limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;