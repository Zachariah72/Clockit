import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Video, VideoOff, Phone, 
  RotateCcw, MessageSquare, Users, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CallUser {
  id: string;
  name: string;
  avatar: string;
}

interface VideoCallProps {
  user: CallUser;
  isVideoCall: boolean;
  onEnd: () => void;
}

export const VideoCall = ({ user, isVideoCall, onEnd }: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideoCall);
  const [callDuration, setCallDuration] = useState(0);

  // Simulated call timer
  useState(() => {
    const timer = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Video/Avatar Area */}
      <div className="flex-1 relative flex items-center justify-center bg-muted/20">
        {isVideoOn ? (
          <>
            {/* Remote video (placeholder) */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Avatar className="w-40 h-40 border-4 border-primary/30">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            {/* Self preview */}
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              className="absolute bottom-24 right-4 w-32 h-44 rounded-2xl bg-card border-2 border-border overflow-hidden shadow-lg"
            >
              <div className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center">
                <span className="text-xs text-muted-foreground">You</span>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Avatar className="w-40 h-40 border-4 border-primary/30">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mt-6">{user.name}</h2>
            <p className="text-muted-foreground mt-2">{formatDuration(callDuration)}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="glass-card rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant={!isVideoOn ? "destructive" : "outline"}
            size="lg"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={onEnd}
          >
            <Phone className="w-7 h-7 rotate-[135deg]" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Incoming call screen
interface IncomingCallProps {
  user: CallUser;
  isVideo: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCall = ({ user, isVideo, onAccept, onDecline }: IncomingCallProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
        <Avatar className="w-32 h-32 border-4 border-primary relative">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
        </Avatar>
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mt-8">{user.name}</h2>
      <p className="text-muted-foreground mt-2">
        Incoming {isVideo ? "video" : "audio"} call...
      </p>

      <div className="flex gap-8 mt-12">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={onDecline}
          >
            <Phone className="w-7 h-7 rotate-[135deg]" />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="gradient"
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={onAccept}
          >
            {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
