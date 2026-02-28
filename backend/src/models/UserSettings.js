const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Account Settings
  account: {
    accountType: {
      type: String,
      enum: ['personal', 'creator', 'business'],
      default: 'personal'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    connectedAccounts: {
      google: { type: Boolean, default: false },
      apple: { type: Boolean, default: false },
      facebook: { type: Boolean, default: false },
      twitter: { type: Boolean, default: false }
    }
  },

  // Privacy & Security
  privacy: {
    accountVisibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    showActivityStatus: {
      type: Boolean,
      default: true
    },
    readReceipts: {
      type: Boolean,
      default: true
    },
    showLastSeen: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    allowCalls: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    allowStoryViews: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    allowStoryReplies: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    allowComments: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    allowDuets: {
      type: String,
      enum: ['everyone', 'friends', 'noone'],
      default: 'everyone'
    },
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    mutedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    hiddenWords: [String],
    sensitiveContentFilter: {
      type: Boolean,
      default: true
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },

  // Messaging & Calls
  messaging: {
    readReceipts: {
      type: Boolean,
      default: true
    },
    typingIndicators: {
      type: Boolean,
      default: true
    },
    disappearingMessages: {
      type: Number, // hours, 0 = disabled
      default: 0
    },
    mediaAutoDownload: {
      type: String,
      enum: ['wifi', 'mobile', 'never'],
      default: 'wifi'
    },
    callRingtone: {
      type: String,
      default: 'default'
    },
    callVibration: {
      type: Boolean,
      default: true
    },
    callHistoryVisibility: {
      type: String,
      enum: ['everyone', 'friends', 'private'],
      default: 'friends'
    },
    blockUnknownCalls: {
      type: Boolean,
      default: false
    }
  },

  // Music & Audio
  music: {
    preferredGenres: [String],
    preferredLanguages: [String],
    explicitContentFilter: {
      type: Boolean,
      default: true
    },
    musicQuality: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    downloadOverWifiOnly: {
      type: Boolean,
      default: true
    },
    autoPlayMusic: {
      type: Boolean,
      default: false
    },
    backgroundPlayback: {
      type: Boolean,
      default: true
    },
    showLyrics: {
      type: Boolean,
      default: true
    },
    syncListeningHistory: {
      type: Boolean,
      default: true
    },
    groupListeningPermissions: {
      type: String,
      enum: ['everyone', 'friends', 'admins'],
      default: 'friends'
    }
  },

  // Content & Feed Preferences
  content: {
    interests: [String],
    contentLanguage: {
      type: String,
      default: 'en'
    },
    videoAutoplay: {
      type: Boolean,
      default: true
    },
    dataSaver: {
      type: Boolean,
      default: false
    },
    reduceMotion: {
      type: Boolean,
      default: false
    },
    hideViewedPosts: {
      type: Boolean,
      default: false
    },
    trendingVsFollowing: {
      type: Number, // 0-100, 0 = all following, 100 = all trending
      default: 50
    },
    soundOnByDefault: {
      type: Boolean,
      default: false
    }
  },

  // Analytics & Insights
  analytics: {
    showAnalytics: {
      type: Boolean,
      default: true
    },
    analyticsVisibility: {
      type: String,
      enum: ['private', 'followers'],
      default: 'private'
    },
    weeklySummary: {
      type: Boolean,
      default: true
    },
    performanceNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Screen Time & Wellbeing
  wellbeing: {
    dailyLimit: {
      type: Number, // minutes
      default: 0 // 0 = no limit
    },
    breakReminders: {
      type: Boolean,
      default: false
    },
    lateNightWarnings: {
      type: Boolean,
      default: true
    },
    focusHoursStart: String, // HH:MM format
    focusHoursEnd: String, // HH:MM format
    muteDuringFocus: {
      type: Boolean,
      default: true
    }
  },

  // App & Data
  app: {
    offlineMode: {
      type: Boolean,
      default: false
    },
    autoUpdate: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes
userSettingsSchema.index({ userId: 1 });
userSettingsSchema.index({ 'privacy.blockedUsers': 1 });
userSettingsSchema.index({ 'privacy.mutedUsers': 1 });

module.exports = mongoose.model('UserSettings', userSettingsSchema);