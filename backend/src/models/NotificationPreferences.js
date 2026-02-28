const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Push Notifications
  push: {
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    newFollowers: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    calls: { type: Boolean, default: true },
    storyViews: { type: Boolean, default: false },
    liveSessions: { type: Boolean, default: true },
    musicDrops: { type: Boolean, default: true },
    recommendations: { type: Boolean, default: false }
  },

  // In-App Notifications
  inApp: {
    engagement: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true },
    creatorTips: { type: Boolean, default: false },
    announcements: { type: Boolean, default: true }
  },

  // Notification Controls
  controls: {
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // HH:MM
      end: { type: String, default: '08:00' }   // HH:MM
    },
    sounds: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
    priorityAlerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

notificationPreferencesSchema.index({ userId: 1 });

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);