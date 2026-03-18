import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, TrendingUp, Clock, Music, User, Check, X, Hash, Film, Radio, Video, ImagePlus, Users } from "lucide-react";
import { PencilLine, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StoriesRow } from "@/components/stories/StoriesRow";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { StoryCreator } from "@/components/stories/StoryCreator";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import { Layout } from "@/components/layout/Layout";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { getApiUrl } from "@/utils/api";
import heroMusic from "@/assets/hero-music.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

// ...existing code...
const recentSongs = [
  { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: album1, duration: "3:42", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: album2, duration: "4:15", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: album3, duration: "2:58", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "4", title: "Electric Soul", artist: "Nova", albumArt: album1, duration: "3:21", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
];

const featuredPlaylists = [
  { id: "1", title: "Chill Vibes", description: "Relax and unwind with these smooth beats", image: album2, songCount: 45 },
  { id: "2", title: "Night Drive", description: "Perfect for late night cruising", image: album3, songCount: 32 },
  { id: "3", title: "Energy Boost", description: "Get pumped with high energy tracks", image: album1, songCount: 28 },
];

const Index = () => {
      const { playTrack } = useMediaPlayer();
    // --- FIX: Add missing handler functions ---
    const navigate = useNavigate();
    const handleSeeAllPlaylists = () => {
        navigate('/music?tab=playlists');
    };
    const handlePlaylistClick = (playlistId: string) => {
        navigate(`/music?playlist=${playlistId}`);
    };
  const handleStoryClick = () => {};
  const handleStoryViewed = () => {};
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Trending Now carousel index
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "electronic music",
    "workout playlists",
    "indie artists",
    "live concerts",
    "study beats"
  ]);


  const [notifications, setNotifications] = useState([
    { id: 1, type: 'new_release', isRead: false, time: '2m ago' },
    { id: 2, type: 'follow', isRead: false, time: '15m ago' },
    { id: 3, type: 'like', isRead: true, time: '1h ago' },
    { id: 4, type: 'message', isRead: false, time: '2h ago' },
  ]);
  const [stories, setStories] = useState([
    { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true },
    { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true },
    { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true },
    { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false },
    { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false },
    { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true },
  ]);

// Fetch stories from API on mount
useEffect(() => {
  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend story format to frontend format
        const transformedStories = data.map((story: any) => ({
          id: story._id,
          username: story.userId?.username || 'Unknown User',
          image: story.mediaUrl,
          hasUnseenStory: true
        }));
        setStories(transformedStories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  fetchStories();
}, []);

const handleStorySubmit = async (media: File, type: 'image' | 'video') => {
  try {
    const token = localStorage.getItem('auth_token');
    const apiUrl = getApiUrl();
    // Upload media
    const formData = new FormData();
    formData.append('media', media);
    const uploadResponse = await fetch(`${apiUrl}/stories/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Upload error:', errorData);
      throw new Error('Failed to upload media');
    }
    const uploadData = await uploadResponse.json();
    // Create story
    const createResponse = await fetch(`${apiUrl}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: '',
        mediaUrl: uploadData.mediaUrl,
        type,
        isPrivate: false
      })
    });
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Create story error:', errorData);
      throw new Error('Failed to create story');
    }
    const newStory = await createResponse.json();
    setStories(prev => [{
      id: newStory._id,
      username: 'You',
      image: newStory.mediaUrl,
      hasUnseenStory: true
    }, ...prev]);
    alert('Story created successfully!');
  } catch (error) {
    console.error('Error creating story:', error);
    alert('Failed to create story. Please try again.');
  }
};

  const handleCreateStory = () => {
    setIsStoryCreatorOpen(true);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data.results || []);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);

      // Add to search history
      if (query.trim() && !searchHistory.includes(query.trim())) {
        setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
      }
    }
  };

  const handleSearchResultClick = (result: any) => {
    setIsSearchOpen(false);
    // Navigate based on result type
    switch (result.type) {
      case "music":
        navigate("/music", { state: { searchQuery: result.title } });
        break;
      case "artist":
        navigate("/music", { state: { artist: result.title } });
        break;
      case "playlist":
        navigate("/music", { state: { playlist: result.id } });
        break;
      case "user":
        navigate(`/profile/${result.id}`);
        break;
      case "hashtag":
        navigate("/reels", { state: { hashtag: result.title } });
        break;
      case "reel":
        navigate("/reels", { state: { reelId: result.id } });
        break;
      default:
        break;
    }
  };

  const removeFromHistory = (item: string) => {
    setSearchHistory(prev => prev.filter(h => h !== item));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    setIsNotificationsOpen(false); // Close the notification window
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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
            <div>
              <h1 className="text-2xl font-bold text-gradient">Clockit</h1>
              <p className="text-xs text-muted-foreground">Stories & Music</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="touch-manipulation"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFabOpen(!isFabOpen)}
                className="touch-manipulation"
              >
                <Plus className="w-5 h-5" />
              </Button>
              {/* FAB Dropdown menu */}
              {isFabOpen && (
                <div className="absolute top-16 right-16 bg-white dark:bg-black rounded-xl shadow-lg p-6 flex flex-col gap-6 z-50">
                  <button
                    className="flex items-center gap-3 text-lg font-semibold text-foreground hover:text-primary transition"
                    onClick={() => { setIsFabOpen(false); navigate('/post'); }}
                  >
                    <PencilLine className="w-6 h-6" />
                    Post
                  </button>
                  <button
                    className="flex items-center gap-3 text-lg font-semibold text-foreground hover:text-primary transition"
                    onClick={() => { setIsFabOpen(false); setIsStoryCreatorOpen(true); }}
                  >
                    <Camera className="w-6 h-6" />
                    Stories
                  </button>
                  <button
                    className="flex items-center gap-3 text-lg font-semibold text-foreground hover:text-primary transition"
                    onClick={() => { setIsFabOpen(false); navigate('/reels'); }}
                  >
                    <Film className="w-6 h-6" />
                    Reels
                  </button>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative touch-manipulation"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="touch-manipulation"
                onClick={() => navigate('/live')}
                aria-label="Go Live"
                style={{ display: 'inline-flex' }}
              >
                <Radio className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Stories Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <StoriesRow
            stories={stories}
            onStoryClick={handleStoryClick}
            onCreateStory={handleCreateStory}
          />
        </motion.section>

        {/* Trending Now Carousel (image only, no play) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 px-4 md:px-0"
        >
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={[heroMusic, album1, album2, album3][currentTrendingIndex]}
              alt="Trending Now"
              className="w-full h-full object-cover transition-all duration-700"
            />
            {/* Carousel indicators */}
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
              {[0,1,2,3].map(i => (
                <button
                  key={i}
                  className={`h-2 w-6 rounded-full transition-all duration-300 ${i === currentTrendingIndex ? "bg-primary" : "bg-white/30 w-2"}`}
                  onClick={() => setCurrentTrendingIndex(i)}
                />
              ))}
            </div>
            {/* Overlay text */}
            <div className="absolute left-6 bottom-8 text-left">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Trending Now</h2>
              <p className="text-sm text-white/80 drop-shadow">The hottest tracks right now</p>
              <span className="text-xs text-white/60">50 songs</span>
            </div>
          </div>
        </motion.section>

        {/* Featured Playlists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-lg font-semibold text-foreground">Featured Playlists</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={handleSeeAllPlaylists}
            >
              See all
            </Button>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide pb-2">
            {/* Custom minimal gap between cards */}
            <style>{`.playlist-card:not(:last-child) { margin-right: 0px; }`}</style>
            {featuredPlaylists.map((playlist) => (
              <FeaturedPlaylist
                key={playlist.id}
                title={playlist.title}
                description={playlist.description}
                image={playlist.image}
                songCount={playlist.songCount}
                onClick={() => handlePlaylistClick(playlist.id)}
                className="playlist-card"
              />
            ))}
          </div>
        </motion.section>

        {/* Story Viewer */}
        <StoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
          initialStoryId={selectedStoryId || undefined}
          stories={stories}
          onStoryViewed={handleStoryViewed}
        />

        {/* Story Creator */}
        <StoryCreator
          isOpen={isStoryCreatorOpen}
          onClose={() => setIsStoryCreatorOpen(false)}
          onStoryCreated={(media, type) => handleStorySubmit(media, type)}
        />

        {/* Search Dialog */}
        {isSearchOpen && (
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-left">Search</DialogTitle>
                <DialogDescription>Search for songs, artists, and users</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for songs, artists, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12"
                    autoFocus
                  />
                </div>
                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  {/* Render search history or results here as needed */}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}

export default Index;
