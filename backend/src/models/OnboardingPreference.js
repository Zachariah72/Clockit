const mongoose = require('mongoose');

const onboardingPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  musicGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  moodModes: [String],
  contentInterests: [String],
  hobbiesActivities: [String],
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnboardingPreference', onboardingPreferenceSchema);