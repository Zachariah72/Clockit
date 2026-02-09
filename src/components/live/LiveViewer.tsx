import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(1);
  const [showChat, setShowChat] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  useEffect(() => {
    if (!socket) return;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = stream;

        if (localVideoRef.current && isBroadcaster) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('live_ice_candidate', {
              streamId,
              candidate: event.candidate
            });
          }
        };

        pc.ontrack = (event) => {
          if (!isBroadcaster && localVideoRef.current) {
            localVideoRef.current.srcObject = event.streams[0];
          }
        };

        if (isBroadcaster) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('live_offer', { streamId, offer });
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    startMedia();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [socket, streamId, isBroadcaster]);

  useEffect(() => {
    if (!socket) return;

    socket.on('live_offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (isBroadcaster) return;

      const pc = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('live_answer', { streamId, answer });
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
  }, [socket, streamId, isBroadcaster]);

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

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Record in 1-second chunks
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    toast.success('Recording started');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const uploadRecording = async () => {
    if (recordedChunksRef.current.length === 0) {
      return null;
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/live/${streamId}/recording`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Recording uploaded successfully');
        return data.recordingUrl;
      } else {
        toast.error('Failed to upload recording');
        return null;
      }
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast.error('Failed to upload recording');
      return null;
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="relative h-full bg-black flex">
      <div className="flex-1 relative">
        {isBroadcaster ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm">{viewerCount}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm">{hostName}</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          {isBroadcaster && (
            <>
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="lg"
                onClick={toggleMute}
                className="rounded-full"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant={isVideoOff ? 'destructive' : 'secondary'}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
              {!isRecording ? (
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={startRecording}
                  className="rounded-full gap-2"
                >
                  <Circle className="w-5 h-5 fill-red-500" />
                  Record
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={stopRecording}
                  className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Circle className="w-5 h-5 fill-red-500 animate-pulse" />
                  Stop ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})
                </Button>
              )}
            </>
          )}
          <Button
            variant="destructive"
            size="lg"
            onClick={async () => {
              // Stop recording if active
              if (isRecording) {
                stopRecording();
              }
              // Upload recording if available
              if (isBroadcaster && onUploadRecording) {
                await onUploadRecording();
              }
              onEndStream();
            }}
            className="rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {showChat && (
        <div className="w-80 border-l border-border hidden md:block">
          <LiveChat streamId={streamId} />
        </div>
      )}
    </div>
  );
};
