import { useRef, useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebRTCProps {
  remoteUserId: string;
  isCaller: boolean;
  callType: 'audio' | 'video';
  callId?: string;
}

export const useWebRTC = ({ remoteUserId, isCaller, callType, callId }: UseWebRTCProps) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasOffer, setHasOffer] = useState(false);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers if available
  ];

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: remoteUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected');
    };

    return pc;
  };

  const getUserMedia = async (video: boolean) => {
    const constraints = {
      audio: true,
      video: video ? { facingMode } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    return stream;
  };

  const startCall = async () => {
    if (!socket || !user) return;

    const pc = createPeerConnection();
    const stream = await getUserMedia(callType === 'video');
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { to: remoteUserId, from: user.id, offer });
    }

    socket.emit('start-call');
  };

  const acceptCall = async () => {
    if (!socket || !user) return;

    // If we already received the offer, don't create a new peer connection
    // The offer handler already set up the connection
    if (hasOffer) {
      socket.emit('accept-call', { callId, from: user.id });
      return;
    }

    // Create peer connection only if we haven't received the offer yet
    const pc = createPeerConnection();
    const stream = await getUserMedia(callType === 'video');
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    socket.emit('accept-call', { callId, from: user.id });
  };

  const rejectCall = () => {
    if (!socket || !user) return;
    socket.emit('reject-call', { callId, from: user.id });
  };

  const endCall = () => {
    if (!socket) return;
    socket.emit('end-call', { callId });
    cleanup();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    if (localStreamRef.current) {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        localStreamRef.current.removeTrack(videoTrack);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: newFacingMode },
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      localStreamRef.current.addTrack(newVideoTrack);

      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      }
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', async (data) => {
      // Mark that we've received the offer
      setHasOffer(true);
      
      // If we already have a peer connection with tracks from acceptCall, use it
      if (peerConnectionRef.current && localStreamRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('answer', { to: data.from, answer });
        return;
      }

      // Create new peer connection
      const pc = createPeerConnection();
      const stream = await getUserMedia(callType === 'video');
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { to: data.from, answer });
    });

    socket.on('answer', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice-candidate', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('call-ended', () => {
      cleanup();
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket, callType]);

  return {
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    isConnected,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
  };
};