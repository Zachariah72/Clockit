const LiveStream = require('../models/LiveStream');
const { v4: uuidv4 } = require('uuid');

const startLiveStream = async (req, res) => {
  try {
    const { title, description, isPrivate, tags } = req.body;
    const streamId = uuidv4();

    const liveStream = new LiveStream({
      streamId,
      host: req.user.id,
      title,
      description,
      isPrivate,
      tags,
      startedAt: new Date()
    });

    await liveStream.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('live_started', {
        streamId,
        title,
        host: {
          id: req.user.id,
          username: req.user.username || 'Unknown',
          avatar: req.user.avatar_url || null
        },
        startedAt: liveStream.startedAt
      });
    }

    const populatedStream = await LiveStream.findOne({ streamId })
      .populate('host', 'username display_name avatar_url');

    res.status(201).json(populatedStream);
  } catch (error) {
    console.error('Error starting live stream:', error);
    res.status(500).json({ error: 'Failed to start live stream' });
  }
};

const endLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const liveStream = await LiveStream.findOne({ streamId });
    if (!liveStream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (liveStream.host.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to end this stream' });
    }

    liveStream.status = 'ended';
    liveStream.endedAt = new Date();
    liveStream.duration = Math.floor((liveStream.endedAt - liveStream.startedAt) / 1000);
    await liveStream.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`live_${streamId}`).emit('live_ended', { streamId });
    }

    res.json(liveStream);
  } catch (error) {
    console.error('Error ending live stream:', error);
    res.status(500).json({ error: 'Failed to end live stream' });
  }
};

const getActiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({ status: 'live' })
      .populate('host', 'username display_name avatar_url')
      .sort({ startedAt: -1 });

    const streamsWithCount = streams.map(stream => ({
      ...stream.toObject(),
      viewerCount: stream.viewers.filter(v => !v.leftAt).length
    }));

    res.json(streamsWithCount);
  } catch (error) {
    console.error('Error fetching active streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
};

const getStreamDetails = async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await LiveStream.findOne({ streamId })
      .populate('host', 'username display_name avatar_url bio');

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const viewerCount = stream.viewers.filter(v => !v.leftAt).length;

    res.json({
      ...stream.toObject(),
      viewerCount
    });
  } catch (error) {
    console.error('Error fetching stream details:', error);
    res.status(500).json({ error: 'Failed to fetch stream' });
  }
};

const getUserStreams = async (req, res) => {
  try {
    const { userId } = req.params;

    const streams = await LiveStream.find({ host: userId })
      .populate('host', 'username display_name avatar_url')
      .sort({ startedAt: -1 });

    res.json(streams);
  } catch (error) {
    console.error('Error fetching user streams:', error);
    res.status(500).json({ error: 'Failed to fetch user streams' });
  }
};

const joinStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const stream = await LiveStream.findOne({ streamId });
    if (!stream || stream.status !== 'live') {
      return res.status(404).json({ error: 'Stream not found or ended' });
    }

    const currentViewerCount = stream.viewers.filter(v => !v.leftAt).length + 1;
    if (currentViewerCount > stream.peakViewers) {
      stream.peakViewers = currentViewerCount;
    }

    const existingViewer = stream.viewers.find(v => v.user.toString() === userId);
    if (existingViewer) {
      existingViewer.joinedAt = new Date();
      existingViewer.leftAt = null;
    } else {
      stream.viewers.push({
        user: userId,
        joinedAt: new Date()
      });
    }

    await stream.save();

    res.json({ success: true, viewerCount: currentViewerCount });
  } catch (error) {
    console.error('Error joining stream:', error);
    res.status(500).json({ error: 'Failed to join stream' });
  }
};

const leaveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const stream = await LiveStream.findOne({ streamId });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const viewer = stream.viewers.find(v => v.user.toString() === userId);
    if (viewer) {
      viewer.leftAt = new Date();
      await stream.save();
    }

    const viewerCount = stream.viewers.filter(v => !v.leftAt).length;

    res.json({ success: true, viewerCount });
  } catch (error) {
    console.error('Error leaving stream:', error);
    res.status(500).json({ error: 'Failed to leave stream' });
  }
};

const saveRecording = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const stream = await LiveStream.findOne({ streamId });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Only the host can save recording
    if (stream.host.toString() !== userId) {
      return res.status(403).json({ error: 'Only the host can save recording' });
    }

    // Get the file size
    const fs = require('fs');
    const fileSize = fs.statSync(req.file.path).size;

    // Update stream with recording info
    const protocol = req.protocol;
    const host = req.get('host');
    const apiUrl = process.env.API_URL || `${protocol}://${host}`;
    
    stream.recordedVideoUrl = `${apiUrl}/uploads/live-recordings/${req.file.filename}`;
    stream.recordingDuration = Math.floor(fileSize / 1024 / 1024); // Size in MB as duration estimate
    await stream.save();

    console.log(`Recording saved for stream ${streamId}: ${stream.recordedVideoUrl}`);

    res.json({
      success: true,
      recordingUrl: stream.recordedVideoUrl,
      duration: stream.recordingDuration
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({ error: 'Failed to save recording' });
  }
};

module.exports = {
  startLiveStream,
  endLiveStream,
  getActiveStreams,
  getStreamDetails,
  getUserStreams,
  joinStream,
  leaveStream,
  saveRecording
};
