const CallSession = require('../models/CallSession');
const CallHistory = require('../models/CallHistory');

exports.initiateCall = async (req, res) => {
  try {
    const { to, callType } = req.body;
    const from = req.user.id;

    const callSession = new CallSession({
      caller: from,
      receiver: to,
      callType,
      status: 'ringing',
      startTime: new Date(),
    });

    await callSession.save();

    res.status(201).json({ callSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const callSession = await CallSession.findByIdAndUpdate(
      callId,
      { status: 'active' },
      { new: true }
    );

    res.json({ callSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const callSession = await CallSession.findByIdAndUpdate(
      callId,
      { status: 'rejected', endTime: new Date() },
      { new: true }
    );

    // Create call history
    const history = new CallHistory({
      caller: callSession.caller,
      receiver: callSession.receiver,
      callType: callSession.callType,
      status: 'rejected',
      duration: 0,
      startTime: callSession.startTime,
      endTime: new Date(),
    });

    await history.save();

    res.json({ callSession, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const callSession = await CallSession.findById(callId);
    if (!callSession) return res.status(404).json({ error: 'Call not found' });

    const endTime = new Date();
    const duration = Math.floor((endTime - callSession.startTime) / 1000);

    await CallSession.findByIdAndUpdate(
      callId,
      { status: 'ended', endTime },
      { new: true }
    );

    // Create call history
    const history = new CallHistory({
      caller: callSession.caller,
      receiver: callSession.receiver,
      callType: callSession.callType,
      status: 'completed',
      duration,
      startTime: callSession.startTime,
      endTime,
    });

    await history.save();

    res.json({ callSession, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await CallHistory.find({
      $or: [{ caller: userId }, { receiver: userId }],
    }).sort({ startTime: -1 });

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};