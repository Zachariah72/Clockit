require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const UserPresence = require('./models/UserPresence');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://clockit-sage.vercel.app", "https://clockit-gvm2.onrender.com", "http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }
});

// Middleware
app.use(cors({
  origin: ["https://clockit-sage.vercel.app", "https://clockit-gvm2.onrender.com", "http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/feeds', require('./routes/feeds'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/wrapped', require('./routes/wrapped'));
app.use('/api/listening', require('./routes/listening'));
app.use('/api/listening-groups', require('./routes/listeningGroups'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/lastfm', require('./routes/lastfm'));
app.use('/api/search', require('./routes/search'));
app.use('/api/theme', require('./routes/theme'));
app.use('/api/messages', require('./routes/messages'));

// Socket.IO authentication middleware - temporarily disabled
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error('Authentication error'));
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded.id;
//     next();
//   } catch (err) {
//     next(new Error('Authentication error'));
//   }
// });

// For now, set userId from query or something - TODO: proper auth
io.use((socket, next) => {
  // Assume userId is passed in query for demo
  socket.userId = socket.handshake.query.userId || 'test-user';
  next();
});

// Socket.IO setup
io.on('connection', async (socket) => {
  console.log('New client connected:', socket.userId);

  // Set user online
  await UserPresence.findOneAndUpdate(
    { userId: socket.userId },
    { status: 'online', lastSeen: new Date() },
    { upsert: true, new: true }
  );

  // Join user's room for personal messages
  socket.join(socket.userId);

  // Emit online status to friends/followers
  socket.broadcast.emit('user_online', { userId: socket.userId });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.userId);
    // Set user offline
    await UserPresence.findOneAndUpdate(
      { userId: socket.userId },
      { status: 'offline', lastSeen: new Date() },
      { upsert: true, new: true }
    );
    socket.broadcast.emit('user_offline', { userId: socket.userId });
  });

  // Handle messaging events
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, type = 'text' } = data;

      // Save message to database
      const Message = require('./models/Message');
      const message = new Message({
        conversation_id: conversationId,
        sender_id: socket.userId,
        content,
        type,
        is_read: false
      });

      await message.save();

      // Update conversation's last message
      const Conversation = require('./models/Conversation');
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      // Populate message with sender info
      const populatedMessage = await Message.findById(message._id)
        .populate('sender_id', 'username display_name avatar_url');

      // Send to all participants in conversation
      const conversation = await Conversation.findById(conversationId);
      conversation.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('new_message', {
          conversationId,
          message: populatedMessage
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // WebRTC signaling events
  socket.on('call-user', async (data) => {
    const { to, from, callType } = data; // callType: 'audio' or 'video'

    // Create call session in database
    try {
      const CallSession = require('./models/CallSession');
      const callSession = new CallSession({
        caller: from,
        receiver: to,
        callType,
        status: 'ringing',
        startTime: new Date(),
      });
      await callSession.save();

      // Send call with session ID
      io.to(to).emit('incoming-call', {
        from,
        callType,
        callId: callSession._id
      });
    } catch (error) {
      console.error('Error creating call session:', error);
      socket.emit('call_error', { error: 'Failed to initiate call' });
    }
  });

  socket.on('accept-call', async (data) => {
    const { callId } = data;
    try {
      const CallSession = require('./models/CallSession');
      await CallSession.findByIdAndUpdate(callId, { status: 'active' });

      // Find the call session to get caller
      const callSession = await CallSession.findById(callId);
      if (callSession) {
        io.to(callSession.caller.toString()).emit('call-accepted');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  });

  socket.on('reject-call', async (data) => {
    const { callId } = data;
    try {
      const CallSession = require('./models/CallSession');
      const callSession = await CallSession.findById(callId);

      if (callSession) {
        await CallSession.findByIdAndUpdate(callId, {
          status: 'rejected',
          endTime: new Date()
        });

        // Create call history
        const CallHistory = require('./models/CallHistory');
        const isCallerRejecting = callSession.caller.toString() === socket.userId;
        const status = isCallerRejecting ? 'cancelled' : 'missed';

        const history = new CallHistory({
          caller: callSession.caller,
          receiver: callSession.receiver,
          callType: callSession.callType,
          status: status,
          duration: 0,
          startTime: callSession.startTime,
          endTime: new Date(),
        });
        await history.save();

        io.to(callSession.caller.toString()).emit('call-rejected');
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  });

  socket.on('offer', (data) => {
    const { to, offer } = data;
    io.to(to).emit('offer', { from: socket.userId, offer });
  });

  socket.on('answer', (data) => {
    const { to, answer } = data;
    io.to(to).emit('answer', { from: socket.userId, answer });
  });

  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    io.to(to).emit('ice-candidate', { from: socket.userId, candidate });
  });

  socket.on('end-call', async (data) => {
    const { callId } = data;
    try {
      const CallSession = require('./models/CallSession');
      const callSession = await CallSession.findById(callId);

      if (callSession) {
        const endTime = new Date();
        const duration = Math.floor((endTime - callSession.startTime) / 1000);

        await CallSession.findByIdAndUpdate(callId, {
          status: 'ended',
          endTime
        });

        // Create call history
        const CallHistory = require('./models/CallHistory');
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

        // Notify the other participant
        const otherParticipant = callSession.caller.toString() === socket.userId
          ? callSession.receiver.toString()
          : callSession.caller.toString();

        io.to(otherParticipant).emit('call-ended');
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  });

  socket.on('start-call', async () => {
    // Set user in-call
    await UserPresence.findOneAndUpdate(
      { userId: socket.userId },
      { status: 'in-call', lastSeen: new Date() },
      { upsert: true, new: true }
    );
    socket.broadcast.emit('user_in_call', { userId: socket.userId });
  });

  socket.on('end-call-status', async () => {
    // Set user online again
    await UserPresence.findOneAndUpdate(
      { userId: socket.userId },
      { status: 'online', lastSeen: new Date() },
      { upsert: true, new: true }
    );
    socket.broadcast.emit('user_online', { userId: socket.userId });
  });

  // Real-time content events
  socket.on('new_comment', (data) => {
    // data: { contentId, contentType, comment }
    socket.broadcast.emit('comment_added', data);
  });

  socket.on('new_like', (data) => {
    // data: { contentId, contentType, userId }
    socket.broadcast.emit('like_added', data);
  });

  socket.on('story_viewed', (data) => {
    // data: { storyId, userId }
    socket.broadcast.emit('story_view_update', data);
  });

  // Live streaming events
  socket.on('start_live', (data) => {
    // data: { streamId, title }
    socket.broadcast.emit('live_started', { ...data, userId: socket.userId });
  });

  socket.on('join_live', (data) => {
    // data: { streamId }
    socket.join(`live_${data.streamId}`);
    socket.to(`live_${data.streamId}`).emit('viewer_joined', { userId: socket.userId });
  });

  socket.on('live_comment', (data) => {
    // data: { streamId, comment }
    socket.to(`live_${data.streamId}`).emit('live_comment_added', { ...data, userId: socket.userId });
  });

  socket.on('send_gift', (data) => {
    // data: { streamId, giftType, amount }
    socket.to(`live_${data.streamId}`).emit('gift_received', { ...data, fromUserId: socket.userId });
  });

  socket.on('co_host_request', (data) => {
    // data: { streamId, toUserId }
    io.to(data.toUserId).emit('co_host_invite', { fromUserId: socket.userId, streamId: data.streamId });
  });

  socket.on('accept_co_host', (data) => {
    // data: { streamId }
    socket.join(`live_${data.streamId}`);
    socket.to(`live_${data.streamId}`).emit('co_host_joined', { userId: socket.userId });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };