const axios = require('axios');

// Free sample videos from Google's public storage (known to work)
const sampleVideos = [
  {
    id: 'sample_1',
    video_id: '7345678901234567001',
    title: 'Beautiful sunset over ocean 🌅 #nature #sunset #ocean',
    description: 'Watching the most amazing sunset ever #peaceful #nature #vibes',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    author: {
      username: 'naturelover',
      display_name: 'Nature Lover',
      avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
      follower_count: 450000
    },
    stats: {
      play_count: 2500000,
      like_count: 325000,
      comment_count: 8900,
      share_count: 15600
    },
    music: {
      title: 'Peaceful Nature',
      author: 'Relaxing Sounds',
      duration: 15
    },
    duration: 15,
    create_time: Date.now() - 43200000
  },
  {
    id: 'sample_2',
    video_id: '7345678901234567002',
    title: 'Epic car chase scene 🚗💨 #action #cars #speed',
    description: 'Incredible high-speed chase #action #cars #speed',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    author: {
      username: 'actionfan',
      display_name: 'Action Fan',
      avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
      follower_count: 890000
    },
    stats: {
      play_count: 5600000,
      like_count: 678000,
      comment_count: 23400,
      share_count: 45600
    },
    music: {
      title: 'Speed Demon',
      author: 'Action Beats',
      duration: 18
    },
    duration: 18,
    create_time: Date.now() - 86400000
  },
  {
    id: 'sample_3',
    video_id: '7345678901234567003',
    title: 'Amazing fireworks display 🎆 #fireworks #celebration #night',
    description: 'Beautiful fireworks show #celebration #night #amazing',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFireworks.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFireworks.jpg',
    author: {
      username: 'celebration',
      display_name: 'Celebration Time',
      avatar_url: 'https://randomuser.me/api/portraits/men/52.jpg',
      follower_count: 1200000
    },
    stats: {
      play_count: 8900000,
      like_count: 945000,
      comment_count: 34500,
      share_count: 67800
    },
    music: {
      title: 'Celebration',
      author: 'Party Beats',
      duration: 14
    },
    duration: 14,
    create_time: Date.now() - 172800000
  },
  {
    id: 'sample_4',
    video_id: '7345678901234567004',
    title: 'Fun activities festival 🎪 #festival #fun #activities',
    description: 'Amazing fun activities #festival #fun #entertainment',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    author: {
      username: 'funlover',
      display_name: 'Fun Lover',
      avatar_url: 'https://randomuser.me/api/portraits/women/65.jpg',
      follower_count: 2300000
    },
    stats: {
      play_count: 12000000,
      like_count: 1450000,
      comment_count: 56700,
      share_count: 89200
    },
    music: {
      title: 'Happy Vibes',
      author: 'Fun Music',
      duration: 20
    },
    duration: 20,
    create_time: Date.now() - 259200000
  },
  {
    id: 'sample_5',
    video_id: '7345678901234567005',
    title: 'Incredible mosh pit energy 🎸 #music #concert #moshpit',
    description: 'Insane mosh pit at the concert #music #concert #energy',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    author: {
      username: 'concertking',
      display_name: 'Concert King',
      avatar_url: 'https://randomuser.me/api/portraits/men/67.jpg',
      follower_count: 3400000
    },
    stats: {
      play_count: 25000000,
      like_count: 3200000,
      comment_count: 125000,
      share_count: 234000
    },
    music: {
      title: 'Rock Anthem',
      author: 'Concert Bands',
      duration: 12
    },
    duration: 12,
    create_time: Date.now() - 345600000
  },
  {
    id: 'sample_6',
    video_id: '7345678901234567006',
    title: 'Relaxing nature scenery 🌿 #nature #relaxing #peaceful',
    description: 'Peaceful nature vibes #nature #relaxing #calm',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    author: {
      username: 'naturepeace',
      display_name: 'Nature Peace',
      avatar_url: 'https://randomuser.me/api/portraits/women/28.jpg',
      follower_count: 1800000
    },
    stats: {
      play_count: 15600000,
      like_count: 1890000,
      comment_count: 78000,
      share_count: 156000
    },
    music: {
      title: 'Calm Waters',
      author: 'Nature Sounds',
      duration: 16
    },
    duration: 16,
    create_time: Date.now() - 432000000
  },
  {
    id: 'sample_7',
    video_id: '7345678901234567007',
    title: 'Sintron electronic music mix 🎧 #electronic #music #dj',
    description: 'Amazing electronic beats #electronic #music #dj',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    author: {
      username: 'electronicbeats',
      display_name: 'Electronic Beats',
      avatar_url: 'https://randomuser.me/api/portraits/men/88.jpg',
      follower_count: 950000
    },
    stats: {
      play_count: 6700000,
      like_count: 789000,
      comment_count: 23400,
      share_count: 45600
    },
    music: {
      title: 'Electronic Dreams',
      author: 'Synth Music',
      duration: 19
    },
    duration: 19,
    create_time: Date.now() - 518400000
  },
  {
    id: 'sample_8',
    video_id: '7345678901234567008',
    title: 'Big Buck Bunny animation 🐰 #animation #funny #cartoon',
    description: 'Classic animated short #animation #funny #cartoon',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    author: {
      username: 'animationfan',
      display_name: 'Animation Fan',
      avatar_url: 'https://randomuser.me/api/portraits/women/12.jpg',
      follower_count: 1350000
    },
    stats: {
      play_count: 9800000,
      like_count: 1120000,
      comment_count: 45000,
      share_count: 89000
    },
    music: {
      title: 'Cartoon Fun',
      author: 'Animation Sound',
      duration: 17
    },
    duration: 17,
    create_time: Date.now() - 604800000
  }
];

// TikTok API configuration
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_API_BASE = 'https://open-api.tiktok.com';

/**
 * Get trending TikTok videos
 */
const getTrendingVideos = async (req, res) => {
  try {
    const { limit = 10, region = 'US' } = req.query;

    // Return sample videos (from Google's public storage)
    const videos = sampleVideos.slice(0, parseInt(limit) || 10);

    res.json({
      videos,
      has_more: false,
      cursor: null
    });
  } catch (error) {
    console.error('TikTok trending videos error:', error.message);
    res.status(500).json({
      error: 'Unable to fetch trending videos',
      message: 'Please try again later'
    });
  }
};

/**
 * Search TikTok videos
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

    // Search through sample videos
    const videos = sampleVideos.filter(video =>
      video.title.toLowerCase().includes(q.toLowerCase()) ||
      video.description.toLowerCase().includes(q.toLowerCase()) ||
      video.author.username.toLowerCase().includes(q.toLowerCase())
    ).slice(0, parseInt(limit) || 10);

    res.json({
      videos,
      query: q,
      has_more: false,
      cursor: null
    });
  } catch (error) {
    console.error('TikTok search error:', error.message);
    res.status(500).json({
      error: 'Unable to search videos',
      message: 'Please try again later'
    });
  }
};

/**
 * Get video details by ID
 */
const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Find in sample videos
    const video = sampleVideos.find(v => v.id === videoId || v.video_id === videoId);

    if (!video) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'The requested video could not be found'
      });
    }

    res.json(video);
  } catch (error) {
    console.error('TikTok video details error:', error.message);
    res.status(500).json({
      error: 'Unable to fetch video details',
      message: 'Please try again later'
    });
  }
};

module.exports = {
  getTrendingVideos,
  searchVideos,
  getVideo
};
