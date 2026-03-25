const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username displayName avatar')
      .limit(50);

    // Add targetUrl and format time
    const formatted = notifications.map(n => ({
      id: n._id.toString(),
      type: n.type,
      message: n.message,
      time: n.createdAt.toISOString().split('T')[0],
      isRead: n.isRead,
      sender: n.senderId ? {
        name: n.senderId.displayName || n.senderId.username,
        avatar: n.senderId.avatar
      } : undefined,
      targetUrl: n.type === 'follow' ? `/profile/${n.senderId ? n.senderId.username : ''}` : undefined
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

