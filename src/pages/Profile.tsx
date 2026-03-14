import { useState, useEffect, useCallback } from "react";
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
  Share2,
  Play,
  Award,
  Sparkles,
  Moon,
  Sun,
  Trash2,
  Edit,
  ArrowLeft
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
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const getStats = (profile: User | null) => [
  { label: "Stories", value: profile?.storiesCount?.toString() || "0", icon: Camera, action: "stories", color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  { label: "Followers", value: profile?.followersCount?.toString() || "0", icon: Users, action: "followers", color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  { label: "Following", value: profile?.followingCount?.toString() || "0", icon: Heart, action: "following", color: "text-pink-500", gradient: "from-pink-500 to-rose-500" },
  { label: "Streak", value: profile?.streakCount?.toString() || "0", icon: Flame, action: "streak", color: "text-orange-500", gradient: "from-orange-500 to-red-500" },
];

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

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [savedContent, setSavedContent] = useState<SavedItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [isDark, setIsDark] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [avatarUpdateTime, setAvatarUpdateTime] = useState(Date.now());
  const [isShareMusicOpen, setIsShareMusicOpen] = useState(false);
  const [followersModal, setFollowersModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = !userId || userId === 'me' || (user?.id && userId === user.id);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && isOwnProfile) {
      setIsEditProfileOpen(true);
      navigate('/profile/me', { replace: true });
    }
  }, [searchParams, isOwnProfile, navigate]);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await profileApi.getProfile(userId);
      setProfile(profileRes);
      
      const requests = [
        profileApi.getFollowers(userId),
        profileApi.getFollowing(userId),
        profileApi.getStories(userId),
        profileApi.getReels(userId)
      ];

      // Only fetch saved and drafts for own profile
      if (isOwnProfile) {
        requests.push(profileApi.getSavedContent() as ReturnType<typeof profileApi.getSavedContent>);
        requests.push(profileApi.getDrafts() as ReturnType<typeof profileApi.getDrafts>);
      }

      const results = await Promise.allSettled(requests);

      if (results[0].status === 'fulfilled') setFollowers((results[0].value as Awaited<ReturnType<typeof profileApi.getFollowers>>).followers);
      if (results[1].status === 'fulfilled') setFollowing((results[1].value as Awaited<ReturnType<typeof profileApi.getFollowing>>).following);
      if (results[2].status === 'fulfilled') setStories(results[2].value as Story[]);
      if (results[3].status === 'fulfilled') setReels((results[3].value as Awaited<ReturnType<typeof profileApi.getReels>>).reels);
      
      if (isOwnProfile) {
        if (results[4]?.status === 'fulfilled') setSavedContent((results[4].value as Awaited<ReturnType<typeof profileApi.getSavedContent>>).savedContent);
        if (results[5]?.status === 'fulfilled') setDrafts(results[5].value as DraftItem[]);
      } else if (user?.id) {
        try {
          const myFollowing = await profileApi.getFollowing('me');
          const followingIds = myFollowing.following.map(u => u._id);
          setIsFollowing(followingIds.includes(profileRes._id));
        } catch (e) {
          console.error("Failed to check follow status", e);
        }
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!session && !localStorage.getItem('auth_token')) {
      setLoading(false);
      return;
    }
    loadProfileData();
  }, [session, authLoading, loadProfileData]);

  const handleFollowToggle = async () => {
    if (!userId || userId === 'me' || isFollowLoading) return;
    try {
      setIsFollowLoading(true);
      const response = await profileApi.toggleFollow(userId);
      setIsFollowing(response.action === 'followed');
      toast.success(response.action === 'followed' ? 'Followed user' : 'Unfollowed user');
      // Refresh only the profile counts to be fast
      const updatedProfile = await profileApi.getProfile(userId);
      setProfile(updatedProfile);
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleEditProfile = () => setIsEditProfileOpen(true);

  const handleSaveProfile = async (updatedProfile: User) => {
    setProfile(updatedProfile);
    if (updatedProfile.avatar) setAvatarUpdateTime(Date.now());
    toast.success("Profile updated successfully!");
  };

  const handleStatClick = (action: string) => {
    switch (action) {
      case 'stories': setIsStoriesModalOpen(true); break;
      case 'followers': setFollowersModal({ isOpen: true, type: 'followers' }); break;
      case 'following': setFollowersModal({ isOpen: true, type: 'following' }); break;
      case 'streak': toast.info(`Streak: ${profile?.streakCount || 0} days! Keep it up! 🔥`); break;
    }
  };

  if (authLoading || (loading && (session || localStorage.getItem('auth_token')))) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!session && !localStorage.getItem('auth_token')) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <LogIn className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground max-w-xs mb-8">
            Create an account or sign in to see your profile, reels, and saved content.
          </p>
          <Button variant="gradient" size="lg" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: "posts", label: "Posts", icon: Grid3X3 },
    { id: "stories", label: "Stories", icon: Camera },
    { id: "playlists", label: "Playlists", icon: Heart },
  ];

  if (isOwnProfile) {
    tabs.splice(2, 0, { id: "saved", label: "Saved", icon: Bookmark });
    tabs.splice(3, 0, { id: "drafts", label: "Drafts", icon: FileText });
    tabs.push({ id: "insights", label: "Insights", icon: BarChart3 });
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background transition-colors duration-500">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-4">
              {!isOwnProfile && (
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-2xl font-black tracking-tight text-foreground">Profile</h1>
              {profile?.isVerified && (
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                  <Award className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsDark(!isDark)}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/settings')}>
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-8 rounded-[40px] bg-card border border-border/50 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500 shadow-xl">
                  <div className="w-full h-full rounded-full bg-background p-1">
                    <img
                      src={profile?.avatar ? `${profile.avatar}?t=${avatarUpdateTime}` : avatar1}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).src = avatar1; }}
                    />
                  </div>
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={handleEditProfile}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Sparkles size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black mb-1">{profile?.displayName || profile?.username || "User"}</h2>
                <p className="text-xl text-muted-foreground mb-4">@{profile?.username || "username"}</p>
                <p className="text-base leading-relaxed text-muted-foreground/80 mb-8 max-w-xl">
                  {profile?.bio || "Welcome to my profile! 🎵"}
                </p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {isOwnProfile ? (
                    <>
                      <Button variant="gradient" size="lg" className="rounded-full px-8" onClick={handleEditProfile}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                      </Button>
                      <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => setIsShareMusicOpen(true)}>
                        <Music className="w-4 h-4 mr-2" /> Share Music
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant={isFollowing ? "outline" : "gradient"} 
                      size="lg" 
                      className="rounded-full px-8" 
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted"><Share2 size={20} /></Button>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {getStats(profile).map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleStatClick(stat.action)}
                className="bg-card p-6 rounded-3xl border border-border/50 text-center cursor-pointer hover:border-primary/50 transition-all shadow-sm"
              >
                <stat.icon className={`w-6 h-6 mx-auto mb-3 ${stat.color}`} />
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "gradient" : "ghost"}
                size="sm"
                className="rounded-full px-6 whitespace-nowrap"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "posts" && (
              <motion.div 
                key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {reels.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-40">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-bold">No posts yet</p>
                  </div>
                ) : (
                  reels.map((reel) => (
                    <motion.div key={reel._id} whileHover={{ y: -5 }} className="relative aspect-[3/4] rounded-3xl overflow-hidden group shadow-lg">
                      <img src={reel.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4 text-white text-sm font-bold">
                          <span className="flex items-center gap-1"><Heart size={16} fill="white" /> {reel.likes}</span>
                          <span className="flex items-center gap-1"><Eye size={16} /> {reel.views}</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4"><Badge className="bg-black/40 backdrop-blur-md border-none"><Play size={10} className="mr-1" /> Reel</Badge></div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "stories" && (
              <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {stories.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-40">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-bold">No stories</p>
                  </div>
                ) : (
                  stories.map((story) => (
                    <div key={story._id} onClick={() => setIsStoriesModalOpen(true)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer ring-2 ring-primary/20 hover:ring-primary transition-all">
                      <img src={story.mediaUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "saved" && isOwnProfile && (
              <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedContent.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-40"><Bookmark className="w-16 h-16 mx-auto mb-4" /><p className="text-xl font-bold">Nothing saved yet</p></div>
                ) : (
                  savedContent.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 group hover:bg-muted/50 transition-colors">
                      <img src={item.contentData.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{item.contentData.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{item.contentData.artist}</p>
                      </div>
                      <Bookmark className="text-primary mr-2" fill="currentColor" size={20} />
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "drafts" && isOwnProfile && (
              <motion.div key="drafts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {drafts.length === 0 ? (
                  <div className="py-20 text-center opacity-40"><FileText className="w-16 h-16 mx-auto mb-4" /><p className="text-xl font-bold">No drafts</p></div>
                ) : (
                  drafts.map((draft) => (
                    <div key={draft._id} className="p-6 rounded-[32px] bg-muted/30 border border-border/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg mb-1">{draft.title || 'Untitled Draft'}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{draft.description || 'No description'}</p>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" className="rounded-full" onClick={() => toast.info("Coming soon")}><Edit size={16} /></Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="rounded-full text-red-500" 
                             onClick={async () => { if(confirm("Delete draft?")) { await profileApi.deleteDraft(draft._id); setDrafts(drafts.filter(d => d._id !== draft._id)); }}}
                           >
                             <Trash2 size={16} />
                           </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${draft.completionPercentage}%` }} className="h-full bg-primary" />
                        </div>
                        <span className="text-xs font-black">{draft.completionPercentage}%</span>
                        <Button 
                          size="sm" 
                          variant="gradient" 
                          className="rounded-full px-6"
                          onClick={async () => { try { await profileApi.publishDraft(draft._id); toast.success("Published!"); loadProfileData(); } catch { toast.error("Failed"); } }}
                        >
                          Publish
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "insights" && isOwnProfile && (
              <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Insights userId={user?.id} />
              </motion.div>
            )}

            {activeTab === "playlists" && (
              <motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockPlaylists.map((playlist) => (
                  <motion.div key={playlist.id} whileHover={{ scale: 1.02 }} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-[32px] overflow-hidden mb-4 shadow-xl">
                      <img src={playlist.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className={`absolute inset-0 bg-gradient-to-tr ${playlist.color} opacity-20`} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"><Play fill="black" size={32} className="ml-1" /></div>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg px-2">{playlist.name}</h4>
                    <p className="text-sm text-muted-foreground px-2">{playlist.songs} tracks</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} currentProfile={profile ? { username: profile.username, displayName: profile.displayName || '', bio: profile.bio || '', avatar: profile.avatar || avatar1 } : { username: '', displayName: '', bio: '', avatar: avatar1 }} onSave={handleSaveProfile} />
        <ShareMusicModal isOpen={isShareMusicOpen} onClose={() => setIsShareMusicOpen(false)} />
        <FollowersModal isOpen={followersModal.isOpen} onClose={() => setFollowersModal({ ...followersModal, isOpen: false })} type={followersModal.type} users={followersModal.type === 'followers' ? followers : following} onFollowChange={loadProfileData} />
        <StoriesModal isOpen={isStoriesModalOpen} onClose={() => setIsStoriesModalOpen(false)} stories={stories} />
      </div>
    </Layout>
  );
};

export default Profile;
