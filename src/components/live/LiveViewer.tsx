import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { LiveChat } from './LiveChat';
import { getApiUrl } from '@/utils/api';
import { toast } from 'sonner';

interface LiveViewerProps {
  streamId: string;
  title: string;
  hostName: string;
  hostAvatar?: string;
  isBroadcaster: boolean;
  onEndStream: () => void;
  onUploadRecording?: () => Promise<string | null>;
}

export const LiveViewer = ({
  streamId,
  title,
  hostName,
  hostAvatar,
  isBroadcaster,
  onEndStream,
  onUploadRecording
}: LiveViewerProps) => {
  const { socket } = useSocket();
  const { session } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(1);
  const [showChat, setShowChat] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const iceServers = [
    // Google STUN servers (free, no auth needed)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // Twilio STUN servers (free)
    { urls: 'stun:global.stun.twilio.com:3478' },
    
    // Free TURN servers (public, may have limits)
    { 
      urls: 'turn:turn.rtccloud.net:80',
      username: 'guest',
      credential: 'guest'
    },
    {
      urls: 'turn:turn.rtccloud.net:443',
      username: 'guest',
      credential: 'guest'
    },
    {
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: import.meta.env.VITE_TWILIO_USERNAME || '',
      credential: import.meta.env.VITE_TWILIO_CREDENTIAL || ''
    }
  ];

  // Start camera when component mounts (broadcaster only)
  useEffect(() => {
    if (!localVideoRef.current) {
      const timer = setTimeout(() => {
        if (isBroadcaster) startCamera();
      }, 100);
      return () => clearTimeout(timer);
    } else if (isBroadcaster) {
      startCamera();
    }
  }, [isBroadcaster, streamId]);

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      console.log('Camera access granted, tracks:', stream.getTracks().length);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Camera attached to video element');
      } else {
        console.warn('Video ref not available yet');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  // Join stream room and setup WebRTC when socket connects
  useEffect(() => {
    if (!socket || !streamId) return;

    // Join the stream room
    socket.emit('join_live', { streamId, userId: session?.user?.id });
    
    const startMedia = async () => {
      try {
        // For broadcaster: get local camera
        if (isBroadcaster && !localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }

        const pc = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = pc;

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
          });
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('live_ice_candidate', {
              streamId,
              candidate: event.candidate,
              from: session?.user?.id
            });
          }
        };

        pc.ontrack = (event) => {
          // Show remote stream in remote video element
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        if (isBroadcaster) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('live_offer', { streamId, offer, from: session?.user?.id });
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    startMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [socket, streamId, isBroadcaster, session]);

  // Handle WebRTC signaling events
  useEffect(() => {
    if (!socket) return;

    socket.on('live_offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (isBroadcaster) return;

      const pc = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = pc;

      // Get viewer stream for sending back
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('live_answer', { streamId, answer, from: session?.user?.id });
    });

    socket.on('live_answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('live_ice_candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('viewer_joined', () => {
      setViewerCount(prev => prev + 1);
    });

    socket.on('viewer_left', () => {
      setViewerCount(prev => Math.max(1, prev - 1));
    });

    return () => {
      socket.off('live_offer');
      socket.off('live_answer');
      socket.off('live_ice_candidate');
      socket.off('viewer_joined');
      socket.off('viewer_left');
    };
  }, [socket, streamId, isBroadcaster, session]);

  // Recording functions
  const startRecording = () => {
    if (!localStreamRef.current) {
      toast.error('No stream available for recording');
      return;
    }

    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(localStreamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      toast.success('Recording saved!');
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    // Update timer every second
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    toast.success('Recording started');
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Create and download the recording
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `live-recording-${streamId}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Optionally upload to backend
      if (onUploadRecording) {
        const uploadUrl = await onUploadRecording();
        if (uploadUrl) {
          toast.success('Recording uploaded to cloud');
        }
      }
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onEndStream();
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote/Broadcaster Video - Full Screen */}
        {isBroadcaster ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Local Video (Picture-in-Picture) - Only for broadcaster */}
        {isBroadcaster && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-24 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-white shadow-xl"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <Circle className="w-4 h-4 animate-pulse fill-current" />
            <span className="text-white font-medium">{formatTime(recordingTime)}</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {hostName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-white font-semibold">{hostName}</h2>
                <p className="text-white/70 text-sm">{title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">LIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Viewer Count */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
        >
          <Users className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{viewerCount}</span>
        </motion.div>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-20 right-4 bottom-24 w-80 bg-black/50 backdrop-blur-xl rounded-2xl overflow-hidden"
            >
              <LiveChat streamId={streamId} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
        >
          <div className="flex items-center justify-center gap-4">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Button */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Record Button (Broadcaster Only) */}
            {isBroadcaster && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Circle className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </button>

            {/* Toggle Chat */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                showChat ? 'bg-purple-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
