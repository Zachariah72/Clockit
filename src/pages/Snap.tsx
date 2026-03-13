import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, RotateCcw, Zap, Download, Share2, Heart, MessageCircle, Eye, RefreshCw, Pencil, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera as CameraComponent } from "@/components/Camera";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";

interface SnapItem {
  image: string;
  caption?: string;
  createdAt?: number;
}

const Snap = () => {
  const navigate = useNavigate();
  const [currentSnap, setCurrentSnap] = useState<string | null>(null);
  const [snapFile, setSnapFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [caption, setCaption] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [snapHistory, setSnapHistory] = useState<SnapItem[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState("");

  // Load snap history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("snapHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSnapHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to parse snap history:", e);
      }
    }
  }, []);

  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);

  const handleCapture = (imageData: string, file: File) => {
    setCurrentSnap(imageData);
    setSnapFile(file);
    setShowPreview(true);
  };


  const handleRetake = () => {
    setCurrentSnap(null);
    setSnapFile(null);
    setCaption("");
    setShowPreview(false);
  };

  const handleDownload = () => {
    if (!currentSnap) return;

    const link = document.createElement('a');
    link.href = currentSnap;
    link.download = `snap-${Date.now()}.jpg`;
    link.click();

    toast.success("Snap downloaded!");
  };

  const handleShare = async () => {
    if (!currentSnap) return;

    try {
      if (navigator.share) {
        const file = snapFile || new File([await fetch(currentSnap).then(r => r.blob())], 'snap.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'Check out my snap!',
          text: caption || 'Sent from Clockit',
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard or show share options
        await navigator.clipboard.writeText(currentSnap);
        toast.success("Snap link copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to share snap");
    }
  };

  const fetchStories = async () => {
    setIsLoadingStories(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data);
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const sendSnapAsStory = async () => {
    if (!currentSnap || !snapFile) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('auth_token');

      // First, upload the image (you might need to implement file upload)
      // For now, we'll use the data URL directly
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: caption,
          mediaUrl: currentSnap, // In real app, this would be uploaded file URL
          type: 'image',
          isPrivate: false
        })
      });

      if (response.ok) {
        toast.success("Snap sent to your story! ✨");
        // Save to snap history for cross-page access (as object with image and caption)
        const newSnap: SnapItem = { 
          image: currentSnap, 
          caption,
          createdAt: Date.now()
        };
        const updatedHistory = [newSnap, ...snapHistory.slice(0, 9)];
        setSnapHistory(updatedHistory);
        localStorage.setItem('snapHistory', JSON.stringify(updatedHistory));
        // Refresh stories
        fetchStories();
        // Reset
        setCurrentSnap(null);
        setSnapFile(null);
        setCaption("");
        setShowPreview(false);
      } else {
        toast.error("Failed to send snap to story");
      }
    } catch (error) {
      console.error('Error sending story:', error);
      toast.error("Failed to send snap to story");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gradient">Send Snap</h1>
                <p className="text-sm text-muted-foreground">Capture & share moments</p>
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Camera Section */}
                <div className="w-full">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold mb-2">Take a Snap</h2>
                    <p className="text-sm text-muted-foreground">
                      Capture a photo to send to your story
                    </p>
                  </div>

                  <div className="camera-container" style={{ height: '75vh', maxHeight: 'none' }}>
                    <CameraComponent
                      onCapture={handleCapture}
                      className="w-full rounded-xl overflow-hidden"
                    />
                  </div>
                </div>

                {/* Snap History */}
                {snapHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Snaps</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {snapHistory.slice(0, 6).map((snap, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity relative group"
                          onClick={() => {
                            setCurrentSnap(snap.image);
                            setCaption(snap.caption || "");
                            setShowPreview(true);
                          }}
                        >
                          <img
                            src={snap.image}
                            alt={`Snap ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="rounded-full h-8 w-8 bg-white/20 hover:bg-white/40 border-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingIndex(index);
                                setEditCaption(snap.caption || "");
                              }}
                            >
                              <Pencil className="w-3 h-3 text-white" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="rounded-full h-8 w-8 bg-white/20 hover:bg-white/40 border-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = snapHistory.filter((_, i) => i !== index);
                                setSnapHistory(updated);
                                localStorage.setItem('snapHistory', JSON.stringify(updated));
                                toast.success("Snap deleted");
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                            </Button>
                          </div>
                          {snap.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                              <p className="text-[10px] text-white truncate">{snap.caption}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Caption Modal */}
                <AnimatePresence>
                  {editingIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                      onClick={() => setEditingIndex(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="bg-card p-4 rounded-xl w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="font-semibold mb-3">Edit Caption</h3>
                        <Textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          placeholder="Add a caption..."
                          className="mb-3"
                          maxLength={100}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingIndex(null)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              const updated = snapHistory.map((snap, i) => 
                                i === editingIndex ? { ...snap, caption: editCaption } : snap
                              );
                              setSnapHistory(updated);
                              localStorage.setItem('snapHistory', JSON.stringify(updated));
                              setEditingIndex(null);
                              toast.success("Caption updated!");
                            }}
                            className="flex-1"
                          >
                            Save
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stories Feed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Stories</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchStories}
                      disabled={isLoadingStories}
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingStories ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  {isLoadingStories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : stories.length > 0 ? (
                    <div className="space-y-4">
                      {stories.slice(0, 5).map((story, index) => (
                        <motion.div
                          key={story._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-card border border-border rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {story.userId?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {story.userId?.username || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(story.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {story.mediaUrl && (
                            <div className="mb-3">
                              <img
                                src={story.mediaUrl}
                                alt="Story content"
                                className="w-full rounded-lg object-cover max-h-48"
                              />
                            </div>
                          )}

                          {story.content && (
                            <p className="text-foreground mb-3">{story.content}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{story.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{story.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{story.comments || 0}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {stories.length > 5 && (
                        <div className="text-center">
                          <Button variant="outline" onClick={() => navigate('/stories')}>
                            View All Stories ({stories.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2 text-foreground">No stories yet</h4>
                      <p className="text-muted-foreground text-sm">
                        Be the first to share a story!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md mx-auto space-y-4"
              >
                {/* Snap Preview */}
                <div className="relative">
                  <img
                    src={currentSnap!}
                    alt="Snap preview"
                    className="w-full rounded-2xl shadow-lg"
                  />

                  {/* Preview Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleDownload}
                      className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleShare}
                      className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>

                {/* Caption Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-20 resize-none"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {caption.length}/100
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1 gap-2"
                    disabled={isSending}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake
                  </Button>

                  <Button
                    onClick={sendSnapAsStory}
                    className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send to Story
                      </>
                    )}
                  </Button>
                </div>

                {/* Edit Snap Button - Send back to camera */}
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(false)}
                  className="w-full gap-2"
                  disabled={isSending}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Snap (Add Filters)
                </Button>

                {/* Story Preview */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 text-foreground">Story Preview</h4>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <img
                      src={currentSnap!}
                      alt="Story thumbnail"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">Your Story</p>
                      <p className="text-sm text-muted-foreground">
                        {caption || "Just sent a snap!"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">0</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Snap;