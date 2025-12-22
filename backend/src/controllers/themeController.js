const User = require('../models/User');

// Get user theme preferences
const getThemePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('theme customColors')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        theme: user.theme || 'dark',
        customColors: user.customColors || {}
      }
    });

  } catch (error) {
    console.error('Get theme preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get theme preferences',
      error: error.message
    });
  }
};

// Update user theme preferences
const updateThemePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, customColors } = req.body;

    // Validate theme
    const validThemes = ['light', 'dark', 'black', 'teal'];
    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme. Must be one of: light, dark, black, teal'
      });
    }

    const updateData = {};
    if (theme) updateData.theme = theme;
    if (customColors) updateData.customColors = customColors;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('theme customColors');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        theme: user.theme,
        customColors: user.customColors || {}
      },
      message: 'Theme preferences updated successfully'
    });

  } catch (error) {
    console.error('Update theme preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update theme preferences',
      error: error.message
    });
  }
};

// Reset theme to default
const resetThemePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        theme: 'dark',
        customColors: {}
      },
      { new: true }
    ).select('theme customColors');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        theme: user.theme,
        customColors: user.customColors
      },
      message: 'Theme preferences reset to default'
    });

  } catch (error) {
    console.error('Reset theme preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset theme preferences',
      error: error.message
    });
  }
};

module.exports = {
  getThemePreferences,
  updateThemePreferences,
  resetThemePreferences
};