import { Home, Music, Users, MessageCircle, Film, Camera, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";

interface BottomNavProps {
  hide?: boolean;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Camera, label: "Snappy", path: "/stories" },
  { icon: Music, label: "Music", path: "/music" },
  { icon: Film, label: "Reels", path: "/reels" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
];

export const BottomNav = ({ hide = false }: BottomNavProps) => {
  const location = useLocation();
  const isReels = location.pathname === '/reels';
  const [navVisible, setNavVisible] = useState(true);

  // Auto-hide logic when on reels page
  const showNav = useCallback(() => {
    setNavVisible(true);
  }, []);

  useEffect(() => {
    if (!isReels) {
      setNavVisible(true);
      return;
    }
    // Hide after 3s of inactivity
    const timer = setTimeout(() => setNavVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [isReels]);

  // Re-show on any touch or scroll while on reels
  useEffect(() => {
    if (!isReels) return;
    const handleActivity = () => {
      setNavVisible(true);
      // Hide again after 3s
      clearTimeout((window as any).__navTimer);
      (window as any).__navTimer = setTimeout(() => setNavVisible(false), 3000);
    };
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('touchmove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('touchmove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimeout((window as any).__navTimer);
    };
  }, [isReels]);

  if (hide) return null;

  return (
    <AnimatePresence>
      {(!isReels || navVisible) && (
        <motion.nav
          key="bottom-nav"
          initial={isReels ? { y: 80 } : { y: 0 }}
          animate={{ y: 0 }}
          exit={isReels ? { y: 80 } : { y: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/10 px-2 py-3"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-white bg-purple-600/30"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <item.icon className="w-6 h-6" />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
                  />
                )}
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};