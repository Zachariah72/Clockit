mport { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceData {
  isOnline: boolean;
  lastSeen: string | null;
  typing: boolean;
}

export function useChatPresence(friendId: string) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const userId = user?.id;

  const [presence, setPresence] = useState<PresenceData>({
    isOnline: false,
    lastSeen: null,
    typing: false,
  });

  useEffect(() => {
    if (!socket || !userId || !friendId) return;

    // Emit user_online on mount (handled by SocketContext connect)
    // Listen for friend's status changes
    socket.on("user_online", (data: { userId: string }) => {
      if (data.userId === friendId) {
        setPresence(prev => ({ ...prev, isOnline: true }));
      }
    });

    socket.on("user_offline", (data: { userId: string }) => {
      if (data.userId === friendId) {
        setPresence(prev => ({ ...prev, isOnline: false }));
      }
    });

    socket.on("last_seen", (data: { userId: string; time: string }) => {
      if (data.userId === friendId) {
        setPresence(prev => ({ ...prev, lastSeen: data.time }));
      }
    });

    socket.on("typing", (data: { from: string }) => {
      if (data.from === friendId) {
        setPresence(prev => ({ ...prev, typing: true }));
      }
    });

    socket.on("stop_typing", (data: { from: string }) => {
      if (data.from === friendId) {
        setPresence(prev => ({ ...prev, typing: false }));
      }
    });

    // Initial presence (optional: emit get_presence)
    socket.emit("get_presence", { userId: friendId });

    return () => {
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("last_seen");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket, userId, friendId]);

  return presence;
}

