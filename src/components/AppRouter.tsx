import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Stories from '@/pages/Stories';
import Music from '@/pages/Music';
import Groups from '@/pages/Groups';
import Profile from '@/pages/Profile';
import Reels from '@/pages/Reels';
import { Live } from '@/pages/Live';
import LiveFeed from '@/pages/LiveFeed';
import Chat from '@/pages/Chat';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import Settings from '@/pages/Settings';
import DownloadedMusic from '@/pages/DownloadedMusic';
import Podcasts from '@/pages/Podcasts';
import OfflineReels from '@/pages/OfflineReels';
import Appearance from '@/pages/Appearance';
import Search from '@/pages/Search';
import CameraTest from '@/pages/CameraTest';
import Snap from '@/pages/Snap';
import SpotifyCallback from '@/pages/SpotifyCallback';
import AuthCallback from '@/pages/AuthCallback';
import NotFound from '@/pages/NotFound';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle routing logic based on auth state and onboarding completion
    if (!loading) {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

      if (!user) {
        // User not logged in
        if (!onboardingCompleted) {
          // New user - show onboarding first
          if (window.location.pathname !== '/onboarding') {
            navigate('/onboarding', { replace: true });
          }
        } else {
          // Returning user - show auth
          if (window.location.pathname !== '/auth' && window.location.pathname !== '/onboarding') {
            navigate('/auth', { replace: true });
          }
        }
      } else {
        // User is logged in - redirect to home if on auth/onboarding pages
        if (window.location.pathname === '/auth' || window.location.pathname === '/onboarding') {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, loading, navigate]);

  // Show loading while determining auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - accessible without login */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />

      {/* Protected routes - only accessible when logged in */}
      {user ? (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/music" element={<Music />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/live" element={<LiveFeed />} />
          <Route path="/live/create" element={<Live />} />
          <Route path="/live/:id" element={<Live />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/downloads" element={<DownloadedMusic />} />
          <Route path="/offline-reels" element={<OfflineReels />} />
          <Route path="/search" element={<Search />} />
          <Route path="/camera-test" element={<CameraTest />} />
          <Route path="/snap" element={<Snap />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/appearance" element={<Appearance />} />
        </>
      ) : (
        // No routes here - public routes are already defined above
        null
      )}

      {/* 404 for authenticated users */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;