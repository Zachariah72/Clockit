const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const auth = require('../middlewares/auth');

router.post('/initiate', auth, callController.initiateCall);
router.put('/:callId/accept', auth, callController.acceptCall);
router.put('/:callId/reject', auth, callController.rejectCall);
router.put('/:callId/end', auth, callController.endCall);
router.get('/history', auth, callController.getCallHistory);

module.exports = router;