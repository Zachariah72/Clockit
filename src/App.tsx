import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
// removed duplicate useRef import
import { ThemeProvider } from "@/contexts/ThemeContext";
import Music from "./pages/Music";

const queryClient = new QueryClient();
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
  // Feed post navigation state and handlers removed
  // ...existing code...
import { SnappySection } from '@/components/home/SnappySection';
import { ReelsSection } from '@/components/home/ReelsSection';
import { GenreSection } from '@/components/home/GenreSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FeedPost } from '@/components/home/FeedPost';
import { MobileSuggestions } from '@/components/home/MobileSuggestions';
import { Bell, Plus, Music as MusicIcon, Settings, Search } from "lucide-react";
import { CommunitySection } from "./components/home/CommunitySection";
import { FeaturedPlaylist } from "./components/music/FeaturedPlaylist";
import { NotificationCenter } from "./components/notifications/NotificationCenter";
import Appearance from "./pages/Appearance";
import Auth from "./pages/Auth";
import CameraTest from "./pages/CameraTest";
import Chat from "./pages/Chat";
import Discover from "./pages/Discover";
import DownloadedMusic from "./pages/DownloadedMusic";
import Groups from "./pages/Groups";
import { Live } from "./pages/Live";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import OfflineReels from "./pages/OfflineReels";
import Onboarding from "./pages/Onboarding";
import Podcasts from "./pages/Podcasts";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import Snap from "./pages/Snap";
import Stories from "./pages/Stories";


import Index from "./pages/Index";

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
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />

                  <Route path="/stories" element={<Stories />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/library" element={<Navigate to="/music" replace />} />

                  <Route path="/groups" element={<Groups />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/live" element={<Live />} />

                  <Route path="/chat" element={<Chat />} />
                  <Route path="/messages" element={<Navigate to="/chat" replace />} />

                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/:sectionId" element={<Settings />} />
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