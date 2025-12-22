import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/components/AppRouter";
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
import DownloadedMusic from "./pages/DownloadedMusic";
import Podcasts from "./pages/Podcasts";
import OfflineReels from "./pages/OfflineReels";
import Appearance from "./pages/Appearance";
import Search from "./pages/Search";
import CameraTest from "./pages/CameraTest";
import Snap from "./pages/Snap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <AppRouter />
              </TooltipProvider>
            </MediaPlayerProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
