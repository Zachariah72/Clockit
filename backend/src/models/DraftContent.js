const mongoose = require('mongoose');

const draftContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  contentType: {
    type: String,
    enum: ['story', 'reel', 'post'],
    required: true
  },

  // Draft data
  title: String,
  description: String,
  content: String, // Text content
  mediaUrls: [String], // Array of media file URLs
  thumbnailUrl: String,

  // Progress tracking
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Metadata
  tags: [String],
  location: String,
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },

  // Draft status
  isCompleted: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  }
});

// Indexes
draftContentSchema.index({ userId: 1, contentType: 1, lastEditedAt: -1 });
draftContentSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to update lastEditedAt
draftContentSchema.pre('save', function(next) {
  this.lastEditedAt = new Date();
  next();
});

module.exports = mongoose.model('DraftContent', draftContentSchema);