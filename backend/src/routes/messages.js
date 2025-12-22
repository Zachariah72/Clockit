const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/conversations/:conversationId/messages', auth, messageController.getMessages);
router.post('/conversations/:conversationId/messages', auth, messageController.sendMessage);
router.post('/conversations', auth, messageController.startConversation);
router.get('/users/suggestions', auth, messageController.getUserSuggestions);

module.exports = router;