const express = require('express');
const router = express.Router();
const { getThemePreferences, updateThemePreferences, resetThemePreferences } = require('../controllers/themeController');
const auth = require('../middlewares/auth');

// Theme routes
router.get('/', auth, getThemePreferences); // GET /api/theme
router.put('/', auth, updateThemePreferences); // PUT /api/theme
router.delete('/', auth, resetThemePreferences); // DELETE /api/theme (reset to default)

module.exports = router;