import { Music, Headphones, Users, Home, CloudOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const musicNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Music, label: "Music", path: "/music" },
  { icon: Headphones, label: "Podcasts", path: "/podcasts" },
  { icon: Users, label: "Groups", path: "/groups" },
  { icon: CloudOff, label: "Offline", path: "/downloads", isOffline: true },
];

export const MusicBottomNav = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-card rounded-t-3xl border-t border-border/50 pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {musicNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive && "scale-110",
                    item.isOffline && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                  )}
                />
                {item.isOffline && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-sm opacity-50" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="music-nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                    style={{
                      boxShadow: "0 0 10px hsl(var(--primary))",
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};