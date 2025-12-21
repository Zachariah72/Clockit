import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Plus, Film, Radio, FileText, Circle, Users, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  hidePlayer?: boolean;
  hideBottomNav?: boolean;
}

export const Layout = ({ children, hidePlayer, hideBottomNav }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Only show FAB on home page
  const showFab = location.pathname === "/";

  const fabOptions = [
    {
      icon: Film,
      label: "Create Reel",
      action: () => {
        navigate("/reels");
        setIsFabOpen(false);
      },
      color: "text-red-500"
    },
    {
      icon: Radio,
      label: "Go Live",
      action: () => {
        navigate("/live");
        setIsFabOpen(false);
      },
      color: "text-green-500"
    },
    {
      icon: FileText,
      label: "Add Post",
      action: () => {
        // Navigate to post creation
        setIsFabOpen(false);
      },
      color: "text-blue-500"
    },
    {
      icon: Circle,
      label: "Add Story",
      action: () => {
        navigate("/stories");
        setIsFabOpen(false);
      },
      color: "text-purple-500"
    },
    {
      icon: Users,
      label: "Create Group",
      action: () => {
        // Navigate to group creation
        setIsFabOpen(false);
      },
      color: "text-orange-500"
    },
    {
      icon: UserPlus,
      label: "Add Friend",
      action: () => {
        // Navigate to add friends
        setIsFabOpen(false);
      },
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <main className="pb-20">{children}</main>

      {/* Floating Action Button - Only on Home Page */}
      {showFab && (
        <div className="fixed bottom-24 right-6 z-50">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 space-y-3"
              >
                {fabOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        option.action();
                      }}
                      className="flex items-center gap-3 w-full bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-lg hover:bg-muted/50 transition-colors active:scale-95"
                    >
                      <div className={`p-2 rounded-full bg-muted ${option.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{option.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsFabOpen(!isFabOpen);
            }}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer touch-manipulation bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      )}

      {!hideBottomNav && <BottomNav />}
    </div>
  );
};
