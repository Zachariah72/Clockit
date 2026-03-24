const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// All routes protected
router.use(auth);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.post('/read-all', notificationController.markAllAsRead);

module.exports = router;

