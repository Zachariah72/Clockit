import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Eye, Users, Mic, MicOff, Video, VideoOff, Gift, Crown, Shield, UserPlus, Settings, User, Palette } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera as CameraComponent } from "@/components/Camera";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const Live = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);
  const [comments, setComments] = useState([
    { id: 1, user: "fan123", message: "Amazing stream!", avatar: avatar1 },
    { id: 2, user: "musiclover", message: "Love this song!", avatar: avatar2 },
    { id: 3, user: "djfan", message: "Keep it up!", avatar: avatar3 },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(true); // Current user is admin
  const [coHosts, setCoHosts] = useState([
    { id: 1, name: "CoHost1", avatar: avatar1, role: "co-host" },
    { id: 2, name: "CoHost2", avatar: avatar2, role: "moderator" },
  ]);
  const [moderators, setModerators] = useState([
    { id: 3, name: "Mod1", avatar: avatar3, role: "moderator" },
  ]);
  const [coHostRequests, setCoHostRequests] = useState([
    { id: 4, name: "UserX", avatar: avatar1 },
    { id: 5, name: "UserY", avatar: avatar2 },
  ]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [likes, setLikes] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();
  const tapCountRef = useRef(0);

  const handleSendComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        user: "You",
        message: newComment,
        avatar: avatar1
      }]);
      setNewComment("");
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      setMicEnabled(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied');
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const acceptCoHostRequest = (userId: number) => {
    const user = coHostRequests.find(u => u.id === userId);
    if (user && coHosts.length < 10) {
      setCoHosts([...coHosts, { ...user, role: "co-host" }]);
      setCoHostRequests(coHostRequests.filter(u => u.id !== userId));
    }
  };

  const assignModerator = (userId: number) => {
    if (moderators.length < 3) {
      const user = coHosts.find(u => u.id === userId);
      if (user) {
        setCoHosts(coHosts.filter(u => u.id !== userId));
        setModerators([...moderators, { ...user, role: "moderator" }]);
      }
    }
  };

  const removeCoHost = (userId: number) => {
    setCoHosts(coHosts.filter(u => u.id !== userId));
  };

  const removeModerator = (userId: number) => {
    setModerators(moderators.filter(u => u.id !== userId));
  };

  const handleDoubleTap = () => {
    setLikes(prev => prev + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleTap = () => {
    tapCountRef.current += 1;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = setTimeout(() => {
      if (tapCountRef.current === 2) {
        handleDoubleTap();
      }
      tapCountRef.current = 0;
    }, 300);
  };

  const handleUserTap = (user: any) => {
    if (isAdmin) {
      setSelectedUser(user);
      setShowUserMenu(true);
    }
  };

  const handleUserAction = (action: string) => {
    if (!selectedUser) return;

    switch (action) {
      case 'accept_co_host':
        acceptCoHostRequest(selectedUser.id);
        break;
      case 'remove_user':
        if (selectedUser.role === 'co-host') {
          removeCoHost(selectedUser.id);
        } else if (selectedUser.role === 'moderator') {
          removeModerator(selectedUser.id);
        }
        break;
      case 'mute_user':
        // Implement mute functionality
        console.log('Mute user:', selectedUser.id);
        break;
      case 'add_moderator':
        if (selectedUser.role === 'co-host') {
          assignModerator(selectedUser.id);
        }
        break;
    }
    setShowUserMenu(false);
    setSelectedUser(null);
  };

  return (
    <Layout hidePlayer>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 glass-card rounded-b-3xl p-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">Live</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
            <Button
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? "destructive" : "default"}
              size="sm"
            >
              {isLive ? "End Live" : "Go Live"}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Stream Area with Overlay Chat */}
      <div className="relative h-[calc(100vh-120px)]">
        <div
          className="relative h-full w-full"
          onClick={handleTap}
        >
          {cameraEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Live</h2>
                <p className="text-muted-foreground">Sip en vibe</p>
                {!isLive && (
                  <Button onClick={() => setShowCameraSetup(true)} className="mt-4">
                    Setup Camera & Filters
                  </Button>
                )}
                {isLive && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-500 font-medium">LIVE</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Double Tap Heart Animation */}
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500" />
            </motion.div>
          )}

          {/* Like Counter */}
          {likes > 0 && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="flex items-center gap-1 text-white">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="font-medium">{likes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Chat Messages */}
        <div className="absolute inset-0 pointer-events-none">
          {comments.slice(-5).map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [50, 0, -100, -150]
              }}
              transition={{
                duration: 4,
                delay: index * 0.5,
                times: [0, 0.2, 0.8, 1]
              }}
              className="absolute right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-xs"
              style={{
                top: `${20 + index * 15}%`,
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <p className="text-white text-sm font-medium">{comment.user}</p>
                  <p className="text-white/90 text-sm">{comment.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stream Controls */}
        {isLive && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowCameraSetup(true)}
              className="bg-black/50 hover:bg-black/70"
            >
              <Palette className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowFooter(true)}
              className="bg-black/50 hover:bg-black/70"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Section - Chat Input on Top, Management Below */}
      <div className="bg-background/95 backdrop-blur-sm border-t border-border">
        {/* Full-width Chat Input - On Top */}
        <div className="w-full p-4 border-b border-border/50">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Say something..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              className="flex-1"
            />
            <Button onClick={handleSendComment} size="icon">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Management Menu */}
        {showUserMenu && selectedUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUserMenu(false)}
          >
            <motion.div
              className="bg-background rounded-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedUser.role === 'viewer' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUserAction('accept_co_host')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Accept as Co-host
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleUserAction('remove_user')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Remove from Live
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleUserAction('mute_user')}
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Mute User
                </Button>

                {selectedUser.role === 'co-host' && moderators.length < 3 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUserAction('add_moderator')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Add as Moderator
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Co-hosts & Management - Below Chat Input */}
        {isAdmin && (
          <div className="p-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {/* Co-hosts */}
              <div className="flex-shrink-0">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Co-hosts ({coHosts.length}/10)
                </h4>
                <div className="flex gap-2">
                  {coHosts.map((host) => (
                    <div
                      key={host.id}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                      onClick={() => handleUserTap(host)}
                    >
                      <img src={host.avatar} alt={host.name} className="w-8 h-8 rounded-full" />
                      <span className="text-xs text-center">{host.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moderators */}
              <div className="flex-shrink-0">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Moderators ({moderators.length}/3)
                </h4>
                <div className="flex gap-2">
                  {moderators.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                      onClick={() => handleUserTap(mod)}
                    >
                      <img src={mod.avatar} alt={mod.name} className="w-8 h-8 rounded-full" />
                      <span className="text-xs text-center">{mod.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Co-host Requests */}
              <div className="flex-shrink-0">
                <h4 className="font-medium mb-2 text-sm">Requests</h4>
                <div className="flex gap-2">
                  {coHostRequests.map((request) => (
                    <div key={request.id} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <img src={request.avatar} alt={request.name} className="w-8 h-8 rounded-full" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs text-center">{request.name}</span>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => acceptCoHostRequest(request.id)} className="h-6 w-6 p-0">
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          ✗
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Overlay - Shows when tapped */}
      {showFooter && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40"
          onClick={() => setShowFooter(false)}
        >
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowFooter(false)}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Gift className="w-5 h-5" />
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Camera Setup Modal */}
      {showCameraSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <CameraComponent
              onCapture={(imageData, file) => {
                // Handle camera setup completion
                setCameraEnabled(true);
                setMicEnabled(true);
                setShowCameraSetup(false);
                // In a real app, you would set up the stream here
              }}
              onClose={() => setShowCameraSetup(false)}
              enableFilters={true}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  </Layout>
);
};

export default Live;