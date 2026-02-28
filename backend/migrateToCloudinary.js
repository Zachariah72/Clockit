/**
 * Cloudinary Migration Script
 * Upload all existing local images to Cloudinary
 * 
 * Usage: node migrateToCloudinary.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadImage } = require('./src/utils/cloudinary');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Story = require('./src/models/Story');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Upload a single image
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await uploadImage(filePath, {
      folder: `clockit/${folder}`,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error.message);
    return null;
  }
};

// Migrate user avatars
const migrateUserAvatars = async () => {
  console.log('\n=== Migrating User Avatars ===');
  
  const users = await User.find({});
  let migrated = 0;
  let skipped = 0;
  
  for (const user of users) {
    if (user.avatar && user.avatar.includes('localhost')) {
      // Local avatar - need to upload
      const avatarPath = user.avatar.replace('http://localhost:5000/', '');
      const fullPath = path.join(__dirname, avatarPath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`Uploading avatar for ${user.username}...`);
        const newUrl = await uploadToCloudinary(fullPath, 'avatars');
        
        if (newUrl) {
          user.avatar = newUrl;
          await user.save();
          migrated++;
          console.log(`✓ Uploaded: ${newUrl}`);
        }
      } else {
        skipped++;
        console.log(`✗ File not found: ${fullPath}`);
      }
    } else if (user.avatar && user.avatar.includes('uploads/avatars')) {
      // Already has uploads path but different host
      const avatarPath = user.avatar.split('/uploads/avatars/')[1];
      const fullPath = path.join(__dirname, 'uploads/avatars', avatarPath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`Uploading avatar for ${user.username}...`);
        const newUrl = await uploadToCloudinary(fullPath, 'avatars');
        
        if (newUrl) {
          user.avatar = newUrl;
          await user.save();
          migrated++;
          console.log(`✓ Uploaded: ${newUrl}`);
        }
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }
  
  console.log(`\nUser Avatars: ${migrated} migrated, ${skipped} skipped`);
};

// Migrate story media
const migrateStories = async () => {
  console.log('\n=== Migrating Stories ===');
  
  const stories = await Story.find({});
  let migrated = 0;
  let skipped = 0;
  
  for (const story of stories) {
    if (story.mediaUrl && story.mediaUrl.includes('localhost')) {
      const mediaPath = story.mediaUrl.replace('http://localhost:5000/', '');
      const fullPath = path.join(__dirname, mediaPath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`Uploading story ${story._id}...`);
        const newUrl = await uploadToCloudinary(fullPath, 'stories');
        
        if (newUrl) {
          story.mediaUrl = newUrl;
          await story.save();
          migrated++;
          console.log(`✓ Uploaded: ${newUrl}`);
        }
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }
  
  console.log(`\nStories: ${migrated} migrated, ${skipped} skipped`);
};

// Main migration function
const migrate = async () => {
  console.log('Cloudinary Migration Starting...');
  console.log('================================');
  
  await connectDB();
  
  // Migrate user avatars
  await migrateUserAvatars();
  
  // Migrate stories
  await migrateStories();
  
  console.log('\n================================');
  console.log('Migration Complete!');
  console.log('================================');
  
  process.exit(0);
};

// Run migration
migrate();
