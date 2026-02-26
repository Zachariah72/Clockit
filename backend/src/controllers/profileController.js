const User = require('../models/User');
const Follow = require('../models/Follow');
const Story = require('../models/Story');
const SavedContent = require('../models/SavedContent');
const DraftContent = require('../models/DraftContent');
const MusicShare = require('../models/MusicShare');
const Video = require('../models/Video');
const { uploadImage } = require('../utils/cloudinary');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    let userId = req.params.userId || req.user?.id;
    
    // If no user ID, try to find user by email or supabaseId (OAuth case)
    if (!userId && req.user?.email) {
      const userByEmail = await User.findOne({ email: req.user.email });
      if (userByEmail) {
        userId = userByEmail._id;
      }
    }
    
    // Also try to find by supabaseId if still not found
    if (!userId && req.user?.id) {
      const userBySupabaseId = await User.findOne({ supabaseId: req.user.id });
      if (userBySupabaseId) {
        userId = userBySupabaseId._id;
      }
    }
    
    if (!userId) {
      // Return a mock user for demo purposes when not authenticated
      const mockUser = {
        _id: 'demo-user-id',
        username: 'demo_user',
        displayName: 'Demo User',
        email: 'demo@example.com',
        bio: 'This is a demo profile',
        avatar: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        followersCount: 0,
        followingCount: 0,
        storiesCount: 0,
        streakCount: 0,
        isVerified: false,
        isPrivate: false,
        createdAt: new Date().toISOString()
      };
      return res.json(mockUser);
    }
    
    const user = await User.findById(userId).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      // User doesn't exist in backend, return mock profile
      const mockUser = {
        _id: userId,
        username: 'oauth_user',
        displayName: 'OAuth User',
        email: req.user?.email || 'user@example.com',
        bio: '',
        avatar: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        followersCount: 0,
        followingCount: 0,
        storiesCount: 0,
        streakCount: 0,
        isVerified: false,
        isPrivate: false,
        createdAt: new Date().toISOString()
      };
      return res.json(mockUser);
    }

    // Convert avatar URL to full URL if it's a relative path
    const userObj = user.toObject();
    if (userObj.avatar && userObj.avatar.startsWith('/')) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      userObj.avatar = `${protocol}://${host}${userObj.avatar}`;
    }

    res.json(userObj);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    let userId = req.user?.id;
    
    // If no user ID in token, try to find user by email
    if (!userId && req.user?.email) {
      const userByEmail = await User.findOne({ email: req.user.email });
      if (userByEmail) {
        userId = userByEmail._id;
      }
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }
    
    const updates = req.body;

    console.log('Update request - userId:', userId, 'updates:', JSON.stringify(updates));

    // Prevent updating sensitive fields
    const allowedFields = ['username', 'displayName', 'bio', 'avatar', 'linkInBio'];
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
      console.log('User not found for update - userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully for user:', user._id);
    
    // Convert avatar URL to full URL if it's a relative path
    const userObj = user.toObject();
    if (userObj.avatar && userObj.avatar.startsWith('/')) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      userObj.avatar = `${protocol}://${host}${userObj.avatar}`;
    }
    
    res.json(userObj);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    console.log('=== Avatar Upload Debug ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization header:', req.header('Authorization')?.substring(0, 50) + '...');
    
    if (!req.file) {
      console.log('No file in request - checking multer configuration');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, req.file.size, req.file.mimetype);
    console.log('Full req.user object:', JSON.stringify(req.user));
    
    let userId = req.user?.id;
    console.log('Extracted userId:', userId);
    
    // If no user ID in token, try to find user by email
    if (!userId && req.user?.email) {
      console.log('Looking up user by email:', req.user.email);
      const userByEmail = await User.findOne({ email: req.user.email });
      if (userByEmail) {
        userId = userByEmail._id;
        console.log('Found user by email, userId:', userId);
      }
    }
    
    // Try supabaseId as fallback
    if (!userId && req.user?.id) {
      console.log('Looking up user by supabaseId:', req.user.id);
      const userBySupabaseId = await User.findOne({ supabaseId: req.user.id });
      if (userBySupabaseId) {
        userId = userBySupabaseId._id;
        console.log('Found user by supabaseId, userId:', userId);
      }
    }
    
    if (!userId) {
      console.log('No userId found, attempting to get from auth token directly');
      // Try to decode the token manually
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log('Decoded token:', JSON.stringify(decoded));
          userId = decoded.user?.id || decoded._id || decoded.id;
          console.log('UserId from token:', userId);
        } catch (e) {
          console.error('Token decode error:', e.message);
        }
      }
    }
    
    if (!userId) {
      console.log('FATAL: No userId available after all lookups');
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // Upload to Cloudinary
    let avatarUrl;
    try {
      // If using multer with file uploaded, get the path
      const filePath = req.file?.path;
      
      if (filePath) {
        // Local file upload via multer
        const result = await uploadImage(filePath, {
          folder: 'clockit/avatars',
          public_id: `avatar_${userId}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        avatarUrl = result.secure_url;
      } else {
        // Check if base64 data is in the body
        const base64Data = req.body.avatar;
        if (base64Data && base64Data.startsWith('data:')) {
          const result = await uploadImage(base64Data, {
            folder: 'clockit/avatars',
            public_id: `avatar_${userId}`,
            transformation: [
              { width: 200, height: 200, crop: 'fill' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          avatarUrl = result.secure_url;
        } else {
          return res.status(400).json({ message: 'No file uploaded' });
        }
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      // Fallback to local storage if Cloudinary fails
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;
      avatarUrl = `${baseUrl}/uploads/avatars/${req.file?.filename}`;
    }

    console.log('Avatar URL:', avatarUrl);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl, updatedAt: new Date() },
      { new: true }
    ).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      console.log('User not found for update');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Avatar uploaded successfully for user:', user._id);
    res.json({ avatar: avatarUrl, user });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar: ' + error.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user ? req.user.id : null);

    if (!userId) {
      // Return empty for unauthenticated users without userId
      return res.json({
        followers: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
    }

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
    const userId = req.params.userId || (req.user ? req.user.id : null);

    if (!userId) {
      // Return empty for unauthenticated users without userId
      return res.json({
        following: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
    }

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
    // Return empty array for unauthenticated users or demo mode
    if (!req.user && !req.params.userId) {
      console.log('getStories: No user or userId, returning empty array');
      return res.json([]);
    }
    
    const userId = req.params.userId || req.user?.id;
    console.log('getStories: userId from request:', userId);
    console.log('getStories: req.params.userId:', req.params.userId);
    console.log('getStories: req.user:', req.user);

    if (!userId) {
      console.log('getStories: No userId found, returning empty array');
      return res.json([]);
    }

    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .select('contentType mediaUrl thumbnailUrl caption viewsCount likesCount createdAt');

    console.log('getStories: Found stories:', stories.length);
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

// Get user reels (videos)
exports.getReels = async (req, res) => {
  try {
    // Return empty array for unauthenticated users or demo mode
    if (!req.user && !req.params.userId) {
      return res.json({ reels: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
    
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reels = await Video.find({
      userId,
      isDraft: false // Only published reels
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title description thumbnail url views likes duration createdAt');

    const total = await Video.countDocuments({ userId, isDraft: false });

    res.json({
      reels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Failed to fetch reels' });
  }
};

// Get saved content
exports.getSavedContent = async (req, res) => {
  try {
    // Return empty for unauthenticated users
    if (!req.user) {
      return res.json({ savedContent: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
    
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
    // Return empty for unauthenticated users
    if (!req.user) {
      return res.json([]);
    }
    
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