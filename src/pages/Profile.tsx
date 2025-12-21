import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Edit2, Music, Camera, Heart, Flame, Users, Grid3X3, BarChart3, Bookmark, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { Insights } from "@/components/Insights";
import { useNavigate } from "react-router-dom";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { FollowersModal } from "@/components/profile/FollowersModal";
import { StoriesModal } from "@/components/profile/StoriesModal";
import { ShareMusicModal } from "@/components/profile/ShareMusicModal";
import { profileApi, User, Story, SavedItem, DraftItem, Reel } from "@/services/profileApi";
import { toast } from "sonner";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const getStats = (profile: User | null) => [
  { label: "Stories", value: profile?.storiesCount?.toString() || "0", icon: Camera, action: "stories" },
  { label: "Followers", value: profile?.followersCount?.toString() || "0", icon: Users, action: "followers" },
  { label: "Following", value: profile?.followingCount?.toString() || "0", icon: Heart, action: "following" },
  { label: "Streak", value: profile?.streakCount?.toString() || "0", icon: Flame, action: "streak" },
];

// Mock data for followers/following
const mockFollowers = [
  { id: "1", username: "musiclover", displayName: "Music Lover", avatar: avatar1, isFollower: true },
  { id: "2", username: "beatmaker", displayName: "Beat Maker", avatar: avatar2, isFollower: true },
  { id: "3", username: "djpro", displayName: "DJ Pro", avatar: avatar3, isFollower: true },
  { id: "4", username: "soundwave", displayName: "Sound Wave", avatar: avatar1, isFollower: true },
  { id: "5", username: "rhythm", displayName: "Rhythm King", avatar: avatar2, isFollower: true },
];

const mockFollowing = [
  { id: "6", username: "producer", displayName: "Music Producer", avatar: avatar3, isFollowing: true },
  { id: "7", username: "artist", displayName: "The Artist", avatar: avatar1, isFollowing: true },
  { id: "8", username: "composer", displayName: "Composer X", avatar: avatar2, isFollowing: true },
  { id: "9", username: "singer", displayName: "Soul Singer", avatar: avatar3, isFollowing: true },
];

// Mock data for stories
const mockUserStories = [
  { id: "s1", image: album1, createdAt: "2 hours ago", views: 245, likes: 23, comments: 5, type: "image" as const },
  { id: "s2", image: album2, createdAt: "5 hours ago", views: 189, likes: 15, comments: 3, type: "video" as const },
  { id: "s3", image: album3, createdAt: "1 day ago", views: 456, likes: 67, comments: 12, type: "image" as const },
  { id: "s4", image: album1, createdAt: "2 days ago", views: 312, likes: 34, comments: 8, type: "video" as const },
  { id: "s5", image: album2, createdAt: "3 days ago", views: 678, likes: 89, comments: 15, type: "image" as const },
];

const recentPosts = [
  { id: "1", image: album1, type: "story" },
  { id: "2", image: album2, type: "music" },
  { id: "3", image: album3, type: "story" },
  { id: "4", image: album1, type: "story" },
  { id: "5", image: album2, type: "music" },
  { id: "6", image: album3, type: "story" },
];

const savedItems = [
  { id: "s1", image: album1, type: "reel", title: "Amazing Dance Moves", savedAt: "2 days ago" },
  { id: "s2", image: album2, type: "song", title: "Neon Dreams", artist: "Midnight Wave", savedAt: "1 week ago" },
  { id: "s3", image: album3, type: "post", title: "Beautiful Sunset", savedAt: "3 days ago" },
  { id: "s4", image: album1, type: "reel", title: "Cooking Tutorial", savedAt: "5 days ago" },
  { id: "s5", image: album2, type: "song", title: "Electric Soul", artist: "Nova", savedAt: "1 day ago" },
  { id: "s6", image: album3, type: "post", title: "Travel Memories", savedAt: "4 days ago" },
];

const draftItems = [
  { id: "d1", type: "story", progress: 30, lastEdited: "2 hours ago", preview: "Unfinished story with amazing filter" },
  { id: "d2", type: "post", progress: 60, lastEdited: "1 day ago", preview: "Half-written post about music" },
  { id: "d3", type: "reel", progress: 15, lastEdited: "3 days ago", preview: "Draft video with cool effects" },
  { id: "d4", type: "story", progress: 80, lastEdited: "5 hours ago", preview: "Almost complete story series" },
];

const Profile = () => {
  const navigate = useNavigate();

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [savedContent, setSavedContent] = useState<SavedItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isShareMusicOpen, setIsShareMusicOpen] = useState(false);
  const [followersModal, setFollowersModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, followersRes, followingRes, storiesRes, reelsRes, savedRes, draftsRes] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getFollowers(),
        profileApi.getFollowing(),
        profileApi.getStories(),
        profileApi.getReels(),
        profileApi.getSavedContent(),
        profileApi.getDrafts()
      ]);

      setProfile(profileRes.data);
      setFollowers(followersRes.data.followers);
      setFollowing(followingRes.data.following);
      setStories(storiesRes.data);
      setReels(reelsRes.data.reels);
      setSavedContent(savedRes.data.savedContent);
      setDrafts(draftsRes.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
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
      const response = await profileApi.updateProfile(updatedProfile);
      setProfile(response.data);
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
        setIsStoriesModalOpen(true);
        break;
      case 'followers':
        try {
          const response = await profileApi.getFollowers();
          setFollowers(response.data.followers);
          setFollowersModal({ isOpen: true, type: 'followers' });
        } catch (error) {
          toast.error("Failed to load followers");
        }
        break;
      case 'following':
        try {
          const response = await profileApi.getFollowing();
          setFollowing(response.data.following);
          setFollowersModal({ isOpen: true, type: 'following' });
        } catch (error) {
          toast.error("Failed to load following");
        }
        break;
      case 'streak':
        toast.info(`Streak: ${profile?.streakCount || 0} days! Keep it up! 🔥`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Profile Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 mt-6"
        >
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="story-ring w-28 h-28">
                <div className="w-full h-full rounded-full bg-background p-1">
                  <img
                    src={avatar1}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <Button
                variant="glow"
                size="icon-sm"
                className="absolute bottom-0 right-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Name & Bio */}
            <h2 className="text-xl font-bold text-foreground mt-4">
              {profile?.displayName || profile?.username}
            </h2>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            {profile?.bio && (
              <p className="text-sm text-center text-muted-foreground mt-2 max-w-xs">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button variant="gradient" className="gap-2" onClick={handleEditProfile}>
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button variant="glass" className="gap-2" onClick={handleShareMusic}>
                <Music className="w-4 h-4" />
                Share Music
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-8"
        >
          <div className="grid grid-cols-4 gap-2">
            {getStats(profile).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="glass-card p-3 rounded-xl text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleStatClick(stat.action)}
              >
                <stat.icon
                  className={`w-5 h-5 mx-auto mb-1 ${
                    stat.label === "Streak" ? "text-secondary" : "text-primary"
                  }`}
                />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-8">
            <TabsTrigger value="posts" className="flex items-center gap-1 text-xs">
              <Grid3X3 className="w-3 h-3" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1 text-xs">
              <Bookmark className="w-3 h-3" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-1 text-xs">
              <FileText className="w-3 h-3" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-1 text-xs">
              <Heart className="w-3 h-3" />
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Reels</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  See all
                </Button>
              </div>
              {reels.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No reels yet</h3>
                  <p className="text-muted-foreground">Create your first reel to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {reels.map((reel, index) => (
                    <motion.div
                      key={reel._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={reel.thumbnail}
                        alt={reel.title || 'Reel'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* Overlay with engagement stats */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {reel.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {reel.likes}
                          </div>
                        </div>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-3 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Saved Items</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  See all
                </Button>
              </div>
              <div className="space-y-4">
                {savedContent.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved items yet</p>
                  </div>
                ) : (
                  savedContent.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.contentData.image}
                          alt={item.contentData.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          {item.contentType === "song" ? (
                            <Music className="w-5 h-5 text-white" />
                          ) : item.contentType === "reel" ? (
                            <Camera className="w-5 h-5 text-white" />
                          ) : (
                            <Grid3X3 className="w-5 h-5 text-white" />
                          )}
                        </div>
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
                  ))
                )}
              </div>
            </motion.section>
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Drafts</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Manage
                </Button>
              </div>
              <div className="space-y-4">
                {drafts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No drafts yet</p>
                  </div>
                ) : (
                  drafts.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="p-4 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.contentType === "story" ? (
                            <Camera className="w-4 h-4 text-secondary" />
                          ) : item.contentType === "reel" ? (
                            <Camera className="w-4 h-4 text-primary" />
                          ) : (
                            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium text-foreground capitalize">{item.contentType} Draft</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.completionPercentage}% complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description || item.title || 'Untitled draft'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Edited {new Date(item.lastEditedAt).toLocaleDateString()}</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${item.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4"
            >
              <Insights userId="user123" /> {/* TODO: Get from auth context */}
            </motion.section>
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="px-4 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Favorite Playlists
                  </h3>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {[album1, album2, album3].map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="min-w-[140px]"
                  >
                    <img
                      src={img}
                      alt="Playlist"
                      className="w-full h-[140px] rounded-xl object-cover"
                    />
                    <p className="text-sm font-medium text-foreground mt-2 truncate">
                      Playlist {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {20 + index * 10} songs
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </TabsContent>
        </Tabs>

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
