# Chat Presence Features Implementation Plan (Approved)

## Overview
Implement online/offline status, last seen, typing indicator in Chat using existing SocketContext and backend UserPresence.

## Steps (0/14 ✅)

### Frontend (8 steps)
- [ ] 1. Create `src/hooks/useChatPresence.ts` - Hook for presence/typing (userId, friendId)
- [ ] 2. Create `src/utils/typingHandler.ts` - handleTyping function
- [ ] 3. Update `src/pages/Chat.tsx` - Remove mockConversations, use real API data only
- [ ] 4. Update `src/pages/Chat.tsx` - ChatView header: use useChatPresence, dynamic ChatHeader
- [ ] 5. Update `src/pages/Chat.tsx` - Extract/create ChatInput component with typingHandler
- [ ] 6. Update `src/pages/Chat.tsx` - ChatList: use isOnline/lastSeen from API data
- [ ] 7. Update `src/pages/Chat.tsx` - Integrate typing in input onChange
- [ ] 8. Test frontend integration

### Backend (6 steps)
- [ ] 9. Update `backend/src/server.js` - Add typing/stop_typing handlers
- [ ] 10. Update `backend/src/server.js` - Add presence_update (online users/friends list)
- [ ] 11. Update `backend/src/server.js` - Emit last_seen on connect/offline
- [ ] 12. Update `backend/src/controllers/messageController.js` - getConversations: query UserPresence for isOnline/lastSeen
- [ ] 13. Restart backend server
- [ ] 14. End-to-end test (2 browser tabs/users): online status sync, typing indicator, last seen

**Next:** Start with Frontend hooks (steps 1-2)

**Status:** 🚀 Ready to implement step-by-step

