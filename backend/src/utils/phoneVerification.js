const sendVerificationCode = (phone) => {
  console.log(`Sending verification code to ${phone}`);
  return Promise.resolve({ success: true });
};

const verifyCode = (phone, code) => {
  console.log(`Verifying code ${code} for ${phone}`);
  return Promise.resolve({ success: true });
};

const isValidPhoneNumber = (phone) => true;

const checkRateLimit = (phone) => true;

const getRateLimitStatus = (phone) => ({});

module.exports = { sendVerificationCode, verifyCode, isValidPhoneNumber, checkRateLimit, getRateLimitStatus };