const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  contentType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },

  mediaUrl: {
    type: String,
    required: true
  },

  thumbnailUrl: String,

  // Story content
  caption: {
    type: String,
    maxlength: 100
  },

  // Engagement metrics
  views: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],

  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Computed fields (updated via aggregation)
  viewsCount: {
    type: Number,
    default: 0
  },

  likesCount: {
    type: Number,
    default: 0
  },

  // Story settings
  isPublic: {
    type: Boolean,
    default: true
  },

  // Music/sticker data
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  },

  stickers: [{
    type: {
      type: String,
      enum: ['text', 'emoji', 'gif']
    },
    content: String,
    position: {
      x: Number,
      y: Number
    },
    style: mongoose.Schema.Types.Mixed
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// Indexes
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
storySchema.index({ 'views.userId': 1 });
storySchema.index({ 'likes.userId': 1 });

// Virtual for checking if story is expired
storySchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to add view
storySchema.methods.addView = function(userId) {
  const existingView = this.views.find(view => view.userId.toString() === userId.toString());
  if (!existingView) {
    this.views.push({ userId, viewedAt: new Date() });
    this.viewsCount = this.views.length;
    return true;
  }
  return false;
};

// Method to toggle like
storySchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.userId.toString() === userId.toString());

  if (likeIndex > -1) {
    // Remove like
    this.likes.splice(likeIndex, 1);
    this.likesCount = this.likes.length;
    return false; // unliked
  } else {
    // Add like
    this.likes.push({ userId, likedAt: new Date() });
    this.likesCount = this.likes.length;
    return true; // liked
  }
};

module.exports = mongoose.model('Story', storySchema);