const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/emailService');
const { sendVerificationCode, verifyCode, isValidPhoneNumber, checkRateLimit, getRateLimitStatus } = require('../utils/phoneVerification');

exports.register = [
   body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
   body('phone').exists().withMessage('Phone number is required'),
   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
   body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Invalid email'),
   body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender selection'),
   body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, phone, gender, dateOfBirth } = req.body;

    // Handle empty email string
    const processedEmail = (email && typeof email === 'string' && email.trim() !== '') ? email.trim() : null;

    // Set defaults for optional fields
    const processedGender = gender || 'prefer_not_to_say';
    const processedDateOfBirth = dateOfBirth || new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString(); // Default to 18 years ago

    // Age validation - must be 18 or older (only if dateOfBirth was provided)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({ message: 'You must be at least 18 years old to register' });
      }
    }

    try {
      // Check if phone number already exists
      let existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }

      // Check if email exists (if provided)
      if (processedEmail) {
        existingUser = await User.findOne({ email: processedEmail });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already registered' });
        }
      }

      const user = new User({
        username,
        email: processedEmail,
        phone,
        password,
        gender: processedGender,
        dateOfBirth: new Date(processedDateOfBirth),
        emailVerified: true, // Skip email verification
        phoneVerified: true, // Skip phone verification
        verificationToken: null,
        verificationExpires: null,
        phoneVerificationCode: null,
        phoneVerificationExpires: null
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Skip verification - accounts are immediately active
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log(`✅ User registered: ${username} (${phone}) - Verification SKIPPED - Token issued`);

      res.json({
        message: 'Registration successful! You are now logged in.',
        requiresVerification: false,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.login = [
  body('identifier').exists().withMessage('Phone number or email is required'),
  body('password').exists().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { identifier, password } = req.body;
    try {
      // Try to find user by phone first, then by email
      let user = await User.findOne({ phone: identifier });
      if (!user) {
        user = await User.findOne({ email: identifier });
      }
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Skip verification checks - all accounts are verified by default

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.verify = [
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.verifyEmail = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  async (req, res) => {
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code } = req.body;

    try {
      const user = await User.findOne({
        email,
        verificationToken: code,
        verificationExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Mark email as verified
      user.emailVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
      console.error('Email verification error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.verifyPhone = [
  body('phone').exists().withMessage('Phone number is required'),
  body('code').exists().withMessage('Verification code is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, code } = req.body;

    try {
      // Use Twilio to verify the code
      const result = await verifyCode(phone, code);

      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Invalid verification code' });
      }

      // Find user by phone and mark as verified
      const user = await User.findOne({ phone });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Mark phone as verified
      user.phoneVerified = true;
      user.phoneVerificationCode = undefined;
      user.phoneVerificationExpires = undefined;
      await user.save();

      res.json({ message: 'Phone verified successfully.' });
    } catch (err) {
      console.error('Phone verification error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.resendPhoneCode = [
  body('phone').exists().withMessage('Phone number is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already verified
      if (user.phoneVerified) {
        return res.status(400).json({ message: 'Phone number is already verified' });
      }

      // Send new verification code
      const smsResult = await sendVerificationCode(phone);
      if (!smsResult.success) {
        return res.status(500).json({ message: smsResult.error });
      }

      // Update user with new verification details
      user.phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      res.json({
        message: 'Verification code sent successfully.',
        rateLimitInfo: getRateLimitStatus(phone)
      });
    } catch (err) {
      console.error('Resend code error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.setupTwoFactor = [
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `Clockit (${user.email || user.phone})`,
        issuer: 'Clockit'
      });

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      // Store secret temporarily (don't enable yet)
      user.twoFactorSecret = secret.base32;
      await user.save();

      res.json({
        secret: secret.base32,
        qrCodeUrl
      });
    } catch (err) {
      console.error('2FA setup error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.verifyTwoFactor = [
  async (req, res) => {
    try {
      const { code } = req.body;
      const user = await User.findById(req.user.id);

      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA setup not initiated' });
      }

      // Verify the TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow 2 time windows (30 seconds each)
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      await user.save();

      res.json({ message: '2FA enabled successfully' });
    } catch (err) {
      console.error('2FA verification error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.disableTwoFactor = [
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      res.json({ message: '2FA disabled successfully' });
    } catch (err) {
      console.error('2FA disable error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];