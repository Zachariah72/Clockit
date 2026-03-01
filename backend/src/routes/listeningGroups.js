const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { generalLimiter } = require('../middlewares/rateLimiter');
const {
  createGroup,
  getJoinedGroups,
  discoverGroups,
  joinGroup,
  leaveGroup,
  updatePlayback
} = require('../controllers/listeningGroupController');

// All listening group routes require authentication
router.use(auth);

// GET joined groups
router.get('/', generalLimiter, getJoinedGroups);

// GET discover public groups
router.get('/discover', generalLimiter, discoverGroups);

// POST create group
router.post('/', generalLimiter, createGroup);

// POST join group
router.post('/:id/join', generalLimiter, joinGroup);

// POST leave group
router.post('/:id/leave', generalLimiter, leaveGroup);

// PUT update playback state
router.put('/:id/playback', generalLimiter, updatePlayback);

module.exports = router;