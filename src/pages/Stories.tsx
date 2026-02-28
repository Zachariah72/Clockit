import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, Sparkles, Flame, X, RotateCcw, Zap, Heart, Smile, Star, Film, Radio, FileText, Circle, Users, UserPlus, Plus, RefreshCw, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { StoryCircle } from "@/components/stories/StoryCircle";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { Camera as CameraComponent } from "@/components/Camera";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const friendsWithStories = [
  { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true, streak: 15, lastActive: "2h ago" },
  { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true, streak: 8, lastActive: "4h ago" },
  { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true, streak: 23, lastActive: "1h ago" },
  { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false, streak: 5, lastActive: "6h ago" },
  { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false, streak: 12, lastActive: "Yesterday" },
  { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true, streak: 30, lastActive: "30m ago" },
];

const Stories = () => {
  const navigate = useNavigate();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [snapHistory, setSnapHistory] = useState<string[]>([]);

  const filters = [
    { id: 'none', name: 'None', icon: RotateCcw },
    { id: 'vintage', name: 'Vintage', icon: Star, style: 'sepia' },
    { id: 'bright', name: 'Bright', icon: Zap, style: 'brightness-125' },
    { id: 'warm', name: 'Warm', icon: Heart, style: 'hue-rotate-15' },
    { id: 'cool', name: 'Cool', icon: Smile, style: 'hue-rotate-180' },
  ];

  const friends = [
    { id: '1', name: 'Sarah', avatar: avatar1 },
    { id: '2', name: 'Mike', avatar: avatar2 },
    { id: '3', name: 'Alex', avatar: avatar3 },
  ];

  const createOptions = [
    {
      icon: Film,
      label: "Create Reel",
      action: () => {
        navigate("/reels");
        setIsCreateMenuOpen(false);
      },
      color: "text-red-500"
    },
    {
      icon: Radio,
      label: "Go Live",
      action: () => {
        navigate("/live");
        setIsCreateMenuOpen(false);
      },
      color: "text-green-500"
    },
    {
      icon: FileText,
      label: "Add Post",
      action: () => {
        // Navigate to post creation
        setIsCreateMenuOpen(false);
      },
      color: "text-blue-500"
    },
    {
      icon: Circle,
      label: "Add Story",
      action: () => {
        setIsCameraOpen(true);
        setIsCreateMenuOpen(false);
      },
      color: "text-purple-500"
    },
    {
      icon: Users,
      label: "Create Group",
      action: () => {
        // Navigate to group creation
        setIsCreateMenuOpen(false);
      },
      color: "text-orange-500"
    },
    {
      icon: UserPlus,
      label: "Add Friend",
      action: () => {
        // Navigate to add friends
        setIsCreateMenuOpen(false);
      },
      color: "text-pink-500"
    }
  ];

  // Fetch stories and load snap history on component mount
  useEffect(() => {
    fetchStories();
    loadSnapHistory();
  }, []);

  const loadSnapHistory = () => {
    const savedSnaps = localStorage.getItem('snapHistory');
    if (savedSnaps) {
      try {
        const snaps = JSON.parse(savedSnaps);
        setSnapHistory(snaps);
      } catch (error) {
        console.error('Error loading snap history:', error);
      }
    }
  };

  const fetchStories = async () => {
    setIsLoadingStories(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token, skipping stories fetch');
        setIsLoadingStories(false);
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data);
      } else if (response.status === 401) {
        console.log('Unauthorized, clearing token');
        localStorage.removeItem('auth_token');
        toast.error("Please log in to view stories");
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const handleCameraCapture = (imageData: string, file: File) => {
    // Automatically send captured image to stories
    sendSnapAsStory(imageData, file);
  };

  const sendSnapAsStory = async (imageData: string, file: File) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error("Please log in to post stories");
      return;
    }

    setIsSending(true);
    try {
      // For now, use a placeholder URL since data URLs are too large
      // In production, you'd upload the file and get a URL back
      const placeholderUrl = `https://via.placeholder.com/400x600/7c3aed/ffffff?text=Story+${Date.now()}`;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: caption || "Captured with Clockit 📸",
          mediaUrl: placeholderUrl, // Use placeholder instead of large data URL
          type: 'image',
          isPrivate: false
        })
      });

      if (response.ok) {
        toast.success("Story posted! ✨");
        // Save to snap history for cross-page access (use placeholder for display)
        const updatedHistory = [placeholderUrl, ...snapHistory.slice(0, 9)];
        setSnapHistory(updatedHistory);
        localStorage.setItem('snapHistory', JSON.stringify(updatedHistory));
        // Refresh stories to show the new one
        fetchStories();
        setCaption("");
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to post story");
      }
    } catch (error) {
      console.error('Error posting story:', error);
      toast.error("Failed to post story");
    } finally {
      setIsSending(false);
    }
  };

  const selectFromGallery = () => {
    // Create file input for offline media
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            // Automatically send gallery image to stories
            sendSnapAsStory(event.target.result as string, file);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

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
            <h1 className="text-2xl font-bold text-foreground">Stories</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="glow"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                >
                  <Camera className="w-4 h-4" />
                  <span>Create</span>
                </Button>

                <AnimatePresence>
                  {isCreateMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-0 top-12 w-64 space-y-2 z-50"
                    >
                      {createOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={option.action}
                            className="flex items-center gap-3 w-full bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className={`p-2 rounded-full bg-muted ${option.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{option.label}</span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Add Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <div className="glass-card p-4 sm:p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Share Your Moment
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={() => setIsCameraOpen(true)}>
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Camera</span>
              </Button>
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={selectFromGallery}>
                <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                <span className="text-xs sm:text-sm">Gallery</span>
              </Button>
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={() => setIsCameraOpen(true)}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <span className="text-xs sm:text-sm">Effects</span>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Friends Stories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-4"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Friends
          </h3>
          <div className="space-y-3">
            {friendsWithStories.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setIsStoryViewerOpen(true)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <StoryCircle
                  image={friend.image}
                  username=""
                  hasUnseenStory={friend.hasUnseenStory}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {friend.username}
                    </span>
                    {friend.streak > 0 && (
                      <div className="flex items-center gap-1 text-secondary">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold">{friend.streak}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {friend.lastActive}
                  </span>
                </div>
                {friend.hasUnseenStory && (
                  <div className="w-2 h-2 bg-primary rounded-full glow-cyan" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Snap History from Snap Page */}
        {snapHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-4 mt-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Your Recent Snaps
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {snapHistory.slice(0, 6).map((snap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Allow posting snap as story
                    sendSnapAsStory(snap, new File([snap], 'snap.jpg', { type: 'image/jpeg' }));
                  }}
                >
                  <img
                    src={snap}
                    alt={`Snap ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Post as Story</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Stories Feed */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Stories</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStories}
              disabled={isLoadingStories}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStories ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoadingStories ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stories.length > 0 ? (
            <div className="space-y-4">
              {stories.slice(0, 10).map((story, index) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {story.userId?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {story.userId?.username || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {story.mediaUrl && (
                    <div className="mb-3">
                      <img
                        src={story.mediaUrl}
                        alt="Story content"
                        className="w-full rounded-lg object-cover max-h-64"
                      />
                    </div>
                  )}

                  {story.content && (
                    <p className="text-foreground mb-3">{story.content}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{story.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{story.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.comments || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {stories.length > 10 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => navigate('/stories')}>
                    View All Stories ({stories.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">No stories yet</h4>
              <p className="text-muted-foreground text-sm">
                Be the first to share a story! Tap the camera above.
              </p>
            </div>
          )}
        </motion.section>

        {/* Enhanced Camera Component */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
            <div className="w-full h-full max-w-none" style={{ height: '85vh' }}>
              <CameraComponent
                onCapture={handleCameraCapture}
                onClose={() => setIsCameraOpen(false)}
                enableFilters={true}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Story Viewer */}
        <StoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default Stories;
