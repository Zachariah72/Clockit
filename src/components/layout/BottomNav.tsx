import { Home, Music, Users, MessageCircle, Film, Camera, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface BottomNavProps {
  hide?: boolean;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Camera, label: "Snappy", path: "/stories" },
  { icon: Music, label: "Music", path: "/music" },
  { icon: Film, label: "Reels", path: "/reels" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = ({ hide = false }: BottomNavProps) => {
  const location = useLocation();

  if (hide) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-cocoa-950/90 backdrop-blur-lg border-t border-white/5 px-6 py-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};