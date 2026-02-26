const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode, isValidPhoneNumber } = require('../utils/phoneVerification');
const auth = require('../middlewares/auth');

// Send verification code
router.post('/send', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' });
    }
    
    const result = await sendVerificationCode(phone);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify', auth, async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone number and code are required' });
    }
    
    const result = await verifyCode(phone, code);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({ message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Failed to verify code' });
  }
});

module.exports = router;
