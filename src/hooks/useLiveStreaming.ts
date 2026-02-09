import { useRef, useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface UseLiveStreamingProps {
  streamId: string;
  isBroadcaster: boolean;
}

export const useLiveStreaming = ({ streamId, isBroadcaster }: UseLiveStreamingProps) => {
  const { socket } = useSocket();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(1);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('live_ice_candidate', { streamId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected');
    };

    return pc;
  }, [socket, streamId]);

  const startBroadcast = useCallback(async () => {
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('live_offer', { streamId, offer });

      return stream;
    } catch (error) {
      console.error('Error starting broadcast:', error);
      throw error;
    }
  }, [socket, streamId, createPeerConnection]);

  const joinAsViewer = useCallback(async () => {
    if (!socket) return;

    const pc = createPeerConnection();

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
    };

    return pc;
  }, [socket, createPeerConnection]);

  const sendComment = useCallback((text: string, username: string) => {
    if (!socket) return;
    socket.emit('live_comment', { streamId, comment: text, username });
  }, [socket, streamId]);

  const sendReaction = useCallback((emoji: string) => {
    if (!socket) return;
    socket.emit('live_reaction', { streamId, reaction: emoji });
  }, [socket, streamId]);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('live_offer', async (data) => {
      const pc = createPeerConnection();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('live_answer', { streamId, answer });
    });

    socket.on('live_answer', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('live_ice_candidate', async (data) => {
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
  }, [socket, streamId, createPeerConnection]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    isConnected,
    viewerCount,
    startBroadcast,
    joinAsViewer,
    sendComment,
    sendReaction,
    cleanup
  };
};
