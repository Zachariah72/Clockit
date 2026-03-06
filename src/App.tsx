import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
// removed duplicate useRef import
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { MediaPlayerProvider, useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { MediaNotification } from "@/components/media/MediaNotification";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { FullPlayer } from '@/components/music/FullPlayer';
import { useState, useEffect, useRef } from 'react';
import heroMusicImage from '@/assets/hero-music.jpg';

// Import pages from Zach's version
import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Music from "./pages/Music";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import { Live } from "./pages/Live";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import DownloadedMusic from "./pages/DownloadedMusic";
import Podcasts from "./pages/Podcasts";
import OfflineReels from "./pages/OfflineReels";
import Appearance from "./pages/Appearance";
import Search from "./pages/Search";
import CameraTest from "./pages/CameraTest";
import Snap from "./pages/Snap";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Post from "./pages/Post";
import Discover from "./pages/Discover";

// Import your homepage components
import { Hero } from '@/components/home/Hero';
import { FeaturedPlaylist } from './components/home/FeaturedPlaylists';
import { CommunitySection } from '@/components/home/CommunitySection';
import { SnappySection } from '@/components/home/SnappySection';
import { ReelsSection } from '@/components/home/ReelsSection';
import { GenreSection } from '@/components/home/GenreSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FeedPost } from '@/components/home/FeedPost';
import { Plus } from 'lucide-react';

const queryClient = new QueryClient();

// Sample trending tracks
const TRENDING_TRACKS = [
  {
    id: '1',
    title: 'Essence',
    artist: 'WizKid ft. Tems',
    album: 'Made in Lagos',
    coverUrl: 'https://picsum.photos/seed/wizkid/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 240,
  },
  {
    id: '2',
    title: 'Water',
    artist: 'Tyla',
    album: 'Water - Single',
    coverUrl: 'https://picsum.photos/seed/tyla/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 200,
  },
  {
    id: '3',
    title: 'Drive',
    artist: 'Black Coffee ft. David Guetta',
    album: 'Subconsciously',
    coverUrl: 'https://picsum.photos/seed/coffee/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 220,
  },
];

// Featured playlists data
const FEATURED_PLAYLISTS = [
  {
    id: 1,
    title: 'Chill Vibes',
    description: 'Relax and unwind with these smooth beats',
    image: 'https://picsum.photos/seed/chill/300/300',
    songCount: 45,
  },
  {
    id: 2,
    title: 'Night Drive',
    description: 'Perfect for late night cruising',
    image: 'https://picsum.photos/seed/night/300/300',
    songCount: 32,
  },
];

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'forYou' | 'library' | 'discover'>('forYou');
  const { playTrack } = useMediaPlayer();
  // Dropdown state for + button
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-switch to discover tab when coming from /explore
  useEffect(() => {
    if (location.state?.tab === 'discover') {
      setActiveTab('discover');
    }
  }, [location]);

  // Dropdown outside click handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handlePlayTrending = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(TRENDING_TRACKS[0]);
    setIsPlayerOpen(true);
  };

  const handleTabChange = (tab: 'forYou' | 'library' | 'discover') => {
    if (tab === 'discover') {
      navigate('/discover');
    } else {
      setActiveTab(tab);
    }
  };

  const FEED_POSTS = [
    {
      id: 1,
      username: 'wizkidayo',
      userImage: 'https://picsum.photos/seed/wizkid/100/100',
      location: 'Lagos, Nigeria',
      image: 'https://picsum.photos/seed/concert/600/600',
      likes: 45230,
      caption: 'Made in Lagos. The energy was unmatched last night! 🦅🇳🇬 #Starboy',
      comments: 1240,
      timeAgo: '2h'
    },
    {
      id: 2,
      username: 'tyla',
      userImage: 'https://picsum.photos/seed/tyla/100/100',
      location: 'Johannesburg, SA',
      image: 'https://picsum.photos/seed/dance/600/600',
      likes: 89400,
      caption: 'Water remix dropping soon... 💦🇿🇦',
      comments: 3500,
      timeAgo: '5h'
    },
    {
      id: 3,
      username: 'blackcoffee',
      userImage: 'https://picsum.photos/seed/coffee/100/100',
      location: 'Ibiza',
      image: 'https://picsum.photos/seed/dj/600/600',
      likes: 22100,
      caption: 'House music is a spiritual thing. see you next week.',
      comments: 890,
      timeAgo: '1d'
    }
  ];

  return (
    <div className="min-h-screen text-cream-50 bg-black">
      <FullPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />

      <Sidebar />

      <div className="flex justify-center md:pl-[244px] lg:pr-[320px]">
        <main className="w-full max-w-[630px] min-h-screen pb-32 md:py-8 px-0 md:px-4">

          {/* Navigation Tabs moved to Music page */}

          {/* FOR YOU TAB CONTENT */}
          {activeTab === 'forYou' && (
            <>
              {/* Trending Now Playlist */}
              <div className="mb-8 px-4 md:px-0">
                <FeaturedPlaylist
                  title="Trending Now"
                  description="The hottest tracks right now"
                  image={heroMusicImage}
                  songCount={50}
                  onPlay={handlePlayTrending}
                />
              </div>

              {/* Featured Playlists Section */}
              <div className="mb-8 px-4 md:px-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Featured Playlists</h2>
                  <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {FEATURED_PLAYLISTS.map((playlist) => (
                    <FeaturedPlaylist
                      key={playlist.id}
                      title={playlist.title}
                      description={playlist.description}
                      image={playlist.image}
                      songCount={playlist.songCount}
                      onPlay={handlePlayTrending}
                    />
                  ))}
                </div>
              </div>

              {/* Stories (Snappy) */}
              <div className="mb-8">
                <SnappySection />
              </div>

              {/* Main Feed Content */}
              <div className="space-y-6">
                {/* Feed Posts */}
                <div className="px-4 md:px-0">
                  {FEED_POSTS.map(post => (
                    <FeedPost
                      key={post.id}
                      username={post.username}
                      userImage={post.userImage}
                      location={post.location}
                      image={post.image}
                      likes={post.likes}
                      caption={post.caption}
                      comments={post.comments}
                      timeAgo={post.timeAgo}
                    />
                  ))}
                </div>

                {/* Interspersed Sections */}
                <div className="py-4">
                  <GenreSection />
                </div>

                <div className="py-4">
                  <h3 className="px-4 md:px-0 text-lg font-bold text-white mb-4">Clockit Reels</h3>
                  <ReelsSection />
                </div>

                <CommunitySection />

                <div className="px-4 md:px-0 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Listening Groups</h2>
                    <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300">See all</button>
                  </div>
                  <div className="h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cream-100/40 text-sm">
                    Join a listening party...
                  </div>
                </div>
              </div>
            </>
          )}

          {/* LIBRARY TAB CONTENT */}
          {activeTab === 'library' && (
            <div className="px-4 md:px-0">
              <h2 className="text-2xl font-bold text-white mb-6">Your Library</h2>
              <div className="space-y-4">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-cream-100/60">Your saved playlists and albums will appear here</p>
                </div>
              </div>
            </div>
          )}

          {/* DISCOVER TAB CONTENT */}
          {activeTab === 'discover' && (
            <div className="px-4 md:px-0">
              <h2 className="text-2xl font-bold text-white mb-6">Discover</h2>
              <div className="space-y-4">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-cream-100/60">Explore new music and artists</p>
                </div>
              </div>
            </div>
          )}

          <div className="md:hidden max-w-2xl mx-auto fixed bottom-0 left-0 right-0 pointer-events-none z-50">
            <div className="pointer-events-auto">
              <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
              <BottomNav />
            </div>
          </div>
        </main>
      </div>


      {/* Floating Action Button with Custom Dropdown */}
      <div
        ref={dropdownRef}
        className={`fixed right-4 md:right-8 z-50 transition-all duration-300 ${currentTrack ? 'bottom-36 md:bottom-28' : 'bottom-24 md:bottom-8'
          }`}
      >
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          className="w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center text-cocoa-950 shadow-xl shadow-cyan-400/20 hover:scale-110 transition-transform focus:outline-none"
          aria-label="Add"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
        {dropdownOpen && (
          <div className="absolute bottom-16 right-0 w-44 bg-white dark:bg-cocoa-950 rounded-xl shadow-xl py-2 flex flex-col gap-0.5 animate-fade-in z-50 border border-cyan-100/30">
            <button
              className="w-full text-left px-4 py-3 font-semibold text-cyan-900 dark:text-cyan-100 bg-white dark:bg-cocoa-950 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 rounded-t-xl transition-colors"
              onClick={() => { setDropdownOpen(false); navigate('/post'); }}
            >Post</button>
            <button
              className="w-full text-left px-4 py-3 font-semibold text-cyan-900 dark:text-cyan-100 bg-white dark:bg-cocoa-950 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors"
              onClick={() => { setDropdownOpen(false); navigate('/stories'); }}
            >Stories</button>
            <button
              className="w-full text-left px-4 py-3 font-semibold text-cyan-900 dark:text-cyan-100 bg-white dark:bg-cocoa-950 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 rounded-b-xl transition-colors"
              onClick={() => { setDropdownOpen(false); navigate('/reels'); }}
            >Reels</button>
          </div>
        )}
      </div>


      {/* Desktop Right Panel */}
      <RightPanel />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <MediaPlayerProvider>
              <MediaNotification />
              <PWAInstallPrompt />
              <OfflineIndicator />
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />

                  <Route path="/stories" element={<Stories />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/library" element={<Navigate to="/music" replace />} />

                  <Route path="/groups" element={<Groups />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/live" element={<Live />} />

                  <Route path="/chat" element={<Chat />} />
                  <Route path="/messages" element={<Navigate to="/chat" replace />} />

                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/appearance" element={<Appearance />} />
                  <Route path="/downloads" element={<DownloadedMusic />} />
                  <Route path="/podcasts" element={<Podcasts />} />
                  <Route path="/offline-reels" element={<OfflineReels />} />

                  <Route path="/search" element={<Search />} />
                  <Route path="/explore" element={<Discover />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/for-you" element={<Navigate to="/" replace />} />

                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/post" element={<Post />} />
                  <Route path="/create" element={<Navigate to="/snap" replace />} />

                  <Route path="/camera-test" element={<CameraTest />} />
                  <Route path="/snap" element={<Snap />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </MediaPlayerProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;