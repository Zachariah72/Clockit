const UserStat = require('../models/UserStat');
const ContentAnalytic = require('../models/ContentAnalytic');
const AudienceInsight = require('../models/AudienceInsight');
const EngagementLog = require('../models/EngagementLog');
const ListeningHistory = require('../models/ListeningHistory');
const UserTrack = require('../models/UserTrack');
const Streak = require('../models/Streak');

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'daily' } = req.query; // daily, weekly, monthly

    let stats = await UserStat.findOne({ userId });

    if (!stats) {
      stats = new UserStat({ userId });
      await stats.save();
    }

    // Calculate period-based data
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // daily
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get engagement logs for the period
    const engagementLogs = await EngagementLog.find({
      userId,
      timestamp: { $gte: startDate }
    });

    // Aggregate data
    const aggregatedStats = {
      ...stats.toObject(),
      periodData: {
        profileViews: engagementLogs.filter(log => log.action === 'view' && log.contentType === 'profile').length,
        followers: stats.followers, // This would need historical tracking
        following: stats.following,
        postReach: engagementLogs.filter(log => log.action === 'view' && ['video', 'story', 'post'].includes(log.contentType)).length,
        postImpressions: engagementLogs.filter(log => log.action === 'impression').length,
        likes: engagementLogs.filter(log => log.action === 'like').length,
        comments: engagementLogs.filter(log => log.action === 'comment').length,
        shares: engagementLogs.filter(log => log.action === 'share').length,
        storyViews: engagementLogs.filter(log => log.action === 'view' && log.contentType === 'story').length,
        videoWatchTime: engagementLogs.filter(log => log.contentType === 'video').reduce((sum, log) => sum + (log.duration || 0), 0),
        musicListens: engagementLogs.filter(log => log.action === 'listen').length,
        messagesSent: engagementLogs.filter(log => log.action === 'message').length,
        callDuration: engagementLogs.filter(log => log.action === 'call').reduce((sum, log) => sum + (log.duration || 0), 0),
      }
    };

    res.json(aggregatedStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get content analytics
exports.getContentAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'daily' } = req.query;

    const analytics = await ContentAnalytic.find({ userId });

    // Get top performing content
    const topPosts = analytics
      .filter(a => a.contentType === 'post')
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    const topVideos = analytics
      .filter(a => a.contentType === 'video')
      .sort((a, b) => b.watchTime - a.watchTime)
      .slice(0, 5);

    const storyPerformance = analytics
      .filter(a => a.contentType === 'story')
      .reduce((acc, curr) => ({
        totalViews: acc.totalViews + curr.views,
        totalCompletion: acc.totalCompletion + curr.completionRate,
        count: acc.count + 1
      }), { totalViews: 0, totalCompletion: 0, count: 0 });

    if (storyPerformance.count > 0) {
      storyPerformance.avgCompletionRate = storyPerformance.totalCompletion / storyPerformance.count;
    }

    res.json({
      topPosts,
      topVideos,
      storyPerformance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get audience insights
exports.getAudienceInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    const insights = await AudienceInsight.findOne({ userId });

    if (!insights) {
      return res.json({
        followerGrowth: [],
        activeHours: [],
        topCountries: [],
        topRegions: [],
        contentPreferences: [],
        musicTasteOverlap: 0,
        demographics: { ageGroups: [], gender: { male: 0, female: 0, other: 0 } }
      });
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get activity summary
exports.getActivitySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'weekly' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // weekly
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const logs = await EngagementLog.find({
      userId,
      timestamp: { $gte: startDate }
    });

    // Calculate posting frequency
    const postLogs = logs.filter(log => ['video', 'story', 'post'].includes(log.contentType) && log.action === 'create');
    const postingFrequency = postLogs.length / (period === 'monthly' ? 30 : 7);

    // Calculate engagement consistency (simplified)
    const dailyEngagement = {};
    logs.forEach(log => {
      const date = log.timestamp.toDateString();
      dailyEngagement[date] = (dailyEngagement[date] || 0) + 1;
    });
    const engagementDays = Object.keys(dailyEngagement).length;
    const totalDays = period === 'monthly' ? 30 : 7;
    const engagementConsistency = (engagementDays / totalDays) * 100;

    // Time spent (simplified calculation)
    const timeSpent = logs.reduce((sum, log) => sum + (log.duration || 5), 0) / 60; // in minutes

    res.json({
      postingFrequency: Math.round(postingFrequency * 100) / 100,
      engagementConsistency: Math.round(engagementConsistency),
      timeSpentOnPlatform: Math.round(timeSpent),
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get music insights
exports.getMusicInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'weekly' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // weekly
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get listening history
    const listeningHistory = await ListeningHistory.find({
      userId,
      playedAt: { $gte: startDate }
    }).sort({ playedAt: -1 });

    // Get user tracks (liked songs)
    const userTracks = await UserTrack.find({ userId });
    const likedTracks = userTracks.filter(t => t.isLiked);

    // Get streak data
    const streak = await Streak.findOne({ userId });

    // Calculate total listening time in hours
    const totalListeningTime = listeningHistory.reduce((sum, h) => sum + (h.duration || 0), 0) / 3600;

    // Get unique songs played
    const uniqueSongs = new Set(listeningHistory.map(h => h.trackId?.toString()));

    // Get top artists (simplified - based on play count)
    const artistPlays = {};
    listeningHistory.forEach(h => {
      if (h.artist) {
        artistPlays[h.artist] = (artistPlays[h.artist] || 0) + 1;
      }
    });
    const topArtists = Object.entries(artistPlays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, plays]) => ({ name, plays }));

    // Get genre distribution
    const genrePlays = {};
    listeningHistory.forEach(h => {
      if (h.genre) {
        genrePlays[h.genre] = (genrePlays[h.genre] || 0) + 1;
      }
    });
    const genreDistribution = Object.entries(genrePlays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Get top genre
    const topGenre = genreDistribution[0]?.name || 'N/A';

    // Generate listening trends (daily data)
    const listeningByDay = {};
    listeningHistory.forEach(h => {
      const day = new Date(h.playedAt).toLocaleDateString('en-US', { weekday: 'short' });
      listeningByDay[day] = (listeningByDay[day] || 0) + 1;
    });
    const listeningTrends = Object.entries(listeningByDay).map(([day, count]) => ({ day, count }));

    // Calculate monthly average
    const monthlyAverage = (totalListeningTime / 7) * 30;

    res.json({
      totalSongsPlayed: uniqueSongs.size,
      totalListeningTime: Math.round(totalListeningTime * 10) / 10,
      topGenre,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      weeklyGoal: 7,
      monthlyAverage: Math.round(monthlyAverage * 10) / 10,
      listeningTrends,
      topArtists,
      genreDistribution,
      listeningByDay: listeningTrends,
      favoritePlaylists: [],
      newArtistsDiscovered: topArtists.length,
      songsLiked: likedTracks.length,
      playlistsCreated: 0,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};