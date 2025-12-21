import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, Sparkles, Flame, X, RotateCcw, Zap, Heart, Smile, Star, Film, Radio, FileText, Circle, Users, UserPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Layout } from "@/components/layout/Layout";
import { StoryCircle } from "@/components/stories/StoryCircle";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useNavigate } from "react-router-dom";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const friendsWithStories = [
  { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true, streak: 15, lastActive: "2h ago" },
  { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true, streak: 8, lastActive: "4h ago" },
  { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true, streak: 23, lastActive: "1h ago" },
  { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false, streak: 5, lastActive: "6h ago" },
  { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false, streak: 12, lastActive: "Yesterday" },
  { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true, streak: 30, lastActive: "30m ago" },
];

const Stories = () => {
  const navigate = useNavigate();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const filters = [
    { id: 'none', name: 'None', icon: RotateCcw },
    { id: 'vintage', name: 'Vintage', icon: Star, style: 'sepia' },
    { id: 'bright', name: 'Bright', icon: Zap, style: 'brightness-125' },
    { id: 'warm', name: 'Warm', icon: Heart, style: 'hue-rotate-15' },
    { id: 'cool', name: 'Cool', icon: Smile, style: 'hue-rotate-180' },
  ];

  const friends = [
    { id: '1', name: 'Sarah', avatar: avatar1 },
    { id: '2', name: 'Mike', avatar: avatar2 },
    { id: '3', name: 'Alex', avatar: avatar3 },
  ];

  const createOptions = [
    {
      icon: Film,
      label: "Create Reel",
      action: () => {
        navigate("/reels");
        setIsCreateMenuOpen(false);
      },
      color: "text-red-500"
    },
    {
      icon: Radio,
      label: "Go Live",
      action: () => {
        navigate("/live");
        setIsCreateMenuOpen(false);
      },
      color: "text-green-500"
    },
    {
      icon: FileText,
      label: "Add Post",
      action: () => {
        // Navigate to post creation
        setIsCreateMenuOpen(false);
      },
      color: "text-blue-500"
    },
    {
      icon: Circle,
      label: "Add Story",
      action: () => {
        openCamera();
        setIsCreateMenuOpen(false);
      },
      color: "text-purple-500"
    },
    {
      icon: Users,
      label: "Create Group",
      action: () => {
        // Navigate to group creation
        setIsCreateMenuOpen(false);
      },
      color: "text-orange-500"
    },
    {
      icon: UserPlus,
      label: "Add Friend",
      action: () => {
        // Navigate to add friends
        setIsCreateMenuOpen(false);
      },
      color: "text-pink-500"
    }
  ];

  // Start camera when camera interface opens
  useEffect(() => {
    if (isCameraOpen && !capturedImage && !streamRef.current) {
      openCamera();
    }
  }, [isCameraOpen]);

  const openCamera = async (cameraFacing: 'user' | 'environment' = 'user') => {
    setIsCameraLoading(true);
    try {
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      console.log(`Requesting ${cameraFacing} camera access...`);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;

      // Wait for video element to be ready
      await new Promise(resolve => {
        if (videoRef.current) {
          console.log('Attaching stream to video element');
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing...');
            videoRef.current?.play().then(() => {
              console.log('Video playing successfully');
              resolve(void 0);
            }).catch(e => {
              console.error('Play failed:', e);
              resolve(void 0);
            });
          };
        } else {
          console.error('Video element not found');
          resolve(void 0);
        }
      });

      setFacingMode(cameraFacing);
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please allow camera and microphone permissions.');
    } finally {
      setIsCameraLoading(false);
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    openCamera(newFacingMode);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setSelectedFilter(null);
  };

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Apply filter
        if (selectedFilter && selectedFilter !== 'none') {
          const filter = filters.find(f => f.id === selectedFilter);
          if (filter?.style) {
            canvas.style.filter = filter.style;
          }
        }

        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const shareSnap = () => {
    if (capturedImage) {
      setIsShareModalOpen(true);
    }
  };

  const sendSnapToChat = () => {
    if (capturedImage && selectedRecipients.length > 0) {
      // Here you would send the snap as a message to selected recipients
      alert(`Snap sent to ${selectedRecipients.length} friend(s)! (View-once message)`);
      setIsShareModalOpen(false);
      setSelectedRecipients([]);
      closeCamera();
    }
  };

  const toggleRecipient = (friendId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const selectFromGallery = () => {
    // Create file input for offline media
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setCapturedImage(event.target.result as string);
            setIsCameraOpen(true);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">Stories</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="relative">
                <Button
                  variant="glow"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                >
                  <Camera className="w-4 h-4" />
                  <span>Create</span>
                </Button>

                <AnimatePresence>
                  {isCreateMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-0 top-12 w-64 space-y-2 z-50"
                    >
                      {createOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={option.action}
                            className="flex items-center gap-3 w-full bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-lg hover:bg-muted/50 transition-colors"
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
              </div>
            </div>
          </div>
        </motion.header>

        {/* Add Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <div className="glass-card p-4 sm:p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Share Your Moment
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={() => openCamera()}>
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Camera</span>
              </Button>
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={selectFromGallery}>
                <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                <span className="text-xs sm:text-sm">Gallery</span>
              </Button>
              <Button variant="glass" className="flex-1 h-20 sm:h-24 flex-col gap-2" onClick={() => setIsCameraOpen(true)}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <span className="text-xs sm:text-sm">Effects</span>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Friends Stories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-4"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Friends
          </h3>
          <div className="space-y-3">
            {friendsWithStories.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setIsStoryViewerOpen(true)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <StoryCircle
                  image={friend.image}
                  username=""
                  hasUnseenStory={friend.hasUnseenStory}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {friend.username}
                    </span>
                    {friend.streak > 0 && (
                      <div className="flex items-center gap-1 text-secondary">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold">{friend.streak}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {friend.lastActive}
                  </span>
                </div>
                {friend.hasUnseenStory && (
                  <div className="w-2 h-2 bg-primary rounded-full glow-cyan" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Share Modal */}
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Send Snap</h3>

              {/* Preview */}
              <div className="mb-4">
                <img
                  src={capturedImage!}
                  alt="Snap preview"
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>

              {/* Recipients */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Send to:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => toggleRecipient(friend.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedRecipients.includes(friend.id)
                          ? 'bg-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="flex-1">{friend.name}</span>
                      {selectedRecipients.includes(friend.id) && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsShareModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendSnapToChat}
                  disabled={selectedRecipients.length === 0}
                  className="flex-1"
                >
                  Send Snap
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Camera Interface */}
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="relative h-full flex flex-col">
              {/* Camera Feed */}
              <div className="flex-1 relative bg-black">
                {isCameraLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                    style={{
                      filter: selectedFilter && selectedFilter !== 'none'
                        ? filters.find(f => f.id === selectedFilter)?.style
                        : 'none'
                    }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{
                      transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', // Mirror only for front camera
                      minHeight: '100%',
                      minWidth: '100%'
                    }}
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeCamera}
                  className="absolute top-4 right-4 text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Filters */}
              {!capturedImage && (
                <div className="absolute bottom-20 left-0 right-0 p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {filters.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <Button
                          key={filter.id}
                          variant={selectedFilter === filter.id ? "default" : "secondary"}
                          size="sm"
                          onClick={() => setSelectedFilter(filter.id)}
                          className="flex-shrink-0 gap-1"
                        >
                          <Icon className="w-4 h-4" />
                          {filter.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="p-6 flex justify-center gap-4">
                {!capturedImage ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={switchCamera}
                      className="rounded-full"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16"
                      onClick={capturePhoto}
                    >
                      <div className="w-6 h-6 bg-white rounded-full" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFlashOn(!isFlashOn)}
                      className="rounded-full"
                    >
                      <Zap className={`w-5 h-5 ${isFlashOn ? 'text-yellow-400' : ''}`} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setCapturedImage(null)}>
                      Retake
                    </Button>
                    <Button onClick={shareSnap}>
                      Share Snap
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Story Viewer */}
        <StoryViewer
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default Stories;
