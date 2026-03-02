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
      {/* ... rest of your component ... */}
    </nav>
  );
};