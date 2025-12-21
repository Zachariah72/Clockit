const express = require('express');
const ListeningGroup = require('../models/ListeningGroup');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get user's listening groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await ListeningGroup.find({
      $or: [
        { creator: req.user.id },
        { members: req.user.id }
      ]
    }).populate('creator').populate('members').populate('currentSong');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listening group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const group = new ListeningGroup({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
      isPublic: isPublic !== undefined ? isPublic : true
    });
    await group.save();
    await group.populate('creator');
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Join listening group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await ListeningGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.json({ message: 'Joined group' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update group playback
router.put('/:id/playback', auth, async (req, res) => {
  try {
    const { currentSong, isPlaying, currentTime } = req.body;
    const group = await ListeningGroup.findOneAndUpdate(
      { _id: req.params.id, members: req.user.id },
      { currentSong, isPlaying, currentTime },
      { new: true }
    ).populate('currentSong');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add song to group playlist
router.post('/:id/songs', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const group = await ListeningGroup.findOneAndUpdate(
      { _id: req.params.id, members: req.user.id },
      { $addToSet: { playlist: songId } },
      { new: true }
    ).populate('playlist');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;