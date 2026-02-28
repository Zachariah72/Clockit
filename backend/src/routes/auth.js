const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', register);
router.post('/login', login);

// Verify Supabase OAuth session and issue backend token
router.post('/oauth-verify', async (req, res) => {
  try {
    const { email, userId } = req.body;
    
    if (!email && !userId) {
      return res.status(400).json({ message: 'Email or userId is required' });
    }
    
    // Find user by email or Supabase user ID
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (userId) {
      // Try to find by Supabase user ID (stored in a field)
      user = await User.findOne({ supabaseId: userId });
    }
    
    if (!user) {
      // Create a new user if doesn't exist (OAuth user)
      const emailPrefix = email ? email.split('@')[0] : 'oauth_user';
      const username = emailPrefix + '_' + Math.random().toString(36).substring(7);
      
      user = new User({
        username,
        email: email || null,
        phone: null,
        password: Math.random().toString(36), // Random password
        supabaseId: userId,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date()
      });
      await user.save();
      console.log(`✅ OAuth user created: ${username} (${email || userId})`);
    }
    
    // Issue backend token
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('OAuth verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify JWT token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Token verify error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;