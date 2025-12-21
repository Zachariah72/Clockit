const Comment = require('../models/Comment');
const Like = require('../models/Like');

// Create comment
const createComment = async (req, res) => {
  try {
    const { contentId, contentType, text } = req.body;
    const comment = new Comment({
      userId: req.user.id,
      contentId,
      contentType,
      text
    });
    await comment.save();
    await comment.populate('userId', 'username');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for content
const getComments = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    const comments = await Comment.find({ contentId, contentType }).populate('userId', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    comment.text = req.body.text;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike comment
const toggleLikeComment = async (req, res) => {
  try {
    const existingLike = await Like.findOne({ userId: req.user.id, contentId: req.params.id, contentType: 'comment' });
    if (existingLike) {
      await existingLike.remove();
      res.json({ message: 'Unliked' });
    } else {
      const like = new Like({ userId: req.user.id, contentId: req.params.id, contentType: 'comment' });
      await like.save();
      res.json({ message: 'Liked' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLikeComment
};