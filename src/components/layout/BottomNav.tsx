import { Home, Music, Users, MessageCircle, Film, Camera, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Camera, label: "Snappy", path: "/stories" },
  { icon: Music, label: "Music", path: "/music" },
  { icon: Film, label: "Reels", path: "/reels" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-cocoa-950/90 backdrop-blur-lg border-t border-white/5 px-6 py-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 relative group"
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-white/10 text-clay-400" 
                  : "text-cream-100/40 group-hover:text-cream-100/80"
              )}>
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    isActive && "scale-110"
                  )}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-clay-400" : "text-transparent group-hover:text-cream-100/60"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-clay-400 rounded-full"
                  style={{
                    boxShadow: "0 0 10px #ff00d4",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};