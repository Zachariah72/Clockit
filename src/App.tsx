import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { MediaNotification } from "@/components/media/MediaNotification";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Music from "./pages/Music";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import Live from "./pages/Live";
import LiveFeed from "./pages/LiveFeed";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/music" element={<Music />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/live" element={<LiveFeed />} />
                <Route path="/live/create" element={<Live />} />
                <Route path="/live/:id" element={<Live />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </MediaPlayerProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
