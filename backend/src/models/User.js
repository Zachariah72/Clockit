const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String }, // Optional for OAuth users
  providers: [{
    provider: { type: String, enum: ['google', 'facebook', 'apple', 'supabase'], required: true },
    providerId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String }
  }],
  supabaseId: { type: String }, // For Supabase OAuth users
  resetToken: String,
  resetTokenExpiry: Date,

  // Profile fields
  bio: { type: String, maxlength: 150 },
  avatar: { type: String },
  linkInBio: { type: String },
  pinnedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],

  // Social stats (computed fields)
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  storiesCount: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },

  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  markedForDeletion: { type: Boolean, default: false },
  deletionRequestedAt: Date,

  // Safety settings
  commentControls: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  duetPermissions: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  stitchPermissions: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  downloadPermissions: { type: Boolean, default: true },
  sensitiveContent: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  screenTimeLimit: Number, // in minutes

  // Theme preferences
  theme: { type: String, enum: ['light', 'dark', 'black', 'teal'], default: 'dark' },
  customColors: {
    primary: String,
    secondary: String,
    accent: String
  },

  // Premium features
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);