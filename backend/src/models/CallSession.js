const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callType: { type: String, enum: ['audio', 'video'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['ringing', 'active', 'ended', 'rejected'], default: 'ringing' }
});

module.exports = mongoose.model('CallSession', callSessionSchema);