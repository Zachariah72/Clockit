const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in seconds
  audioUrl: { type: String, required: true },
  artwork: { type: String },
  transcript: { type: String },
  order: { type: Number, default: 0 }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
  order: { type: Number, default: 0 }
});

const learningPathSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // slug like 'french-basics'
  disciplineId: { type: String, required: true }, // 'languages', 'wellness', etc.
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  modules: [moduleSchema],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

learningPathSchema.index({ disciplineId: 1 });
learningPathSchema.index({ title: 'text' });

module.exports = mongoose.model('LearningPath', learningPathSchema);
