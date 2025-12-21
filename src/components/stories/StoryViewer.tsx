import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import heroMusic from "@/assets/hero-music.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoryId?: string;
  onStoryViewed?: (storyId: string) => void;
}

const mockStoryData = [
  {
    id: "1",
    username: "Sarah",
    avatar: avatar1,
    image: heroMusic,
    timestamp: "2h ago",
    streak: 15,
  },
  {
    id: "2",
    username: "Mike",
    avatar: avatar2,
    image: album1,
    timestamp: "4h ago",
    streak: 8,
  },
  {
    id: "3",
    username: "Alex",
    avatar: avatar3,
    image: album2,
    timestamp: "6h ago",
    streak: 23,
  },
];

export const StoryViewer = ({ isOpen, onClose, initialStoryId, onStoryViewed }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = mockStoryData[currentIndex];

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Mark current story as viewed
          onStoryViewed?.(currentStory.id);

          if (currentIndex < mockStoryData.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentIndex, onClose]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < mockStoryData.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {mockStoryData.map((_, index) => (
              <div key={index} className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-foreground rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      index < currentIndex
                        ? "100%"
                        : index === currentIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.avatar}
                alt={currentStory.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {currentStory.username}
                  </span>
                  <div className="flex items-center gap-1 text-secondary">
                    <Flame className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold">{currentStory.streak}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {currentStory.timestamp}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Story image */}
          <div
            className="w-full h-full"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <img
              src={currentStory.image}
              alt="Story"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation areas */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-5"
            onClick={handlePrevious}
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full z-5"
            onClick={handleNext}
          />

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/30 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < mockStoryData.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/30 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Bottom actions */}
          <div className="absolute bottom-8 left-4 right-4 flex items-center gap-3 z-10">
            <input
              type="text"
              placeholder="Reply to story..."
              className="flex-1 h-12 px-4 rounded-full bg-muted/50 backdrop-blur-sm border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button variant="ghost" size="icon" className="text-secondary">
              <Heart className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary">
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
