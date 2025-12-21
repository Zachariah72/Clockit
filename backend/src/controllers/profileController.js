const User = require('../models/User');
const Follow = require('../models/Follow');
const Story = require('../models/Story');
const SavedContent = require('../models/SavedContent');
const DraftContent = require('../models/DraftContent');
const MusicShare = require('../models/MusicShare');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findById(userId).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Prevent updating sensitive fields
    const allowedFields = ['displayName', 'bio', 'avatar', 'linkInBio'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true
    }).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username displayName avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ following: userId });

    res.json({
      followers: followers.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Failed to fetch followers' });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'username displayName avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ follower: userId });

    res.json({
      following: following.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Failed to fetch following' });
  }
};

// Follow/Unfollow user
exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: userId,
      following: targetUserId
    });

    if (existingFollow) {
      // Unfollow
      await Follow.findByIdAndDelete(existingFollow._id);

      // Update counts
      await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });

      res.json({ action: 'unfollowed' });
    } else {
      // Follow
      await Follow.create({
        follower: userId,
        following: targetUserId
      });

      // Update counts
      await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

      res.json({ action: 'followed' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Failed to toggle follow' });
  }
};

// Get user stories
exports.getStories = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .select('contentType mediaUrl thumbnailUrl caption viewsCount likesCount createdAt');

    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

// Get saved content
exports.getSavedContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const contentType = req.query.type; // 'reel', 'song', 'post', 'all'
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { userId };
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }

    const savedContent = await SavedContent.find(query)
      .populate('contentData.creator', 'username displayName')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SavedContent.countDocuments(query);

    res.json({
      savedContent,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching saved content:', error);
    res.status(500).json({ message: 'Failed to fetch saved content' });
  }
};

// Save/Unsave content
exports.toggleSaveContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, contentType, contentModel } = req.body;

    const existingSave = await SavedContent.findOne({
      userId,
      contentId,
      contentType
    });

    if (existingSave) {
      // Unsave
      await SavedContent.findByIdAndDelete(existingSave._id);
      res.json({ action: 'unsaved' });
    } else {
      // Save
      const savedContent = new SavedContent({
        userId,
        contentId,
        contentType,
        contentModel,
        contentData: req.body.contentData
      });

      await savedContent.save();
      res.json({ action: 'saved', data: savedContent });
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    res.status(500).json({ message: 'Failed to toggle save' });
  }
};

// Get drafts
exports.getDrafts = async (req, res) => {
  try {
    const userId = req.user.id;
    const contentType = req.query.type; // 'story', 'reel', 'post', 'all'

    let query = { userId, isCompleted: false };
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }

    const drafts = await DraftContent.find(query)
      .sort({ lastEditedAt: -1 })
      .select('contentType title description completionPercentage lastEditedAt createdAt');

    res.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// Share music
exports.shareMusic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId, shareType, platform, recipientUsers } = req.body;

    const share = new MusicShare({
      userId,
      songId,
      shareType,
      platform: platform || shareType,
      recipientUsers: recipientUsers || [],
      shareUrl: `${process.env.FRONTEND_URL}/song/${songId}`
    });

    await share.save();

    res.json({
      message: 'Music shared successfully',
      share: share
    });
  } catch (error) {
    console.error('Error sharing music:', error);
    res.status(500).json({ message: 'Failed to share music' });
  }
};