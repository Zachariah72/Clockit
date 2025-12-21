const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');

// All analytics routes require authentication
router.use(auth);

// Get user stats
router.get('/stats/:userId', analyticsController.getUserStats);

// Get content analytics
router.get('/content/:userId', analyticsController.getContentAnalytics);

// Get audience insights
router.get('/audience/:userId', analyticsController.getAudienceInsights);

// Get activity summary
router.get('/activity/:userId', analyticsController.getActivitySummary);

module.exports = router;