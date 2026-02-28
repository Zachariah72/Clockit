import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Heart, MessageCircle, Play, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/utils/api";

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

const LiveFeed = () => {
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveStreams();
    // Refresh every 10 seconds
    const interval = setInterval(fetchActiveStreams, 10000);
    return () => clearInterval(interval);
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const joinLive = (streamId: string) => {
    window.location.href = `/live/${streamId}`;
  };

  const goLive = () => {
    window.location.href = "/live/create";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl p-4"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">Live</h1>
            {activeStreams.length > 0 && (
              <Button onClick={goLive} className="gap-2">
                <Plus className="w-4 h-4" />
                Go Live
              </Button>
            )}
          </div>
        </motion.header>

        {/* Live Streams Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStreams.map((stream, index) => (
              <motion.div
                key={stream.streamId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => joinLive(stream.streamId)}
              >
                {/* Stream Thumbnail */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-4xl">📺</span>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive" className="gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </Badge>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1 text-white text-sm">
                      <Eye className="w-3 h-3" />
                      {stream.viewerCount.toLocaleString()}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {stream.host.username ? stream.host.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {stream.host.username}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {stream.title}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State - Waiting for Live Sessions */}
        {activeStreams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6">
              <div className="relative">
                <Eye className="w-12 h-12 text-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Live Sessions</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              This page shows ongoing live sessions. When someone goes live, their stream will appear here automatically.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={goLive} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Start Your Live Stream
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Or wait for others to go live
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LiveFeed;