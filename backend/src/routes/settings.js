const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middlewares/auth');

// All settings routes require authentication
router.use(auth);

// Get all user settings
router.get('/', settingsController.getUserSettings);

// Update user settings
router.put('/', settingsController.updateUserSettings);

// Notification preferences
router.put('/notifications', settingsController.updateNotificationPreferences);

// Theme preferences
router.put('/theme', settingsController.updateThemePreferences);

// Device sessions
router.get('/devices', settingsController.getDeviceSessions);
router.delete('/devices/:deviceId', settingsController.logoutDevice);
router.delete('/devices', settingsController.logoutAllDevices);

// Account management
router.post('/deactivate', settingsController.deactivateAccount);
router.post('/delete', settingsController.deleteAccount);

module.exports = router;