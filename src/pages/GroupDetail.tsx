import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Send, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useSocket } from '@/contexts/SocketContext';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/utils/api';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { currentTrack, isPlaying, currentTime, playTrack, play, pause } = useMediaPlayer();
  
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [syncState, setSyncState] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${getApiUrl()}/listening-groups/${id}/join`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGroup(data);
          if (data.currentTrack) {
            setSyncState({
              currentTrack: data.currentTrack,
              isPlaying: data.isPlaying,
              currentTime: data.currentTime,
              lastSyncAt: data.lastSyncAt
            });
          }
        } else {
          navigate('/groups');
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchGroup();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!socket || !isConnected || !id) return;

    socket.emit('join_listening_group', id);
    socket.emit('request_group_sync', id);

    const onSyncStateUpdated = (data: any) => {
      setSyncState(data);
    };

    const onMemberJoined = (data: any) => {
      console.log('Member joined:', data);
    };

    const onNewGroupMessage = (data: any) => {
      setMessages(prev => [...prev, data]);
    };

    const onSyncRequested = (data: any) => {
      if (currentTrack) {
        socket.emit('update_sync_state', {
          groupId: id,
          currentTrack,
          isPlaying,
          currentTime,
          lastSyncAt: Date.now()
        });
      }
    };

    socket.on('sync_state_updated', onSyncStateUpdated);
    socket.on('member_joined', onMemberJoined);
    socket.on('new_group_chat_message', onNewGroupMessage);
    socket.on('sync_requested', onSyncRequested);

    return () => {
      socket.emit('leave_listening_group', id);
      socket.off('sync_state_updated', onSyncStateUpdated);
      socket.off('member_joined', onMemberJoined);
      socket.off('new_group_chat_message', onNewGroupMessage);
      socket.off('sync_requested', onSyncRequested);
    };
  }, [socket, isConnected, id, currentTrack, isPlaying, currentTime]);

  const handleBroadcast = () => {
    if (currentTrack && socket) {
      const state = {
        groupId: id,
        currentTrack,
        isPlaying,
        currentTime,
        lastSyncAt: Date.now()
      };
      setSyncState(state);
      socket.emit('update_sync_state', state);
    }
  };

  const syncMyPlayer = () => {
    if (syncState && syncState.currentTrack) {
      playTrack(syncState.currentTrack);
      setTimeout(() => {
        if (syncState.isPlaying) {
          play();
        } else {
          pause();
        }
      }, 500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    
    socket.emit('group_chat_message', {
      groupId: id,
      message: newMessage
    });
    
    setMessages(prev => [...prev, {
      senderId: user?.id,
      message: newMessage,
      timestamp: Date.now(),
      optimistic: true
    }]);

    setNewMessage('');
  };

  if (!group) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <header className="glass-card p-4 rounded-b-3xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={group.image || '/api/placeholder/40/40'} alt={group.name} className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="font-bold leading-tight">{group.name}</h1>
                <p className="text-xs text-muted-foreground">{group.members?.length || 1} members</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 bg-muted/20">
          <div className="glass-card p-4 rounded-xl shadow-lg border border-white/10">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
              <Music className="w-4 h-4" /> Group Playback
            </h3>
            {syncState && syncState.currentTrack ? (
              <div className="flex items-center gap-3">
                <img src={syncState.currentTrack.artwork || '/api/placeholder/50/50'} className="w-12 h-12 rounded object-cover shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{syncState.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{syncState.currentTrack.artist}</p>
                </div>
                <Button size="sm" variant="gradient" onClick={syncMyPlayer}>Listen Along</Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center p-2">Nothing is playing</div>
            )}
            
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Share what you're listening to</span>
              <Button variant="outline" size="sm" onClick={handleBroadcast} disabled={!currentTrack}>
                Broadcast my track
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-hide" ref={scrollRef}>
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'glass-card rounded-tl-none border border-white/5'}`}>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 glass-card rounded-t-3xl border-t border-white/5 fixed bottom-[80px] w-full max-w-md left-1/2 -translate-x-1/2">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Chat with the group..."
              className="rounded-full bg-background/50 border-white/10 h-10 px-4"
            />
            <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10 text-primary-foreground bg-primary hover:bg-primary/90" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
