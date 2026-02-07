import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoryId?: string;
  stories: any[];
  onStoryViewed?: (storyId: string) => void;
}

interface Story {
  id: string;
  username: string;
  image: string;
  hasUnseenStory: boolean;
}

export const StoryViewer = ({ isOpen, onClose, initialStoryId, stories, onStoryViewed }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use real stories or empty array if none
  const currentStory = stories[currentIndex] || null;

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Mark current story as viewed
          onStoryViewed?.(currentStory.id);

          if (currentIndex < stories.length - 1) {
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
  }, [isOpen, isPaused, currentIndex, stories, onClose, currentStory, onStoryViewed]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Don't render if no stories
  if (!isOpen || !currentStory) return null;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
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
            {stories.map((_, index) => (
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
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {currentStory.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {currentStory.username}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Just now
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Story image */}
          <div
            className="w-full h-full flex items-center justify-center bg-muted"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentStory.image}
              alt="Story"
              className={`w-full h-full object-cover ${isLoading ? 'hidden' : ''}`}
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                console.error('Failed to load story image:', currentStory.image);
                setIsLoading(false);
              }}
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
          {currentIndex < stories.length - 1 && (
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
