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
    if (!socket || !user) {
      console.log('acceptCall early return - socket:', !!socket, 'user:', !!user);
      return;
    }

    console.log('acceptCall proceeding - socket connected, user exists');

    // Get local media stream first (for callee to speak)
    let stream = localStreamRef.current;
    if (!stream) {
      stream = await getUserMedia(callType === 'video');
      localStreamRef.current = stream;
    }

    // If we already have a peer connection, add tracks if they don't exist
    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
      // Add tracks to existing connection if they don't exist
      stream.getTracks().forEach(track => {
        const senders = pc.getSenders();
        const trackExists = senders.some(sender => sender.track?.kind === track.kind);
        if (!trackExists) {
          pc.addTrack(track, stream);
        }
      });
      socket.emit('accept-call', { callId, from: user.id });
      return;
    }

    // Create peer connection
    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    socket.emit('accept-call', { callId, from: user.id });
    console.log('accept-call event emitted', { callId, from: user.id });
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
        try {
          const pc = peerConnectionRef.current;
          // Check if we can set remote description
          if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
            console.warn('Cannot set remote offer, signaling state:', pc.signalingState);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { to: data.from, answer });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
        return;
      }

      try {
        // Create new peer connection
        const pc = createPeerConnection();
        const stream = await getUserMedia(callType === 'video');
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: data.from, answer });
      } catch (error) {
        console.error('Error creating answer:', error);
      }
    });

    socket.on('answer', async (data) => {
      try {
        if (peerConnectionRef.current) {
          const pc = peerConnectionRef.current;
          // Only set remote description if in the correct state
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } else if (pc.signalingState === 'stable') {
            console.warn('Already in stable state, ignoring answer');
          } else {
            console.warn('Cannot set remote answer, signaling state:', pc.signalingState);
          }
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('ice-candidate', async (data) => {
      try {
        if (peerConnectionRef.current) {
          const pc = peerConnectionRef.current;
          // Only add ICE candidate if remote description is set
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            console.warn('Remote description not set, queuing ICE candidate');
            // Queue the ICE candidate for later
            setTimeout(() => {
              if (pc.remoteDescription) {
                pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    socket.on('call-ended', () => {
      setHasOffer(false);
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