const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle Supabase OAuth users - map supabaseId to MongoDB ObjectId
    let userId = decoded.user?.id || decoded.id;
    
    // Check if the ID is a MongoDB ObjectId (24 hex chars) or Supabase UUID
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    if (!isMongoId && decoded.user?.email) {
      // Try to find user by email and get their MongoDB ObjectId
      const user = await User.findOne({ email: decoded.user.email });
      if (user) {
        userId = user._id.toString();
        console.log(`Mapped Supabase user to MongoDB ObjectId: ${user.username}`);
      }
    }
    
    req.user = { ...decoded, id: userId };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;