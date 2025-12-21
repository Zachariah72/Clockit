import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, TrendingUp, Clock, Music, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StoriesRow } from "@/components/stories/StoriesRow";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { StoryCreator } from "@/components/stories/StoryCreator";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import { Layout } from "@/components/layout/Layout";
import heroMusic from "@/assets/hero-music.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

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
  const navigate = useNavigate();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'new_release', message: 'New album "Midnight Waves" by Synthwave is now available!', isRead: false, time: '2m ago' },
    { id: 2, type: 'follow', message: 'DJ Beats started following you', isRead: false, time: '15m ago' },
    { id: 3, type: 'like', message: 'Someone liked your playlist "Chill Mix"', isRead: true, time: '1h ago' },
    { id: 4, type: 'message', message: 'New message from MusicLover', isRead: false, time: '2h ago' },
  ]);
  const [stories, setStories] = useState([
    { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true },
    { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true },
    { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true },
    { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false },
    { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false },
    { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true },
  ]);

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
    setIsStoryViewerOpen(true);
  };

  const handlePlaylistClick = (playlistId: string) => {
    // Navigate to music page with specific playlist
    navigate('/music', { state: { selectedPlaylist: playlistId } });
  };

  const handleSeeAllPlaylists = () => {
    // Navigate to recently played/all songs view
    navigate('/music', { state: { showRecentlyPlayed: true } });
  };

  const handleSongClick = (song: typeof recentSongs[0], index: number) => {
    // Navigate to music page and start playing this song
    navigate('/music', {
      state: {
        playSong: song,
        songIndex: index,
        fromHome: true
      }
    });
  };

  const handleStoryViewed = (storyId: string) => {
    // Mark the story as viewed (seen)
    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId
          ? { ...story, hasUnseenStory: false }
          : story
      )
    );
  };

  const handleStoryCreated = (media: File, type: 'image' | 'video') => {
    // Handle story creation - you can upload to server here
    console.log('Story created:', { media, type });

    // For now, just show a success message
    // In a real app, you'd upload the media and refresh the stories
    alert('Story created successfully!');

    // You could add the new story to the stories list here
    // const newStory = {
    //   id: Date.now().toString(),
    //   username: "Your story",
    //   image: URL.createObjectURL(media),
    //   hasUnseenStory: true
    // };
    // setStories(prev => [newStory, ...prev]);
  };

  const handleCreateStory = () => {
    setIsStoryCreatorOpen(true);
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
                onClick={() => navigate('/music', { state: { activeTab: 'search' } })}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/music'}>
                <Music className="w-5 h-5" />
              </Button>
              <div className="relative">
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

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <motion.div
                    ref={notificationRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-12 right-4 w-72 xs:w-80 sm:w-88 md:w-96 lg:w-[28rem] max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-48 xs:max-h-52 sm:max-h-64 md:max-h-80 lg:max-h-[28rem] overflow-y-auto">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl cursor-pointer transition-colors ${
                              notification.isRead
                                ? 'bg-muted/30'
                                : 'bg-primary/10 border border-primary/20'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {notifications.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No notifications yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/profile'}>
                <User className="w-5 h-5" />
              </Button>
              <ThemeToggle />
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

        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-6"
        >
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
            <img
              src={heroMusic}
              alt="Featured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Trending Now
              </span>
              <h2 className="text-xl font-bold text-foreground mt-1">
                Discover New Sounds
              </h2>
              <p className="text-sm text-muted-foreground">
                Fresh drops every week
              </p>
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
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
            {featuredPlaylists.map((playlist) => (
              <FeaturedPlaylist
                key={playlist.id}
                title={playlist.title}
                description={playlist.description}
                image={playlist.image}
                songCount={playlist.songCount}
                onClick={() => handlePlaylistClick(playlist.id)}
              />
            ))}
          </div>
        </motion.section>

        {/* Recent Plays */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 px-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recently Played</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              See all
            </Button>
          </div>
          <div className="space-y-2">
            {recentSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <SongCard
                  title={song.title}
                  artist={song.artist}
                  albumArt={song.albumArt}
                  duration={song.duration}
                  isPlaying={index === 0}
                  onClick={() => handleSongClick(song, index)}
                  trackUrl={song.trackUrl}
                  playlist={recentSongs.map(s => ({
                    id: `${s.title}-${s.artist}`,
                    title: s.title,
                    artist: s.artist,
                    album: 'Recently Played',
                    duration: 180, // Default duration
                    url: s.trackUrl || '',
                    artwork: s.albumArt,
                  }))}
                  currentIndex={index}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>


        {/* Story Viewer */}
        <StoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
          initialStoryId={selectedStoryId || undefined}
          onStoryViewed={handleStoryViewed}
        />

        {/* Story Creator */}
        <StoryCreator
          isOpen={isStoryCreatorOpen}
          onClose={() => setIsStoryCreatorOpen(false)}
          onStoryCreated={handleStoryCreated}
        />
      </div>
    </Layout>
  );
};

export default Index;
