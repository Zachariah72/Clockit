const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['ongoing', 'ended'], default: 'ongoing' }
});

module.exports = mongoose.model('CallSession', callSessionSchema);