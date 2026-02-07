import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/utils/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Play,
  Music,
  Clock,
  Calendar,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

interface InsightsProps {
  userId?: string;
}

export const Insights = ({ userId: propUserId }: InsightsProps) => {
  const { user, session } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [stats, setStats] = useState<any>(null);
  const [contentAnalytics, setContentAnalytics] = useState<any>(null);
  const [audienceInsights, setAudienceInsights] = useState<any>(null);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [musicInsights, setMusicInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use prop userId first, then auth user, then skip
  const effectiveUserId = propUserId || user?.id;

  useEffect(() => {
    fetchAnalytics();
  }, [period, effectiveUserId]);

  const fetchAnalytics = async () => {
    if (!effectiveUserId) {
      setLoading(false);
      setError("No user ID available");
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const apiUrl = getApiUrl();
      const [statsRes, contentRes, audienceRes, activityRes, musicRes] = await Promise.all([
        fetch(`${apiUrl}/api/analytics/stats/${effectiveUserId}?period=${period}`, { headers }),
        fetch(`${apiUrl}/api/analytics/content/${effectiveUserId}?period=${period}`, { headers }),
        fetch(`${apiUrl}/api/analytics/audience/${effectiveUserId}`, { headers }),
        fetch(`${apiUrl}/api/analytics/activity/${effectiveUserId}?period=${period}`, { headers }),
        fetch(`${apiUrl}/api/analytics/music/${effectiveUserId}?period=${period}`, { headers })
      ]);

      // Check for errors but don't fail if some endpoints return 401
      const [statsData, contentData, audienceData, activityData, musicData] = await Promise.allSettled([
        statsRes.json(),
        contentRes.json(),
        audienceRes.json(),
        activityRes.json(),
        musicRes.json()
      ]);

      if (statsRes.ok) setStats(statsData.value);
      if (contentRes.ok) setContentAnalytics(contentData.value);
      if (audienceRes.ok) setAudienceInsights(audienceData.value);
      if (activityRes.ok) setActivitySummary(activityData.value);
      if (musicRes.ok) setMusicInsights(musicData.value);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !effectiveUserId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{error || "Sign in to view insights"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Toggle */}
      <div className="flex justify-center">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Core Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Profile Views</span>
            </div>
            <p className="text-2xl font-bold">{stats?.periodData?.profileViews || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <p className="text-2xl font-bold">{stats?.followers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Post Reach</span>
            </div>
            <p className="text-2xl font-bold">{stats?.periodData?.postReach || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Likes</span>
            </div>
            <p className="text-2xl font-bold">{stats?.periodData?.likes || 0}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Music Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Songs Played</span>
            </div>
            <p className="text-2xl font-bold">{musicInsights?.totalSongsPlayed || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Listening Time</span>
            </div>
            <p className="text-2xl font-bold">{musicInsights?.totalListeningTime || 0}h</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Top Genre</span>
            </div>
            <p className="text-lg font-bold">{musicInsights?.topGenre || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Listening Streak</span>
            </div>
            <p className="text-2xl font-bold">{musicInsights?.currentStreak || 0} days</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Follower Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={audienceInsights?.followerGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={audienceInsights?.activeHours || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentAnalytics?.topPosts?.slice(0, 3).map((post: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Post {post.contentId}</p>
                      <p className="text-xs text-muted-foreground">{post.views} views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{post.engagement}</p>
                    <p className="text-xs text-muted-foreground">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Posting Frequency</span>
                <span className="font-bold">{activitySummary?.postingFrequency || 0}/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Engagement Consistency</span>
                <span className="font-bold">{activitySummary?.engagementConsistency || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Time on Platform</span>
                <span className="font-bold">{activitySummary?.timeSpentOnPlatform || 0} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Music Insights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listening Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Listening Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={musicInsights?.listeningTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="minutes" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Artists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Top Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {musicInsights?.topArtists?.slice(0, 5).map((artist: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{artist.name}</p>
                      <p className="text-xs text-muted-foreground">{artist.plays} plays</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{artist.minutes}min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={musicInsights?.genreDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="percentage"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {(musicInsights?.genreDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Current Streak</span>
                <span className="font-bold text-primary">{musicInsights?.currentStreak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Longest Streak</span>
                <span className="font-bold">{musicInsights?.longestStreak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Weekly Goal</span>
                <span className="font-bold">{musicInsights?.weeklyGoal || 0}h / 7h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Average</span>
                <span className="font-bold">{musicInsights?.monthlyAverage || 0}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Music Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Music Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Listening Hours by Day */}
            <div>
              <h4 className="font-semibold mb-3">Listening by Day</h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={musicInsights?.listeningByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Favorite Playlists */}
            <div>
              <h4 className="font-semibold mb-3">Most Played Playlists</h4>
              <div className="space-y-2">
                {musicInsights?.favoritePlaylists?.slice(0, 3).map((playlist: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{playlist.name}</span>
                    <span className="text-sm font-bold">{playlist.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discovery Stats */}
            <div>
              <h4 className="font-semibold mb-3">Music Discovery</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">New Artists</span>
                  <span className="text-sm font-bold">{musicInsights?.newArtistsDiscovered || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Songs Liked</span>
                  <span className="text-sm font-bold">{musicInsights?.songsLiked || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Playlists Created</span>
                  <span className="text-sm font-bold">{musicInsights?.playlistsCreated || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Audience Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Countries */}
            <div>
              <h4 className="font-semibold mb-3">Top Countries</h4>
              <div className="space-y-2">
                {audienceInsights?.topCountries?.slice(0, 3).map((country: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{country.country}</span>
                    <span className="text-sm font-bold">{country.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Preferences */}
            <div>
              <h4 className="font-semibold mb-3">Content Preferences</h4>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={audienceInsights?.contentPreferences || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    dataKey="percentage"
                  >
                    {(audienceInsights?.contentPreferences || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Demographics */}
            <div>
              <h4 className="font-semibold mb-3">Demographics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Male</span>
                  <span className="text-sm font-bold">{audienceInsights?.demographics?.gender?.male || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Female</span>
                  <span className="text-sm font-bold">{audienceInsights?.demographics?.gender?.female || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other</span>
                  <span className="text-sm font-bold">{audienceInsights?.demographics?.gender?.other || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};