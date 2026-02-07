import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      // Assuming backend accepts Supabase token or we have JWT
      // For now, use session.access_token as token
      const apiUrl = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
      console.log('Connecting to Socket.IO:', apiUrl);
      
      const newSocket = io(apiUrl, {
        query: {
          userId: session.user.id, // Assuming user.id is the ID
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected');
        setIsConnected(true);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};