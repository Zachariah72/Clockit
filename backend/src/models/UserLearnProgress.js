const mongoose = require('mongoose');

const userLearnProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  courseId: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  lastPosition: { type: Number, default: 0 }, // last timestamp in seconds
  lastAccessed: { type: Date, default: Date.now }
});

userLearnProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
userLearnProgressSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.model('UserLearnProgress', userLearnProgressSchema);
