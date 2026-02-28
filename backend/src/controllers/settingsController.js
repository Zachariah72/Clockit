const UserSettings = require('../models/UserSettings');
const NotificationPreferences = require('../models/NotificationPreferences');
const ThemePreferences = require('../models/ThemePreferences');
const DeviceSessions = require('../models/DeviceSessions');
const User = require('../models/User');

// Get all user settings
exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userSettings, notificationPrefs, themePrefs, deviceSessions] = await Promise.all([
      UserSettings.findOne({ userId }).populate('privacy.blockedUsers', 'username').populate('privacy.mutedUsers', 'username'),
      NotificationPreferences.findOne({ userId }),
      ThemePreferences.findOne({ userId }),
      DeviceSessions.find({ userId, isActive: true }).sort({ lastActivity: -1 })
    ]);

    // Return defaults if no settings exist
    const settings = {
      userSettings: userSettings || {
        account: { accountType: 'personal', isVerified: false, connectedAccounts: {} },
        privacy: {
          accountVisibility: 'public',
          showActivityStatus: true,
          readReceipts: true,
          showLastSeen: true,
          allowMessages: 'everyone',
          allowCalls: 'everyone',
          allowStoryViews: 'everyone',
          allowStoryReplies: 'everyone',
          allowComments: 'everyone',
          allowDuets: 'everyone',
          blockedUsers: [],
          mutedUsers: [],
          hiddenWords: [],
          sensitiveContentFilter: true,
          twoFactorEnabled: false
        },
        messaging: {
          readReceipts: true,
          typingIndicators: true,
          disappearingMessages: 0,
          mediaAutoDownload: 'wifi',
          callRingtone: 'default',
          callVibration: true,
          callHistoryVisibility: 'friends',
          blockUnknownCalls: false
        },
        music: {
          preferredGenres: [],
          preferredLanguages: [],
          explicitContentFilter: true,
          musicQuality: 'normal',
          downloadOverWifiOnly: true,
          autoPlayMusic: false,
          backgroundPlayback: true,
          showLyrics: true,
          syncListeningHistory: true,
          groupListeningPermissions: 'friends'
        },
        content: {
          interests: [],
          contentLanguage: 'en',
          videoAutoplay: true,
          dataSaver: false,
          reduceMotion: false,
          hideViewedPosts: false,
          trendingVsFollowing: 50,
          soundOnByDefault: false
        },
        analytics: {
          showAnalytics: true,
          analyticsVisibility: 'private',
          weeklySummary: true,
          performanceNotifications: true
        },
        wellbeing: {
          dailyLimit: 0,
          breakReminders: false,
          lateNightWarnings: true,
          muteDuringFocus: true
        },
        app: {
          offlineMode: false,
          autoUpdate: true
        }
      },
      notificationPreferences: notificationPrefs || {
        push: {
          likes: true, comments: true, mentions: true, newFollowers: true,
          messages: true, calls: true, storyViews: false, liveSessions: true,
          musicDrops: true, recommendations: false
        },
        inApp: {
          engagement: true, systemUpdates: true, creatorTips: false, announcements: true
        },
        controls: {
          quietHours: { enabled: false, start: '22:00', end: '08:00' },
          sounds: true, vibration: true, priorityAlerts: true
        }
      },
      themePreferences: themePrefs || {
        selectedTheme: 'default-dark',
        accessibility: {
          fontSize: 'medium', highContrast: false, reduceAnimations: false,
          captionsAlwaysOn: false, screenReader: false
        },
        localization: {
          language: 'en', region: 'US', timezone: 'UTC'
        }
      },
      deviceSessions: deviceSessions || []
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove runValidators to allow partial updates for new fields
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('privacy.blockedUsers', 'username').populate('privacy.mutedUsers', 'username');

    res.json(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const preferences = await NotificationPreferences.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
};

// Update theme preferences
exports.updateThemePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const preferences = await ThemePreferences.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating theme preferences:', error);
    res.status(500).json({ message: 'Failed to update theme preferences' });
  }
};

// Get device sessions
exports.getDeviceSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await DeviceSessions.find({ userId }).sort({ lastActivity: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching device sessions:', error);
    res.status(500).json({ message: 'Failed to fetch device sessions' });
  }
};

// Logout from specific device
exports.logoutDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;

    await DeviceSessions.findOneAndUpdate(
      { userId, deviceId },
      { isActive: false, logoutTime: new Date() }
    );

    res.json({ message: 'Device logged out successfully' });
  } catch (error) {
    console.error('Error logging out device:', error);
    res.status(500).json({ message: 'Failed to logout device' });
  }
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    await DeviceSessions.updateMany(
      { userId },
      { isActive: false, logoutTime: new Date() }
    );

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Error logging out all devices:', error);
    res.status(500).json({ message: 'Failed to logout from all devices' });
  }
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark user as deactivated (soft delete)
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      deactivatedAt: new Date()
    });

    // Logout all sessions
    await DeviceSessions.updateMany(
      { userId },
      { isActive: false, logoutTime: new Date() }
    );

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Failed to deactivate account' });
  }
};

// Delete account (hard delete with cooldown)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark for deletion (implement cooldown logic in production)
    await User.findByIdAndUpdate(userId, {
      markedForDeletion: true,
      deletionRequestedAt: new Date()
    });

    res.json({
      message: 'Account deletion requested. You have 30 days to cancel this request.',
      cooldownDays: 30
    });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ message: 'Failed to request account deletion' });
  }
};