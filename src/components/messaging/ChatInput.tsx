import React from "react";
import { Send, Smile, ImagePlus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleTyping } from "@/utils/typingHandler";

interface ChatInputProps {
  socket: any;
  friendId: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}


export default function ChatInput({ 
  socket,
  friendId, 
  value, 
  onChange, 
  onSend, 
  placeholder = "Message..." 
}: ChatInputProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Trigger typing indicator if typing
    if (newValue.trim().length > 0) {
      handleTyping(socket, friendId);
    }
  };

  return (
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
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            className="pr-12 h-12 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {value.trim() && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {value.length}
            </div>
          )}
        </div>
        
        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!value.trim()}
          className={`h-12 w-12 rounded-2xl transition-all duration-200 ${
            value.trim()
              ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
              : 'bg-muted'
          }`}
          size="icon"
        >
          <Send className={`w-5 h-5 ${value.trim() ? 'rotate-45 animate-pulse' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

