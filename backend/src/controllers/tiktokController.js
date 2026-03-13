const Video = require('../models/Video');

/**
 * Get trending TikTok videos (Now unified with local database)
 */
const getTrendingVideos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Fetch from real database
    let videos = await Video.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10);

    // If database is completely empty (can happen on first run), return seeded structure 
    // though seeding should have handled this.
    if (videos.length === 0) {
      console.log('Database empty, returning hardcoded samples as safety fallback');
      return res.json({
        videos: sampleVideos.slice(0, parseInt(limit) || 10),
        has_more: false,
        cursor: null
      });
    }

    // Map MongoDB format to the structure expected by the Frontend
    const mappedVideos = videos.map(v => ({
      id: v._id,
      video_id: v._id.toString(), // Maintaining compatibility
      title: v.title,
      description: v.description,
      video_url: v.videoUrl,
      thumbnail_url: v.thumbnailUrl,
      author: {
        username: v.author.username,
        display_name: v.author.displayName,
        avatar_url: v.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.author.username}`,
        follower_count: v.author.follower_count || 0
      },
      stats: {
        play_count: v.stats.playCount,
        like_count: v.stats.likeCount,
        comment_count: v.stats.commentCount,
        share_count: v.stats.shareCount
      },
      music: {
        title: v.music.title,
        author: v.music.author,
        duration: v.music.duration
      },
      duration: v.duration,
      create_time: v.createdAt.getTime()
    }));

    res.json({
      videos: mappedVideos,
      has_more: mappedVideos.length === parseInt(limit),
      cursor: null
    });
  } catch (error) {
    console.error('TikTok trending videos error:', error.message);
    res.status(500).json({
      error: 'Unable to fetch trending videos',
      message: error.message
    });
  }
};

/**
 * Search videos (Now unified with database search)
 */
const searchVideos = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Query parameter required',
        message: 'Please provide a search query'
      });
    }

    // Search real database
    const videos = await Video.find({
      isPublic: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'author.username': { $regex: q, $options: 'i' } }
      ]
    }).limit(parseInt(limit) || 10);

    const mappedVideos = videos.map(v => ({
      id: v._id,
      video_id: v._id.toString(),
      title: v.title,
      description: v.description,
      video_url: v.videoUrl,
      thumbnail_url: v.thumbnailUrl,
      author: {
        username: v.author.username,
        display_name: v.author.displayName,
        avatar_url: v.author.avatarUrl,
        follower_count: v.author.follower_count
      },
      stats: {
        play_count: v.stats.playCount,
        like_count: v.stats.likeCount,
        comment_count: v.stats.commentCount,
        share_count: v.stats.shareCount
      },
      music: {
        title: v.music.title,
        author: v.music.author,
        duration: v.music.duration
      },
      duration: v.duration,
      create_time: v.createdAt.getTime()
    }));

    res.json({
      videos: mappedVideos,
      query: q,
      has_more: false,
      cursor: null
    });
  } catch (error) {
    console.error('TikTok search error:', error.message);
    res.status(500).json({
      error: 'Unable to search videos',
      message: error.message
    });
  }
};

/**
 * Get video details by ID
 */
const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const v = await Video.findById(videoId);

    if (!v) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'The requested video could not be found'
      });
    }

    res.json({
      id: v._id,
      video_id: v._id.toString(),
      title: v.title,
      description: v.description,
      video_url: v.videoUrl,
      thumbnail_url: v.thumbnailUrl,
      author: {
        username: v.author.username,
        display_name: v.author.displayName,
        avatar_url: v.author.avatarUrl,
        follower_count: v.author.follower_count
      },
      stats: {
        play_count: v.stats.playCount,
        like_count: v.stats.likeCount,
        comment_count: v.stats.commentCount,
        share_count: v.stats.shareCount
      },
      music: {
        title: v.music.title,
        author: v.music.author,
        duration: v.music.duration
      },
      duration: v.duration,
      create_time: v.createdAt.getTime()
    });
  } catch (error) {
    console.error('TikTok video details error:', error.message);
    res.status(500).json({
      error: 'Unable to fetch video details',
      message: error.message
    });
  }
};

module.exports = {
  getTrendingVideos,
  searchVideos,
  getVideo
};
