const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: Date,
  endTime: Date,
  duration: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallHistory', callHistorySchema);