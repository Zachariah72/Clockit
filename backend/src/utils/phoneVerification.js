const twilio = require('twilio');

// Twilio configuration (get free trial at twilio.com)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Store verification codes in memory (use Redis for production)
const verificationCodes = new Map();

// Format phone number to E.164 format
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already has country code (starts with + or 254, 1, etc.)
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // If 10 digits (US format), add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If 12 digits (without +), add +
  if (digits.length === 12 && digits.startsWith('254')) {
    return `+${digits}`;
  }
  
  // If 9 digits (Kenya without country code), add +254
  if (digits.length === 9 && digits.startsWith('7')) {
    return `+254${digits}`;
  }
  
  // Default: just add +
  return `+${digits}`;
};

const sendVerificationCode = async (phone) => {
  // Format phone number
  const formattedPhone = formatPhoneNumber(phone);
  
  // Validate formatted phone number
  if (!isValidPhoneNumber(formattedPhone)) {
    return { success: false, error: 'Invalid phone number' };
  }
  
  // Check rate limit
  if (!checkRateLimit(formattedPhone)) {
    return { success: false, error: 'Too many requests. Please try again later.' };
  }
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code with expiry (5 minutes)
  verificationCodes.set(formattedPhone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  });
  
  // If Twilio is configured, send real SMS
  if (accountSid && authToken && twilioPhoneNumber) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your Clockit verification code is: ${code}`,
        from: twilioPhoneNumber,
        to: formattedPhone
      });
      console.log(`Real SMS sent to ${formattedPhone}`);
      return { success: true };
    } catch (error) {
      console.error('Twilio error:', error.message);
      // Fall back to demo mode - return code so user can see it
    }
  }
  
  // Demo mode - return code so frontend can display it
  console.log(`[DEMO] Verification code for ${formattedPhone}: ${code}`);
  return { success: true, code };
};

const verifyCode = async (phone, code) => {
  const formattedPhone = formatPhoneNumber(phone);
  const stored = verificationCodes.get(formattedPhone);
  
  if (!stored) {
    return { success: false, error: 'No verification code sent' };
  }
  
  // Check expiry
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(formattedPhone);
    return { success: false, error: 'Code expired. Please request a new one.' };
  }
  
  // Check attempts
  stored.attempts++;
  if (stored.attempts >= 3) {
    verificationCodes.delete(formattedPhone);
    return { success: false, error: 'Too many attempts. Please request a new code.' };
  }
  
  // Verify code
  if (stored.code === code) {
    verificationCodes.delete(formattedPhone);
    return { success: true };
  }
  
  return { success: false, error: 'Invalid verification code' };
};

const isValidPhoneNumber = (phone) => {
  // Basic validation - E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

const checkRateLimit = (phone) => {
  const status = getRateLimitStatus(phone);
  return status.canSend;
};

const getRateLimitStatus = (phone) => {
  const stored = verificationCodes.get(phone);
  if (!stored) {
    return { canSend: true, remainingAttempts: 3 };
  }
  
  // Check if code has expired
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(phone);
    return { canSend: true, remainingAttempts: 3 };
  }
  
  return { canSend: false, remainingAttempts: 0 };
};

module.exports = { sendVerificationCode, verifyCode, isValidPhoneNumber, checkRateLimit, getRateLimitStatus };