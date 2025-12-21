const mongoose = require('mongoose');

const userStatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileViews: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  posts: { type: Number, default: 0 },
  postReach: { type: Number, default: 0 },
  postImpressions: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  storyViews: { type: Number, default: 0 },
  storyCompletionRate: { type: Number, default: 0 },
  videoWatchTime: { type: Number, default: 0 }, // in seconds
  musicListens: { type: Number, default: 0 },
  musicSaves: { type: Number, default: 0 },
  playlistFollowers: { type: Number, default: 0 },
  messagesSent: { type: Number, default: 0 },
  messagesReceived: { type: Number, default: 0 },
  callDuration: { type: Number, default: 0 }, // in seconds
  activeStreakDays: { type: Number, default: 0 },
  postingFrequency: { type: Number, default: 0 }, // posts per week
  engagementConsistency: { type: Number, default: 0 }, // score 0-100
  timeSpentOnPlatform: { type: Number, default: 0 }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserStat', userStatSchema);