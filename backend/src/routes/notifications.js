// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middlewares/auth');

// GET /api/notifications
// Retrieves notifications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('senderId', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications.map(n => ({
      id: n._id,
      type: n.type,
      message: n.message,
      isRead: n.isRead,
      time: n.createdAt,
      sender: n.senderId ? {
        name: n.senderId.username,
        avatar: n.senderId.profileImage || 'https://picsum.photos/seed/default/100/100'
      } : { name: 'System', avatar: 'https://picsum.photos/seed/system/100/100' },
      targetUrl: n.targetUrl || '/'
    })));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUT /api/notifications/:id/read
// Mark a specific notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUT /api/notifications/read-all
// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
