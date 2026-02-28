const mongoose = require('mongoose');

const savedContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  contentType: {
    type: String,
    enum: ['reel', 'song', 'post', 'story'],
    required: true
  },

  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Can reference different models based on contentType
    refPath: 'contentModel'
  },

  contentModel: {
    type: String,
    enum: ['Video', 'Song', 'Post', 'Story'],
    required: true
  },

  // Metadata for quick access without populating
  contentData: {
    title: String,
    artist: String, // For songs
    image: String,
    duration: Number, // For songs/videos
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate saves
savedContentSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

// Indexes for efficient queries
savedContentSchema.index({ userId: 1, savedAt: -1 });
savedContentSchema.index({ userId: 1, contentType: 1, savedAt: -1 });

module.exports = mongoose.model('SavedContent', savedContentSchema);