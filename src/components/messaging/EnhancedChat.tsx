import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image, Mic, Smile, MoreVertical, Phone, Video,
  Check, CheckCheck, ArrowLeft, Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "audio" | "video";
  mediaUrl?: string;
  reactions?: string[];
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastActive?: Date;
  isTyping?: boolean;
}

interface EnhancedChatProps {
  user: ChatUser;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, type: Message["type"]) => void;
  onBack: () => void;
  onCall?: (type: "audio" | "video") => void;
}

const MessageStatus = ({ status }: { status: Message["status"] }) => {
  switch (status) {
    case "sending":
      return <div className="w-3 h-3 rounded-full border-2 border-muted-foreground animate-pulse" />;
    case "sent":
      return <Check className="w-3 h-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="w-3 h-3 text-primary" />;
  }
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-3 bg-muted/50 rounded-2xl rounded-bl-md w-fit">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      className="w-2 h-2 rounded-full bg-muted-foreground"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      className="w-2 h-2 rounded-full bg-muted-foreground"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      className="w-2 h-2 rounded-full bg-muted-foreground"
    />
  </div>
);

const MessageReactions = ({ reactions }: { reactions: string[] }) => (
  <div className="flex -space-x-1 mt-1">
    {reactions.map((emoji, i) => (
      <span key={i} className="text-sm bg-muted/50 rounded-full px-1">
        {emoji}
      </span>
    ))}
  </div>
);

export const EnhancedChat = ({ 
  user, 
  messages, 
  currentUserId, 
  onSendMessage, 
  onBack,
  onCall 
}: EnhancedChatProps) => {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim(), "text");
    setInput("");
  };

  const quickEmojis = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-b-3xl z-10"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">
                {user.isTyping ? (
                  <span className="text-primary">typing...</span>
                ) : user.isOnline ? (
                  "Online"
                ) : (
                  "Last seen recently"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onCall?.("audio")}>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onCall?.("video")}>
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
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar = !isOwn && (
              index === 0 || 
              messages[index - 1].senderId !== message.senderId
            );

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/50 text-foreground rounded-bl-md"
                    }`}
                  >
                    {message.type === "image" && message.mediaUrl ? (
                      <img 
                        src={message.mediaUrl} 
                        alt="Shared" 
                        className="rounded-lg max-w-full"
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isOwn && <MessageStatus status={message.status} />}
                  </div>
                  {message.reactions && message.reactions.length > 0 && (
                    <MessageReactions reactions={message.reactions} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {user.isTyping && (
          <div className="flex items-end gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 flex gap-2 justify-center bg-muted/30"
          >
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInput(input + emoji);
                  setShowEmoji(false);
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 glass-card rounded-t-3xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Image className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="w-full h-11 px-4 rounded-full bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
          {input.trim() ? (
            <Button 
              size="icon" 
              variant="gradient"
              className="shrink-0 rounded-full"
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="shrink-0">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChat;
