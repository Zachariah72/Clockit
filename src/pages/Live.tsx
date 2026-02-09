import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, MessageCircle, Heart, Share, Settings, Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/utils/api';
import { LiveViewer } from '@/components/live/LiveViewer';
import { LiveChat } from '@/components/live/LiveChat';
import { toast } from 'sonner';

interface Stream {
  streamId: string;
  title: string;
  host: {
    id: string;
    username: string;
    avatar?: string;
  };
  viewerCount: number;
  isLive: boolean;
}

export const Live = () => {
  const { streamId } = useParams();
  const { socket, isConnected } = useSocket();
  const { session } = useAuth();
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);
  const [streamTitle, setStreamTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [localStreamId, setLocalStreamId] = useState<string | null>(null);

  // Fetch stream details if streamId is in URL (viewer joining)
  useEffect(() => {
    if (streamId && !currentStream) {
      fetchStreamDetails(streamId);
    }
  }, [streamId]);

  const fetchStreamDetails = async (id: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/live/${id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStream(data.stream || data);
        setIsBroadcaster(false);
      }
    } catch (error) {
      console.error('Failed to fetch stream details:', error);
    }
  };

  useEffect(() => {
    fetchActiveStreams();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('live_started', (data: { streamId: string; title: string; host: { id: string; username: string; avatar?: string }; startedAt: Date }) => {
      setActiveStreams(prev => [...prev, {
        streamId: data.streamId,
        title: data.title,
        host: data.host,
        viewerCount: 1,
        isLive: true
      }]);
    });

    socket.on('live_ended', (data: { streamId: string }) => {
      setActiveStreams(prev => prev.filter(s => s.streamId !== data.streamId));
      if (currentStream?.streamId === data.streamId) {
        setCurrentStream(null);
        setIsBroadcaster(false);
        toast.success('Stream has ended');
      }
    });

    return () => {
      socket.off('live_started');
      socket.off('live_ended');
    };
  }, [socket, currentStream]);

  const fetchActiveStreams = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/live/active`);
      if (response.ok) {
        const streams = await response.json();
        setActiveStreams(streams);
      }
    } catch (error) {
      console.error('Error fetching active streams:', error);
    }
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/live/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: streamTitle })
      });

      if (response.ok) {
        const stream = await response.json();
        setCurrentStream(stream);
        setIsBroadcaster(true);
        setLocalStreamId(stream.streamId);

        socket?.emit('start_live', {
          streamId: stream.streamId,
          title: stream.title
        });

        toast.success('You are now live!');
      } else {
        toast.error('Failed to start stream');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream');
    } finally {
      setIsCreating(false);
    }
  };

  const joinStream = (stream: Stream) => {
    setCurrentStream(stream);
    socket?.emit('join_live', { streamId: stream.streamId });
  };

  const leaveStream = () => {
    if (currentStream) {
      socket?.emit('leave_live', { streamId: currentStream.streamId });
    }
    setCurrentStream(null);
    setIsBroadcaster(false);
    setLocalStreamId(null);
  };

  const endStream = async () => {
    if (!localStreamId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = getApiUrl();

      await fetch(`${apiUrl}/live/end/${localStreamId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      socket?.emit('end_live', { streamId: localStreamId });

      setCurrentStream(null);
      setIsBroadcaster(false);
      setLocalStreamId(null);
      setStreamTitle('');

      toast.success('Stream ended');
      fetchActiveStreams();
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  const uploadRecording = async () => {
    return null;
  };

  if (currentStream) {
    return (
      <Layout>
        <LiveViewer
          streamId={currentStream.streamId}
          title={currentStream.title}
          hostName={currentStream.host.username}
          hostAvatar={currentStream.host.avatar}
          isBroadcaster={isBroadcaster}
          onEndStream={isBroadcaster ? endStream : leaveStream}
          onUploadRecording={uploadRecording}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pb-20">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">Live</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </motion.header>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="glass-card p-4 rounded-xl">
              <h2 className="font-semibold mb-3">Go Live</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter stream title..."
                  className="flex-1 bg-muted rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={startStream}
                  disabled={isCreating}
                  variant="gradient"
                  className="gap-2"
                >
                  <Radio className="w-4 h-4" />
                  {isCreating ? 'Starting...' : 'Go Live'}
                </Button>
              </div>
            </div>
          </motion.div>

          <h2 className="text-lg font-semibold mb-4">Active Streams</h2>
          {activeStreams.length > 0 ? (
            <div className="space-y-3">
              {activeStreams.map((stream) => (
                <motion.div
                  key={stream.streamId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => joinStream(stream)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                    {stream.host.avatar ? (
                      <img src={stream.host.avatar} alt={stream.host.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">
                        {stream.host.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stream.host.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{stream.viewerCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active streams right now</p>
              <p className="text-sm">Be the first to go live!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
