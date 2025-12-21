const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  providers: [{
    provider: { type: String, enum: ['google', 'facebook', 'apple'], required: true },
    providerId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String }
  }],
  resetToken: String,
  resetTokenExpiry: Date,
  // Profile fields
  bio: String,
  avatar: String,
  linkInBio: String,
  pinnedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  // Safety settings
  isPrivate: { type: Boolean, default: false },
  commentControls: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  duetPermissions: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  stitchPermissions: { type: String, enum: ['everyone', 'friends', 'no_one'], default: 'everyone' },
  downloadPermissions: { type: Boolean, default: true },
  sensitiveContent: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  screenTimeLimit: Number, // in minutes
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);