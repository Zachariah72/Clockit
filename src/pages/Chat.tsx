import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, ArrowLeft, MoreVertical, Phone, PhoneOff, Video, Search, Users, 
  Plus, Image, Music, File, X, Clock, PhoneCall, PhoneMissed, PhoneIncoming, 
  PhoneOutgoing, ArrowUpRight, ArrowDownLeft, Smile, Check, CheckCheck, 
  CircleDashed, ImagePlus, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { CallInterface } from "@/components/CallInterface";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import callingSound from "@/assets/phone-ringing-382734.mp3";

// Helper function to format message dates
const formatMessageDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString || dateString === '') return '';
  
  // Handle Date objects
  let dateStr = typeof dateString === 'object' ? (dateString as Date).toISOString() : dateString;
  dateStr = dateStr.trim();
  
  // If it looks like a time string (e.g., "10:30 AM"), return it as-is
  if (/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i.test(dateStr)) {
    return dateStr;
  }
  
  // If it already says "Invalid Date", return empty
  if (dateStr === 'Invalid Date') {
    return '';
  }
  
  try {
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If parsing failed, return empty
      console.warn('Invalid date:', dateStr);
      return '';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // For messages from today, show time
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // For messages from yesterday
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    
    // For messages from this week, show day name
    if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // For older messages, show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper function to get avatar with placeholder
const getAvatarWithPlaceholder = (avatarUrl: string | null | undefined, size: number = 40): string => {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  return `/api/placeholder/${size}/${size}`;
};

// Default avatar for new chat search
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

// Helper function to get message status icon
const getMessageStatus = (isOutgoing: boolean, isRead: boolean) => {
  if (!isOutgoing) return null;
  
  if (isRead) {
    return <CheckCheck className="w-3 h-3 text-primary-foreground/70" />;
  }
  return <Check className="w-3 h-3 text-primary-foreground/70" />;
};

// Helper function to format last seen
const formatLastSeen = (lastSeen: string | null | undefined): string => {
  if (!lastSeen) return "Offline";
  
  try {
    const date = new Date(lastSeen);
    if (isNaN(date.getTime())) return "Offline";
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "Offline";
  }
};

interface Message {
  _id?: string;
  id?: string;
  content: string;
  senderId: {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | string;
  sender_id?: {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | string;
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
  otherUserId: string;
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
    otherUserId: "user123",
    username: "Sarah",
    avatar: avatar1,
    lastMessage: "Hey! Did you see the new reel I posted?",
    lastMessageTime: "2m ago",
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: "2",
    otherUserId: "user456",
    username: "Mike",
    avatar: avatar2,
    lastMessage: "That concert was amazing! 🎸",
    lastMessageTime: "15m ago",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "3",
    otherUserId: "user789",
    username: "Alex",
    avatar: avatar3,
    lastMessage: "Let's meet up this weekend",
    lastMessageTime: "1h ago",
    unreadCount: 1,
    isOnline: false,
  },
];

const mockMessages: { [key: string]: Omit<Message, '_id'>[] } = {
  "1": [
    { id: "m1", content: "Hey! How are you?", senderId: "other", created_at: "10:30 AM", is_read: true },
    { id: "m2", content: "I'm good! Just finished a workout", senderId: "me", created_at: "10:32 AM", is_read: true },
    { id: "m3", content: "Nice! I saw your story", senderId: "other", created_at: "10:33 AM", is_read: true },
    { id: "m4", content: "Did you see the new reel I posted?", senderId: "other", created_at: "10:35 AM", is_read: false },
  ],
  "2": [
    { id: "m5", content: "That concert was insane!", senderId: "other", created_at: "9:00 PM", is_read: true },
    { id: "m6", content: "I know right! Best night ever 🎸", senderId: "me", created_at: "9:05 PM", is_read: true },
  ],
  "3": [
    { id: "m7", content: "Hey, you free this weekend?", senderId: "other", created_at: "3:00 PM", is_read: true },
    { id: "m8", content: "Yeah! What's the plan?", senderId: "me", created_at: "3:15 PM", is_read: true },
    { id: "m9", content: "Let's meet up this weekend", senderId: "other", created_at: "3:20 PM", is_read: false },
  ],
};

const ChatList = ({
  conversations,
  onSelectChat,
  searchQuery,
  setSearchQuery,
  isLoading,
  onStartNewChat
}: {
  conversations: Conversation[];
  onSelectChat: (conv: Conversation) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onStartNewChat: (userId: string, username: string) => void;
}) => {
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/messages/users/suggestions?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery]);
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
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>Search for users to start a new conversation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => {
                            onStartNewChat(user._id, user.username);
                            setShowNewChat(false);
                            setUserSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <img
                            src={user.avatar_url || DEFAULT_AVATAR}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-muted"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                            }}
                          />
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.display_name}</p>
                          </div>
                        </div>
                      ))
                    ) : userSearchQuery ? (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Start typing to search users</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2 text-foreground">No conversations yet</h4>
            <p className="text-muted-foreground text-sm">
              Start chatting with friends and followers!
            </p>
          </div>
        ) : (
          filteredConversations.map((conv, index) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectChat(conv)}
            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
              conv.unreadCount > 0 
                ? 'bg-primary/5 hover:bg-primary/10' 
                : 'hover:bg-muted/50'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={getAvatarWithPlaceholder(conv.avatar, 56)}
                alt={conv.username}
                className={`w-14 h-14 rounded-full object-cover ring-2 ${
                  conv.unreadCount > 0 
                    ? 'ring-primary/30' 
                    : 'ring-muted'
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.username}`;
                }}
              />
              {conv.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground'}`}>
                  {conv.username}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${conv.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessageTime}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`flex-1 truncate text-sm ${
                  conv.unreadCount > 0 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                }`}>
                  {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const ChatView = ({
  conversation,
  onBack,
  onStartCall
}: {
  conversation: Conversation;
  onBack: () => void;
  onStartCall: (callType: 'audio' | 'video') => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [viewingSnap, setViewingSnap] = useState<Message | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Mock premium status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  // Helper to check if message is from current user
  const isOutgoing = (message: Message) => {
    const senderId = (message as any).senderId || message.sender_id;
    if (typeof senderId === 'object' && senderId !== null) {
      return senderId._id === user?.id;
    }
    return senderId === user?.id;
  };

  // Fetch messages for the conversation
  const fetchMessages = async () => {
    if (!conversation?.id) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoadingMessages(false);
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/messages/conversations/${conversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize date fields - handle both createdAt (from MongoDB) and created_at
        const normalizedMessages = data.map((msg: any) => ({
          ...msg,
          created_at: msg.created_at || msg.createdAt || new Date().toISOString()
        }));
        setMessages(normalizedMessages);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Join conversation room for real-time messages
    if (socket && conversation?.id) {
      socket.emit('join_conversation', conversation.id);

      socket.on('new_message', (data) => {
        if (data.conversationId === conversation.id) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      return () => {
        socket.emit('leave_conversation', conversation.id);
        socket.off('new_message');
      };
    }
  }, [conversation?.id, socket]);

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

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation?.id || !socket) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error("Please log in to send messages");
      return;
    }

    try {
      // Send message via Socket.IO for real-time delivery
      socket.emit('send_message', {
        conversationId: conversation.id,
        content: newMessage.trim(),
        type: 'text'
      });

      // Also send via API to ensure persistence
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/messages/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(); // Refetch messages to show the sent message
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
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
              src={getAvatarWithPlaceholder(conversation.avatar, 40)}
              alt={conversation.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background ring-muted"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
              }}
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{conversation.username}</h2>
            <p className={`text-xs flex items-center gap-1 ${
              conversation.isOnline 
                ? "text-green-500" 
                : "text-muted-foreground"
            }`}>
              {conversation.isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online
                </>
              ) : (
                <>
                  <CircleDashed className="w-3 h-3" />
                  Last seen {formatLastSeen(null)}
                </>
              )}
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
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">No messages yet</h4>
              <p className="text-muted-foreground text-sm">
                Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message._id || message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${isOutgoing(message) ? "justify-end" : "justify-start"}`}
              >
              {message.type === 'snap' ? (
                <div
                  onClick={() => viewSnap(message)}
                  className={`max-w-[75%] cursor-pointer ${
                    isOutgoing(message) ? "rounded-br-sm" : "rounded-bl-sm"
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
                      {formatMessageDate(message.created_at)}
                    </p>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                    isOutgoing(message)
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-sm"
                      : "bg-muted/80 text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    isOutgoing(message) ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                  }`}>
                    <span className="text-xs">
                      {formatMessageDate(message.created_at)}
                    </span>
                    {getMessageStatus(isOutgoing(message), message.is_read)}
                  </div>
                </div>
              )}
            </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-card rounded-t-3xl">
        {/* Attachment buttons */}
        <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-hide">
          <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full hover:bg-muted">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full hover:bg-muted">
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full hover:bg-muted">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Message input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="pr-12 h-12 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {newMessage.trim() && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {newMessage.length}
              </div>
            )}
          </div>
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`h-12 w-12 rounded-2xl transition-all duration-200 ${
              newMessage.trim()
                ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
                : 'bg-muted'
            }`}
            size="icon"
          >
            <Send className={`w-5 h-5 ${newMessage.trim() ? 'animate-pulse' : ''}`} />
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

const CallHistoryView = ({
  callHistory,
  isLoading,
  onStartCall
}: {
  callHistory: any[];
  isLoading: boolean;
  onStartCall: (userId: string, callType: 'audio' | 'video') => void;
}) => {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Missed';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCallIcon = (status: string, direction: string) => {
    const isSuccessful = status === 'completed';
    const colorClass = isSuccessful ? 'text-green-500' : 'text-red-500';

    if (direction === 'outgoing') {
      return <ArrowUpRight className={`w-4 h-4 ${colorClass}`} />;
    } else {
      return <ArrowDownLeft className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  const getCallDirection = (caller: string, receiver: string, currentUserId: string) => {
    return caller === currentUserId ? 'outgoing' : 'incoming';
  };

  const getCallStatusText = (status: string, direction: string) => {
    switch (status) {
      case 'completed':
        return direction === 'outgoing' ? 'Dialed' : 'Received';
      case 'missed':
        return 'Missed';
      case 'rejected':
        return direction === 'outgoing' ? 'Cancelled' : 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 glass-card rounded-b-3xl p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Call History</h1>
        </div>
      </motion.header>

      {/* Call History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : callHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2 text-foreground">No call history yet</h4>
            <p className="text-muted-foreground text-sm">
              Your call history will appear here
            </p>
          </div>
        ) : (
          callHistory.map((call, index) => {
            const direction = getCallDirection(call.caller, call.receiver, user?.id || '');
            const otherUserId = direction === 'outgoing' ? call.receiver : call.caller;
            const otherUserName = 'User'; // TODO: Get actual user name
            const statusText = getCallStatusText(call.status, direction);

            return (
              <motion.div
                key={call._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onStartCall(otherUserId, call.callType)}
              >
                {/* Call Icon */}
                <div className="relative">
                  <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                    {call.callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border">
                    {getCallIcon(call.status, direction)}
                  </div>
                </div>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{otherUserName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(call.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {statusText} {call.callType} call
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {formatDuration(call.duration)}
                    </span>
                  </div>
                </div>

                {/* Call Again Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCall(otherUserId, call.callType);
                  }}
                  className="rounded-full p-2"
                >
                  {call.callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [currentCall, setCurrentCall] = useState<{ userId: string; callType: 'audio' | 'video'; isIncoming: boolean; callId?: string } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ from: string; callType: 'audio' | 'video'; callerName: string; callId: string } | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callingUserName, setCallingUserName] = useState("");
  const [callingCallType, setCallingCallType] = useState<'audio' | 'video'>('audio');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingCallHistory, setIsLoadingCallHistory] = useState(true);
  const callingAudioRef = useRef<HTMLAudioElement>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch conversations from API
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoadingConversations(false);
        return;
      }

      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error("Please log in to view messages");
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Fetch call history from API
  const fetchCallHistory = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoadingCallHistory(false);
        return;
      }

      const response = await fetch('/api/calls/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCallHistory(data.history || []);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error("Please log in to view call history");
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setIsLoadingCallHistory(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchCallHistory();
  }, [user]);

  useEffect(() => {
    if (!socket) {
      console.log('Socket not available in Chat');
      return;
    }

    console.log('Socket connected in Chat, setting up listeners');

    socket.on('incoming-call', (data) => {
      console.log('Received incoming-call event:', data);
      setIncomingCall({ from: data.from, callType: data.callType, callerName: 'Caller', callId: data.callId });
    });

    socket.on('call-initiated', (data) => {
      console.log('Call initiated:', data);
      setIsCalling(true);
    });

    socket.on('call-accepted', () => {
      console.log('Call accepted event received');
      if (callingAudioRef.current) {
        callingAudioRef.current.pause();
        callingAudioRef.current.currentTime = 0;
      }
      setIsCalling(false);
      if (currentCall) {
        setCurrentCall({ ...currentCall, isIncoming: false });
      }
    });

    socket.on('call-rejected', () => {
      console.log('Call rejected event received');
      if (callingAudioRef.current) {
        callingAudioRef.current.pause();
        callingAudioRef.current.currentTime = 0;
      }
      setIsCalling(false);
      toast.error('Call was rejected');
    });

    socket.on('call-ended', () => {
      console.log('Call ended event received');
      if (callingAudioRef.current) {
        callingAudioRef.current.pause();
        callingAudioRef.current.currentTime = 0;
      }
      setIsCalling(false);
      setCurrentCall(null);
      toast.info('Call ended');
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-initiated');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket, currentCall]);

  const startCall = (callType: 'audio' | 'video') => {
    if (!selectedConversation || !socket || !user) return;
    socket.emit('call-user', { to: selectedConversation.otherUserId, from: user.id, callType });
    setCallingUserName(selectedConversation.username);
    setCallingCallType(callType);
    setIsCalling(true);
    
    // Play calling sound
    if (callingAudioRef.current) {
      callingAudioRef.current.loop = true;
      callingAudioRef.current.play().catch(console.error);
    }
    
    setCurrentCall({ userId: selectedConversation.otherUserId, callType, isIncoming: false });
  };

  const cancelCall = () => {
    setIsCalling(false);
    if (callingAudioRef.current) {
      callingAudioRef.current.pause();
      callingAudioRef.current.currentTime = 0;
    }
    setCurrentCall(null);
  };

  const handleAcceptCall = () => {
    // Stop calling sound if we were calling
    if (callingAudioRef.current) {
      callingAudioRef.current.pause();
      callingAudioRef.current.currentTime = 0;
    }
    setIsCalling(false);
    
    if (incomingCall) {
      // Emit accept-call event to server
      if (socket) {
        socket.emit('accept-call', { 
          callId: incomingCall.callId, 
          from: user?.id 
        });
      }
      setCurrentCall({ userId: incomingCall.from, callType: incomingCall.callType, isIncoming: true });
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    // Emit reject-call event to server
    if (socket && incomingCall) {
      socket.emit('reject-call', { 
        callId: incomingCall.callId, 
        from: user?.id 
      });
    }
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    setCurrentCall(null);
  };

  const handleStartNewChat = async (userId: string, username: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please log in to start conversations");
        return;
      }

      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: userId,
          initialMessage: `Hi ${username}! 👋`
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        // Refresh conversations to show the new one
        fetchConversations();
        toast.success(`Started conversation with ${username}`);
      } else if (response.status === 403) {
        toast.error("Cannot start conversation with this user");
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Failed to start conversation");
    }
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
              <Tabs defaultValue="messages" className="h-full flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="calls">Call History</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="messages" className="flex-1 mt-0">
                  <ChatList
                    conversations={conversations}
                    onSelectChat={setSelectedConversation}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={isLoadingConversations}
                    onStartNewChat={handleStartNewChat}
                  />
                </TabsContent>

                <TabsContent value="calls" className="flex-1 mt-0">
                  <CallHistoryView
                    callHistory={callHistory}
                    isLoading={isLoadingCallHistory}
                    onStartCall={(userId, callType) => {
                      if (socket && user) {
                        socket.emit('call-user', { to: userId, from: user.id, callType });
                        setCallingUserName('User');
                        setCallingCallType(callType);
                        setIsCalling(true);
                        
                        // Play calling sound
                        if (callingAudioRef.current) {
                          callingAudioRef.current.loop = true;
                          callingAudioRef.current.play().catch(console.error);
                        }
                        
                        setCurrentCall({ userId, callType, isIncoming: false });
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calling UI */}
      {isCalling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              {callingCallType === 'video' ? (
                <Video className="w-10 h-10 text-gray-400" />
              ) : (
                <Phone className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Calling {callingUserName}...</h2>
            <p className="text-muted-foreground text-sm mb-6">Waiting for answer</p>
            <Button variant="destructive" onClick={cancelCall} className="w-full">
              <PhoneOff className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Call Interface */}
      {currentCall && (
        <CallInterface
          remoteUserId={currentCall.userId}
          callType={currentCall.callType}
          callId={currentCall.isIncoming ? currentCall.callId : undefined}
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
          callId={incomingCall.callId}
          onEndCall={handleRejectCall}
          onMinimize={() => {}}
          isIncoming={true}
          callerName={incomingCall.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Hidden audio element for calling sound */}
      <audio ref={callingAudioRef} src={callingSound} preload="auto" />
    </Layout>
  );
};

export default Chat;
