const rateLimit = require('express-rate-limit');

// General rate limiter for 10k users scalability
// Allows 100 requests per 15 minutes by default
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for high-load search endpoint
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 searches per minute
    message: { message: 'Search limit reached. Please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    searchLimiter
};
