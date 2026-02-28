import { Music, Headphones, Users, Home, CloudOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6",
                    isActive && "scale-110",
                    item.isOffline && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                  )}
                />
                {item.isOffline && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-sm opacity-50" />
                )}
                {isActive && (
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                    style={{
                      boxShadow: "0 0 10px hsl(var(--primary))",
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};