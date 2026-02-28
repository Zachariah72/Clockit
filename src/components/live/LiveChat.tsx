import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface LiveChatProps {
  streamId: string;
}

export const LiveChat = ({ streamId }: LiveChatProps) => {
  const { socket } = useSocket();
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('live_comment_added', (data: { userId: string; username: string; comment: string; timestamp: Date }) => {
      setComments(prev => [...prev, {
        id: Date.now().toString(),
        userId: data.userId,
        username: data.username,
        text: data.comment,
        timestamp: new Date(data.timestamp)
      }]);
    });

    return () => {
      socket.off('live_comment_added');
    };
  }, [socket]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const sendComment = () => {
    if (!newComment.trim() || !socket) return;

    socket.emit('live_comment', {
      streamId,
      comment: newComment,
      username: session?.user?.username || 'Anonymous'
    });

    setNewComment('');
  };

  const sendReaction = (emoji: string) => {
    if (!socket) return;

    socket.emit('live_reaction', {
      streamId,
      reaction: emoji
    });

    setShowEmoji(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Live Chat</h3>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <span className="font-semibold text-primary">{comment.username}:</span>
              <span className="text-foreground">{comment.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-2 border-t border-border flex gap-2"
          >
            {['❤️', '🔥', '👏', '😂', '😮', '🎉'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmoji(!showEmoji)}
            className="shrink-0"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendComment()}
            placeholder="Send a message..."
            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={sendComment}
            disabled={!newComment.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
