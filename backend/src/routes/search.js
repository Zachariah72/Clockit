const express = require('express');
const router = express.Router();
const { globalSearch, searchSuggestions } = require('../controllers/searchController');
const auth = require('../middlewares/auth');

// Search routes
router.get('/', auth, globalSearch); // GET /api/search?q=query&type=users
router.get('/suggestions', auth, searchSuggestions); // GET /api/search/suggestions?q=query

module.exports = router;