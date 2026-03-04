import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Edit2, 
  Music, 
  Camera, 
  Heart, 
  Flame, 
  Users, 
  Grid3X3, 
  BarChart3, 
  Bookmark, 
  FileText, 
  Loader2, 
  LogIn, 
  Eye, 
  Image as ImageIcon, 
  UserPlus, 
  UserCheck,
  Share2,
  MoreHorizontal,
  Play,
  TrendingUp,
  Award,
  Sparkles,
  Moon,
  Sun,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Insights } from "@/components/Insights";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { FollowersModal } from "@/components/profile/FollowersModal";
import { StoriesModal } from "@/components/profile/StoriesModal";
import { ShareMusicModal } from "@/components/profile/ShareMusicModal";
import { profileApi, User, Story, SavedItem, DraftItem, Reel } from "@/services/profileApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const getStats = (profile: User | null) => [
  { label: "Stories", value: profile?.storiesCount?.toString() || "0", icon: Camera, action: "stories", color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  { label: "Followers", value: profile?.followersCount?.toString() || "0", icon: Users, action: "followers", color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  { label: "Following", value: profile?.followingCount?.toString() || "0", icon: Heart, action: "following", color: "text-pink-500", gradient: "from-pink-500 to-rose-500" },
  { label: "Streak", value: profile?.streakCount?.toString() || "0", icon: Flame, action: "streak", color: "text-orange-500", gradient: "from-orange-500 to-red-500" },
];

// Mock playlists data
const mockPlaylists = [
  { id: "1", name: "Chill Vibes", songs: 45, image: album1, color: "from-blue-500 to-purple-500" },
  { id: "2", name: "Workout Mix", songs: 32, image: album2, color: "from-orange-500 to-red-500" },
  { id: "3", name: "Late Night", songs: 28, image: album3, color: "from-purple-500 to-pink-500" },
  { id: "4", name: "Focus Flow", songs: 52, image: album1, color: "from-green-500 to-teal-500" },
  { id: "5", name: "Summer Hits", songs: 38, image: album2, color: "from-yellow-500 to-orange-500" },
  { id: "6", name: "Acoustic Sessions", songs: 24, image: album3, color: "from-amber-500 to-orange-600" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [savedContent, setSavedContent] = useState<SavedItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState("posts");
  const [isDark, setIsDark] = useState(false);

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [avatarUpdateTime, setAvatarUpdateTime] = useState(Date.now());
  const [isShareMusicOpen, setIsShareMusicOpen] = useState(false);
  const [followersModal, setFollowersModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  
  // Follow state for other users' profiles
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !userId || (user?.id && userId === user.id);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Check for edit query param and open modal
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && isOwnProfile) {
      setIsEditProfileOpen(true);
      navigate('/profile/me', { replace: true });
    }
  }, [searchParams, isOwnProfile, navigate]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!userId || isFollowLoading) return;
    
    try {
      setIsFollowLoading(true);
      const response = await profileApi.toggleFollow(userId);
      setIsFollowing(response.action === 'followed');
      toast.success(response.action === 'followed' ? 'Followed user' : 'Unfollowed user');
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    const hasBackendToken = localStorage.getItem('auth_token');
    const hasSupabaseSession = session && session.access_token;
    
    console.log('Profile useEffect - hasBackendToken:', !!hasBackendToken);
    console.log('Profile useEffect - hasSupabaseSession:', !!hasSupabaseSession);
    
    if (!hasBackendToken && !hasSupabaseSession) {
      console.log('User not authenticated, skipping API calls');
      setLoading(false);
      return;
    }
    
    loadProfileData();
  }, [session, userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      console.log('loadProfileData called, userId:', userId);
      
      try {
        const profileRes = await profileApi.getProfile(userId);
        console.log('Profile fetched:', profileRes);
        setProfile(profileRes);
      } catch (e) {
        console.error('Profile fetch error:', e);
      }
      
      try {
        const followersRes = await profileApi.getFollowers(userId);
        setFollowers(followersRes.followers);
      } catch (e) {}
      
      try {
        const followingRes = await profileApi.getFollowing(userId);
        setFollowing(followingRes.following);
      } catch (e) {}
      
      try {
        const storiesRes = await profileApi.getStories(userId);
        setStories(storiesRes);
      } catch (e) {}
      
      try {
        const reelsRes = await profileApi.getReels();
        setReels(reelsRes.reels);
      } catch (e) {}
      
      try {
        const savedRes = await profileApi.getSavedContent();
        setSavedContent(savedRes.savedContent);
      } catch (e) {}
      
      try {
        const draftsRes = await profileApi.getDrafts();
        setDrafts(draftsRes);
      } catch (e) {}
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      console.log('=== handleSaveProfile ===');
      setProfile(updatedProfile);
      
      if (updatedProfile.avatar) {
        setAvatarUpdateTime(Date.now());
      }
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleShareMusic = () => {
    setIsShareMusicOpen(true);
  };

  const handleStatClick = async (action: string) => {
    switch (action) {
      case 'stories':
        try {
          const storiesRes = await profileApi.getStories(userId);
          setStories(storiesRes);
        } catch (error) {
          toast.error("Failed to load stories");
        }
        setIsStoriesModalOpen(true);
        break;
      case 'followers':
        try {
          const response = await profileApi.getFollowers(userId);
          setFollowers(response.followers);
          setFollowersModal({ isOpen: true, type: 'followers' });
        } catch (error) {
          toast.error("Failed to load followers");
        }
        break;
      case 'following':
        try {
          const response = await profileApi.getFollowing(userId);
          setFollowing(response.following);
          setFollowersModal({ isOpen: true, type: 'following' });
        } catch (error) {
          toast.error("Failed to load following");
        }
        break;
      case 'streak':
        toast.info(\`Streak: \${profile?.streakCount || 0} days! Keep it up! 🔥\`);
        break;
      default:
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-purple-600" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground font-medium"
            >
              Loading your profile...
            </motion.p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show auth loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show unauthenticated state
  if (!session && !localStorage.getItem('auth_token')) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
              <LogIn className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Sign in to view your profile</h2>
            <p className="text-muted-foreground max-w-xs">
              Create an account or sign in to see your profile, reels, and saved content.
            </p>
            <Button 
              variant="gradient" 
              className="gap-2 mt-4"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 transition-colors duration-500">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card-strong border-b backdrop-blur-2xl"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <motion.h1 
                className="text-2xl font-bold text-gradient"
                whileHover={{ scale: 1.05 }}
              >
                Profile
              </motion.h1>
              {profile?.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
                    <Award className="w-3 h-3" />
                    Verified
                  </Badge>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover-glow rounded-full"
                onClick={() => setIsDark(!isDark)}
              >
                <motion.div
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow rounded-full" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Profile Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-card-strong rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              {/* Animated background decoration */}
              <motion.div 
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                {/* Avatar */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative w-28 h-28 rounded-full border-4 border-primary/30 shadow-lg">
                    <div className="w-full h-full rounded-full bg-background overflow-hidden">
                      <img
                        src={profile?.avatar ? \`\${profile.avatar}?t=\${avatarUpdateTime}\` : avatar1}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = avatar1;
                        }}
                      />
                    </div>
                  </div>
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(168, 85, 247, 0.4)",
                        "0 0 0 10px rgba(168, 85, 247, 0)",
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <motion.h2 
                      className="text-3xl font-bold text-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {profile?.displayName || profile?.username || "User"}
                    </motion.h2>
                  </div>
                  <motion.p 
                    className="text-lg text-muted-foreground mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    @{profile?.username || "username"}
                  </motion.p>
                  <motion.p 
                    className="text-base text-foreground mb-6 max-w-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {profile?.bio || "Welcome to my profile! 🎵"}
                  </motion.p>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-wrap gap-3 justify-center md:justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {isOwnProfile ? (
                      <>
                        <Button variant="gradient" size="lg" className="gap-2 rounded-full" onClick={handleEditProfile}>
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                        <Button variant="glass" size="lg" className="gap-2 rounded-full" onClick={handleShareMusic}>
                          <Music className="w-4 h-4" />
                          Share Music
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant={isFollowing ? "outline" : "gradient"} 
                        size="lg" 
                        className="gap-2 rounded-full" 
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                      >
                        {isFollowLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isFollowing ? (
                          <><UserCheck className="w-4 h-4" /> Following</>
                        ) : (
                          <><UserPlus className="w-4 h-4" /> Follow</>
                        )}
                      </Button>
                    )}
                    <Button variant="glass" size="icon" className="rounded-full">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getStats(profile).map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card rounded-2xl p-6 text-center cursor-pointer hover-glow group relative overflow-hidden"
                  onClick={() => handleStatClick(stat.action)}
                >
                  {/* Gradient background on hover */}
                  <motion.div 
                    className={\`absolute inset-0 bg-gradient-to-br \${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300\`}
                  />
                  
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                  >
                    <stat.icon className={\`w-8 h-8 mx-auto mb-3 \${stat.color}\`} />
                  </motion.div>
                  <p className="text-3xl font-bold text-foreground mb-1 relative z-10">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium relative z-10">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-2 mb-6 shadow-lg"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: "posts", label: "Posts", icon: Grid3X3 },
                { id: "stories", label: "Stories", icon: Camera },
                { id: "saved", label: "Saved", icon: Bookmark },
                { id: "drafts", label: "Drafts", icon: FileText },
                { id: "insights", label: "Insights", icon: BarChart3 },
                { id: "playlists", label: "Playlists", icon: Heart },
              ].map((tab) => (
                <motion.div
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={activeTab === tab.id ? "gradient" : "ghost"}
                    size="sm"
                    className={\`gap-2 rounded-full \${activeTab === tab.id ? "shadow-lg" : ""}\`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === "posts" && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {reels.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No reels yet</h3>
                    <p className="text-muted-foreground">Create your first reel to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {reels.map((reel, index) => (
                      <motion.div
                        key={reel._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -8 }}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl"
                      >
                        <img
                          src={reel.thumbnail}
                          alt={reel.title || 'Reel'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Stats overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="font-medium">{reel.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span className="font-medium">{reel.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium">{reel.views}</span>
                            </div>
                          </div>
                        </div>

                        {/* Type badge */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Badge className="bg-black/50 backdrop-blur-sm text-white border-0">
                            <Play className="w-3 h-3" />
                            Reel
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "stories" && (
              <motion.div
                key="stories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {stories.length === 0 ? (
                  <div className="glass-card rounded-3xl p-8 shadow-xl">
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-foreground mb-2">No Stories Yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first story to share with friends!</p>
                      <Button variant="gradient" size="lg" className="rounded-full">
                        <Camera className="w-4 h-4" />
                        Create Story
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {stories.map((story, index) => (
                      <motion.div
                        key={story._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -8 }}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                        onClick={() => setIsStoriesModalOpen(true)}
                      >
                        <img
                          src={story.mediaUrl}
                          alt={story.caption || 'Story'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {savedContent.length === 0 ? (
                  <div className="glass-card rounded-3xl p-8 shadow-xl">
                    <div className="text-center py-12">
                      <Bookmark className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-foreground mb-2">No Saved Items</h3>
                      <p className="text-muted-foreground mb-6">Save posts and music to find them here later.</p>
                      <Button variant="gradient" size="lg" className="rounded-full">
                        <Bookmark className="w-4 h-4" />
                        Explore Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedContent.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.contentData.image}
                            alt={item.contentData.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{item.contentData.title}</h4>
                          {item.contentData.artist && (
                            <p className="text-sm text-muted-foreground truncate">{item.contentData.artist}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Saved {new Date(item.savedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Bookmark className="w-4 h-4 text-primary fill-current" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "drafts" && (
              <motion.div
                key="drafts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {drafts.length === 0 ? (
                  <div className="glass-card rounded-3xl p-8 shadow-xl">
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-foreground mb-2">No Drafts</h3>
                      <p className="text-muted-foreground">Your drafts will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground capitalize">{item.contentType} Draft</span>
                          <span className="text-xs text-muted-foreground">{item.completionPercentage}% complete</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description || item.title || 'Untitled draft'}</p>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: \`\${item.completionPercentage}%\` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Insights userId={user?.id || undefined} />
              </motion.div>
            )}

            {activeTab === "playlists" && (
              <motion.div
                key="playlists"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover-glow shadow-lg"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={\`absolute inset-0 bg-gradient-to-t \${playlist.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300\`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.2 }}
                        >
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                          </div>
                        </motion.div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-foreground mb-1">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {playlist.songs} songs
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentProfile={profile ? {
            username: profile.username,
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            avatar: profile.avatar || avatar1
          } : {
            username: '',
            displayName: '',
            bio: '',
            avatar: avatar1
          }}
          onSave={handleSaveProfile}
        />

        <ShareMusicModal
          isOpen={isShareMusicOpen}
          onClose={() => setIsShareMusicOpen(false)}
        />

        <FollowersModal
          isOpen={followersModal.isOpen}
          onClose={() => setFollowersModal({ isOpen: false, type: 'followers' })}
          type={followersModal.type}
          users={followersModal.type === 'followers' ? followers : following}
          onFollowChange={async () => {
            const followersRes = await profileApi.getFollowers(userId);
            setFollowers(followersRes.followers);
            const followingRes = await profileApi.getFollowing(userId);
            setFollowing(followingRes.following);
          }}
        />

        <StoriesModal
          isOpen={isStoriesModalOpen}
          onClose={() => setIsStoriesModalOpen(false)}
          stories={stories}
        />
      </div>
    </Layout>
  );
};

export default Profile;
