const express = require('express');
const router = express.Router();
const learnController = require('../controllers/learnController');
const passport = require('passport');

// Auth middleware helper
const auth = passport.authenticate('jwt', { session: false });

router.get('/paths', learnController.getLearningPaths);
router.get('/paths/:id', learnController.getPathDetail);
router.get('/progress', auth, learnController.getUserProgress);
router.post('/progress', auth, learnController.updateProgress);

module.exports = router;
