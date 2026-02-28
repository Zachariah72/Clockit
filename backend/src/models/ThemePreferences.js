const mongoose = require('mongoose');

const themePreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Selected Theme
  selectedTheme: {
    type: String,
    enum: [
      'default-dark',
      'default-light',
      'midnight-black',
      'ocean-blue',
      'emerald-green',
      'sunset-orange',
      'royal-purple',
      'crimson-red',
      'soft-pastel',
      'neon-glow',
      'system-default'
    ],
    default: 'default-dark'
  },

  // Accessibility Settings
  accessibility: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    reduceAnimations: {
      type: Boolean,
      default: false
    },
    captionsAlwaysOn: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    }
  },

  // Language & Region
  localization: {
    language: {
      type: String,
      default: 'en'
    },
    region: {
      type: String,
      default: 'US'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true
});

themePreferencesSchema.index({ userId: 1 });

module.exports = mongoose.model('ThemePreferences', themePreferencesSchema);