const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  streamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['live', 'ended'],
    default: 'live'
  },
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }],
  peakViewers: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  thumbnail: String,
  tags: [String],
  recordedVideoUrl: {
    type: String,
    default: null
  },
  recordingDuration: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
}, {
  timestamps: true
});

liveStreamSchema.index({ status: 1, startedAt: -1 });

module.exports = mongoose.model('LiveStream', liveStreamSchema);
