const mongoose = require('mongoose');

const audienceInsightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followerGrowth: [{
    date: { type: Date },
    count: { type: Number }
  }],
  activeHours: [{
    hour: { type: Number }, // 0-23
    percentage: { type: Number }
  }],
  topCountries: [{
    country: { type: String },
    count: { type: Number }
  }],
  topRegions: [{
    region: { type: String },
    count: { type: Number }
  }],
  contentPreferences: [{
    type: { type: String }, // video, story, music, etc.
    percentage: { type: Number }
  }],
  musicTasteOverlap: { type: Number, default: 0 }, // percentage
  demographics: {
    ageGroups: [{
      range: { type: String }, // e.g., "18-24"
      percentage: { type: Number }
    }],
    gender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  interests: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AudienceInsight', audienceInsightSchema);