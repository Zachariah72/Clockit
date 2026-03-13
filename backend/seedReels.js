require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

// Sample videos from tiktokController.js
const sampleVideos = [
  {
    title: 'Beautiful sunset over ocean 🌅 #nature #sunset #ocean',
    description: 'Watching the most amazing sunset ever #peaceful #nature #vibes',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    author: {
      username: 'naturelover',
      displayName: 'Nature Lover',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    stats: {
      playCount: 2500000,
      likeCount: 325000,
      commentCount: 8900,
      shareCount: 15600
    },
    music: {
      title: 'Peaceful Nature',
      author: 'Relaxing Sounds',
      duration: 15
    },
    duration: 15
  },
  {
    title: 'Epic car chase scene 🚗💨 #action #cars #speed',
    description: 'Incredible high-speed chase #action #cars #speed',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    author: {
      username: 'actionfan',
      displayName: 'Action Fan',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    stats: {
      playCount: 5600000,
      likeCount: 678000,
      commentCount: 23400,
      shareCount: 45600
    },
    music: {
      title: 'Speed Demon',
      author: 'Action Beats',
      duration: 18
    },
    duration: 18
  },
  {
    title: 'Amazing fireworks display 🎆 #fireworks #celebration #night',
    description: 'Beautiful fireworks show #celebration #night #amazing',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFireworks.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFireworks.jpg',
    author: {
      username: 'celebration',
      displayName: 'Celebration Time',
      avatarUrl: 'https://randomuser.me/api/portraits/men/52.jpg',
    },
    stats: {
      playCount: 8900000,
      likeCount: 945000,
      commentCount: 34500,
      shareCount: 67800
    },
    music: {
      title: 'Celebration',
      author: 'Party Beats',
      duration: 14
    },
    duration: 14
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing videos to avoid duplicates if re-running
    // WARNING: In a production environment, you might want to skip this or use unique identifiers
    // For now, let's just add them if the count is low.
    const count = await Video.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} videos. Skipping seed to prevent duplicates.`);
      process.exit();
    }

    console.log('Seeding samples...');
    for (const vData of sampleVideos) {
      const video = new Video({
        ...vData,
        isPublic: true,
        createdAt: new Date()
      });
      await video.save();
    }

    console.log('Seeding complete! 🚀');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
