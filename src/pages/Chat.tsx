import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, MoreVertical, Phone, Video, Search, Users, Plus, Image, Music, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { CallInterface } from "@/components/CallInterface";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  type?: 'text' | 'snap';
  snapData?: {
    image: string;
    viewed: boolean;
    canReplay: boolean;
  };
}

interface Conversation {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// Mock conversations for demo
const mockConversations: Conversation[] = [
  {
    id: "1",
    username: "Sarah",
    avatar: avatar1,
    lastMessage: "Hey! Did you see the new reel I posted?",
    lastMessageTime: "2m ago",
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: "2",
    username: "Mike",
    avatar: avatar2,
    lastMessage: "That concert was amazing! 🎸",
    lastMessageTime: "15m ago",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "3",
    username: "Alex",
    avatar: avatar3,
    lastMessage: "Let's meet up this weekend",
    lastMessageTime: "1h ago",
    unreadCount: 1,
    isOnline: false,
  },
];

const mockMessages: { [key: string]: Message[] } = {
  "1": [
    { id: "m1", content: "Hey! How are you?", sender_id: "other", created_at: "10:30 AM", is_read: true },
    { id: "m2", content: "I'm good! Just finished a workout", sender_id: "me", created_at: "10:32 AM", is_read: true },
    { id: "m3", content: "Nice! I saw your story", sender_id: "other", created_at: "10:33 AM", is_read: true },
    { id: "m4", content: "Did you see the new reel I posted?", sender_id: "other", created_at: "10:35 AM", is_read: false },
  ],
  "2": [
    { id: "m5", content: "That concert was insane!", sender_id: "other", created_at: "9:00 PM", is_read: true },
    { id: "m6", content: "I know right! Best night ever 🎸", sender_id: "me", created_at: "9:05 PM", is_read: true },
  ],
  "3": [
    { id: "m7", content: "Hey, you free this weekend?", sender_id: "other", created_at: "3:00 PM", is_read: true },
    { id: "m8", content: "Yeah! What's the plan?", sender_id: "me", created_at: "3:15 PM", is_read: true },
    { id: "m9", content: "Let's meet up this weekend", sender_id: "other", created_at: "3:20 PM", is_read: false },
  ],
};

const ChatList = ({ 
  conversations, 
  onSelectChat,
  searchQuery,
  setSearchQuery
}: { 
  conversations: Conversation[]; 
  onSelectChat: (conv: Conversation) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 glass-card rounded-b-3xl p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
      </motion.header>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredConversations.map((conv, index) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectChat(conv)}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={conv.avatar}
                alt={conv.username}
                className="w-14 h-14 rounded-full object-cover"
              />
              {conv.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{conv.username}</span>
                <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {conv.unreadCount > 0 && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">{conv.unreadCount}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ChatView = ({
  conversation,
  onBack,
  messages: initialMessages,
  onStartCall
}: {
  conversation: Conversation;
  onBack: () => void;
  messages: Message[];
  onStartCall: (callType: 'audio' | 'video') => void;
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [viewingSnap, setViewingSnap] = useState<Message | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Mock premium status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const viewSnap = (message: Message) => {
    if (message.type === 'snap' && message.snapData) {
      if (!message.snapData.viewed || message.snapData.canReplay || isPremiumUser) {
        setViewingSnap(message);
        // Mark as viewed
        setMessages(prev => prev.map(msg =>
          msg.id === message.id && msg.snapData
            ? { ...msg, snapData: { ...msg.snapData, viewed: true } }
            : msg
        ));
      } else {
        alert('This snap can only be viewed once. Upgrade to premium to replay snaps!');
      }
    }
  };

  const closeSnapViewer = () => {
    setViewingSnap(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: "me",
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: false,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    
    // Simulate reply after 1 second
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for the message! 😊",
        sender_id: "other",
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_read: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 glass-card rounded-b-3xl p-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{conversation.username}</h2>
            <p className="text-xs text-muted-foreground">
              {conversation.isOnline ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onStartCall('audio')}>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onStartCall('video')}>
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender_id === "me" ? "justify-end" : "justify-start"}`}
            >
              {message.type === 'snap' ? (
                <div
                  onClick={() => viewSnap(message)}
                  className={`max-w-[75%] cursor-pointer ${
                    message.sender_id === "me" ? "rounded-br-sm" : "rounded-bl-sm"
                  }`}
                >
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📸</span>
                    </div>
                    {message.snapData?.viewed && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-sm">Viewed</span>
                      </div>
                    )}
                    {!message.snapData?.viewed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 text-muted-foreground`}>
                    {message.created_at}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.sender_id === "me"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {message.created_at}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-card rounded-t-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon">
            <Image className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Music className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <File className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 h-12 rounded-xl bg-muted/50 border-border/50"
          />
          <Button
            variant="glow"
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-12 w-12 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Snap Viewer */}
      {viewingSnap && viewingSnap.snapData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeSnapViewer}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-md max-h-[80vh]"
          >
            <img
              src={viewingSnap.snapData.image}
              alt="Snap"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                From {conversation.username}
              </span>
              {!isPremiumUser && viewingSnap.snapData.viewed && (
                <span className="text-white text-xs bg-red-500/80 px-2 py-1 rounded">
                  Viewed • Tap to close
                </span>
              )}
            </div>
            {isPremiumUser && viewingSnap.snapData.viewed && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className="text-white text-xs bg-green-500/80 px-2 py-1 rounded">
                  Premium: Can replay
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCall, setCurrentCall] = useState<{ userId: string; callType: 'audio' | 'video'; isIncoming: boolean } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ from: string; callType: 'audio' | 'video'; callerName: string } | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', (data) => {
      setIncomingCall({ from: data.from, callType: data.callType, callerName: 'Caller' }); // TODO: get name
    });

    socket.on('call-accepted', () => {
      if (currentCall) {
        setCurrentCall({ ...currentCall, isIncoming: false });
      }
    });

    socket.on('call-rejected', () => {
      setCurrentCall(null);
      toast.error('Call rejected');
    });

    socket.on('call-ended', () => {
      setCurrentCall(null);
      toast.info('Call ended');
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket, currentCall]);

  const startCall = (callType: 'audio' | 'video') => {
    if (!selectedConversation || !socket) return;
    socket.emit('call-user', { to: selectedConversation.id, from: 'me', callType });
    setCurrentCall({ userId: selectedConversation.id, callType, isIncoming: false });
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setCurrentCall({ userId: incomingCall.from, callType: incomingCall.callType, isIncoming: true });
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    setCurrentCall(null);
  };

  return (
    <Layout hidePlayer>
      <div className="h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {selectedConversation ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="h-full"
            >
              <ChatView
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                messages={mockMessages[selectedConversation.id] || []}
                onStartCall={startCall}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="h-full"
            >
              <ChatList
                conversations={mockConversations}
                onSelectChat={setSelectedConversation}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call Interface */}
      {currentCall && (
        <CallInterface
          remoteUserId={currentCall.userId}
          callType={currentCall.callType}
          onEndCall={handleEndCall}
          onMinimize={() => {}}
          isIncoming={currentCall.isIncoming}
          callerName={selectedConversation?.username || 'Unknown'}
        />
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <CallInterface
          remoteUserId={incomingCall.from}
          callType={incomingCall.callType}
          onEndCall={handleRejectCall}
          onMinimize={() => {}}
          isIncoming={true}
          callerName={incomingCall.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </Layout>
  );
};

export default Chat;
