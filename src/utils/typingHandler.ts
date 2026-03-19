let typingTimeout: NodeJS.Timeout;

export const handleTyping = (socket: any, friendId: string) => {
  if (!socket) return;

  // Emit typing immediately
  socket.emit("typing", { to: friendId });

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Set timeout to emit stop_typing
  typingTimeout = setTimeout(() => {
    socket.emit("stop_typing", { to: friendId });
  }, 1500);
};

export const stopTyping = (socket: any, friendId: string) => {
  if (socket) {
    socket.emit("stop_typing", { to: friendId });
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }
};

