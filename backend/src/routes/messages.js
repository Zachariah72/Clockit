const express = require('express');
const router = express.Router();
const cors = require('cors');
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/auth');

// Enable CORS for this router
router.use(cors());

// Handle OPTIONS requests for CORS preflight
router.options('/conversations', cors());
router.options('/conversations/:conversationId/messages', cors());
router.options('/users/suggestions', cors());

router.get('/conversations', auth, messageController.getConversations);
router.get('/conversations/:conversationId/messages', auth, messageController.getMessages);
router.post('/conversations/:conversationId/messages', auth, messageController.sendMessage);
router.post('/conversations', auth, messageController.startConversation);
router.get('/users/suggestions', auth, messageController.getUserSuggestions);

module.exports = router;