const express = require('express');
const mongoose = require('mongoose');
const ListeningGroup = require('../models/ListeningGroup');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get user's listening groups
router.get('/', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const groups = await ListeningGroup.find({
      $or: [
        { creator: userId },
        { members: userId }
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
    const { name, description, isPublic, isPrivate } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const group = new ListeningGroup({
      name,
      description,
      creator: userId,
      members: [userId],
      isPublic: isPublic !== undefined ? isPublic : (isPrivate !== undefined ? !isPrivate : true)
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
    let group;
    try {
      group = await ListeningGroup.findById(req.params.id);
    } catch (findError) {
      // If ID is invalid, treat as new group
      group = null;
    }
    
    // If group doesn't exist, create a new one
    if (!group) {
      group = new ListeningGroup({
        name: req.body.groupName || 'New Group',
        description: req.body.description || 'A listening group',
        creator: req.user.id,
        members: [req.user.id],
        isPublic: true
      });
      await group.save();
    } else {
      // Convert user.id to ObjectId for proper comparison
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const isAlreadyMember = group.members.some(
        (member) => member.toString() === userId.toString()
      );
      
      if (!isAlreadyMember) {
        group.members.push(req.user.id);
        await group.save();
      }
    }

    res.json({ message: 'Joined group', group });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Discover public groups (not created by user, not already joined)
router.get('/discover', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const groups = await ListeningGroup.find({
      isPublic: true,
      creator: { $ne: userId },
      members: { $ne: userId }
    })
      .populate('creator', 'username')
      .limit(20)
      .sort({ createdAt: -1 });
    res.json(groups);
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