import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Heart, MessageCircle, Play, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Live streams will be populated from real ongoing sessions
const liveStreams: any[] = [];

const LiveFeed = () => {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const joinLive = (streamId: string) => {
    // Navigate to live stream page
    window.location.href = `/live/${streamId}`;
  };

  const goLive = () => {
    // Navigate to create live stream
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
            {liveStreams.length > 0 && (
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
            {liveStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => joinLive(stream.id)}
              >
                {/* Stream Thumbnail */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />

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
                      {stream.viewers.toLocaleString()}
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
                    <img
                      src={stream.avatar}
                      alt={stream.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {stream.username}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {stream.title}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2">
                    {stream.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State - Waiting for Live Sessions */}
        {liveStreams.length === 0 && (
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