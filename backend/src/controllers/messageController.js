const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Follow = require('../models/Follow');

// Get conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username display_name avatar_url')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      const unreadCount = conv.lastMessage && conv.lastMessage.sender_id.toString() !== userId && !conv.lastMessage.is_read ? 1 : 0;

      return {
        id: conv._id,
        username: otherParticipant?.username || 'Unknown',
        avatar: otherParticipant?.avatar_url || '/api/placeholder/40/40',
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        lastMessageTime: conv.lastMessage ? new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount,
        isOnline: false // TODO: Implement online status
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate('sender_id', 'username display_name avatar_url')
      .sort({ created_at: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversation_id: conversationId, sender_id: { $ne: userId }, is_read: false },
      { is_read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text' } = req.body;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      type,
      is_read: false
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender_id', 'username display_name avatar_url');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Start a new conversation
const startConversation = async (req, res) => {
  try {
    const { recipientId, initialMessage } = req.body;
    const userId = req.user.id;

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    // Check if users can message each other
    const canMessage = await checkMessagingPermission(userId, recipientId);
    if (!canMessage) {
      return res.status(403).json({ error: 'Cannot message this user' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
        type: 'direct'
      });
      await conversation.save();
    }

    // Send initial message if provided
    if (initialMessage) {
      const message = new Message({
        conversation_id: conversation._id,
        sender_id: userId,
        content: initialMessage,
        type: 'text',
        is_read: false
      });

      await message.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: message._id,
        updatedAt: new Date()
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
};

// Check if users can message each other
const checkMessagingPermission = async (userId, recipientId) => {
  try {
    // Check if they follow each other
    const followRelationship = await Follow.findOne({
      $or: [
        { follower_id: userId, following_id: recipientId },
        { follower_id: recipientId, following_id: userId }
      ]
    });

    if (followRelationship) {
      return true; // Can message if they follow each other
    }

    // For now, allow messaging anyone (as per requirements)
    // In production, you might want to restrict this
    return true;
  } catch (error) {
    console.error('Error checking messaging permission:', error);
    return false;
  }
};

// Get user suggestions for messaging
const getUserSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    let users = [];

    if (query) {
      // Search users by username
      users = await User.find({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { display_name: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      })
      .select('username display_name avatar_url')
      .limit(10);
    } else {
      // Get users you follow
      const following = await Follow.find({ follower_id: userId })
        .populate('following_id', 'username display_name avatar_url');

      users = following.map(f => f.following_id);
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching user suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch user suggestions' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  getUserSuggestions
};