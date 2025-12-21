import { motion } from "framer-motion";
import { Settings, Edit2, Music, Camera, Heart, Flame, Users, Grid3X3, BarChart3, Bookmark, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { Insights } from "@/components/Insights";
import { useNavigate } from "react-router-dom";
import avatar1 from "@/assets/avatar-1.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const stats = [
  { label: "Stories", value: "248", icon: Camera },
  { label: "Followers", value: "12.5K", icon: Users },
  { label: "Following", value: "892", icon: Heart },
  { label: "Streak", value: "45", icon: Flame },
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
              Sarah Mitchell
            </h2>
            <p className="text-sm text-muted-foreground">@sarahmitch</p>
            <p className="text-sm text-center text-muted-foreground mt-2 max-w-xs">
              Music lover 🎵 | Night owl 🌙 | Creating vibes since '99
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button variant="gradient" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button variant="glass" className="gap-2">
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
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="glass-card p-3 rounded-xl text-center"
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
                  <h3 className="text-lg font-semibold text-foreground">Posts</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  See all
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {post.type === "music" ? (
                        <Music className="w-6 h-6 text-primary" />
                      ) : (
                        <Camera className="w-6 h-6 text-secondary" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
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
                {savedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        {item.type === "song" ? (
                          <Music className="w-5 h-5 text-white" />
                        ) : item.type === "reel" ? (
                          <Camera className="w-5 h-5 text-white" />
                        ) : (
                          <Grid3X3 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                      {item.artist && (
                        <p className="text-sm text-muted-foreground truncate">{item.artist}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Saved {item.savedAt}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Bookmark className="w-4 h-4 text-primary fill-current" />
                    </div>
                  </motion.div>
                ))}
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
                {draftItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="p-4 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === "story" ? (
                          <Camera className="w-4 h-4 text-secondary" />
                        ) : item.type === "reel" ? (
                          <Camera className="w-4 h-4 text-primary" />
                        ) : (
                          <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-foreground capitalize">{item.type} Draft</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.progress}% complete</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.preview}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Edited {item.lastEdited}</span>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
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
      </div>
    </Layout>
  );
};

export default Profile;
