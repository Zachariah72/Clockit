import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Eye, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import avatar1 from "@/assets/avatar-1.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

interface Story {
  _id: string;
  contentType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
}

interface StoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
}

export const StoriesModal = ({ isOpen, onClose, stories }: StoriesModalProps) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const closeStoryView = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-background rounded-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">My Stories</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {console.log('StoriesModal - stories prop:', stories)}
                {stories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No stories yet</h3>
                    <p className="text-muted-foreground">Create your first story to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stories.map((story, index) => (
                      <motion.div
                        key={story._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleStoryClick(story)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={story.mediaUrl}
                          alt="Story"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Overlay with stats */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <div className="flex items-center gap-3 text-white text-xs">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {story.viewsCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {story.likesCount}
                            </div>
                          </div>
                          <p className="text-white text-xs mt-1">{new Date(story.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Story type indicator */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          {story.contentType === 'video' ? (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Detail View */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={closeStoryView}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-sm max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedStory.mediaUrl}
                alt="Story"
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Story info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 rounded-b-lg">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedStory.viewsCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {selectedStory.likesCount}
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">{new Date(selectedStory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={closeStoryView}
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};