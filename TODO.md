# E2EE Chat Implementation TODO

## Backend (4/7 complete)
- [x] Create TODO.md
- [x] 1. Read profileController.js
- [x] 2. Edit backend/src/models/User.js: Add `publicKey: { type: String, default: null }`
- [x] 3. Edit backend/src/controllers/profileController.js: Add GET `/profile/:id/publickey`, PATCH `/profile/publickey` functions
- [x] Add routes in backend/src/routes/profile.js for publicKey APIs
- [ ] 4. Test APIs: Generate keys → POST pubkey → GET pubkey (manual/backend restart)

## Frontend (0/4)
- [ ] 5. Create src/utils/e2e.ts: generateKeys, encryptMessage, decryptMessage
- [ ] 6. Edit src/contexts/AuthContext.tsx: Generate/upload keys post-auth if missing
- [ ] 7. Edit src/pages/Chat.tsx: Load keys, encrypt before send, decrypt on receive, add banner
- [ ] 8. Test end-to-end messaging

## Final
- [ ] 9. Update TODO.md to completed
- [ ] 10. attempt_completion


## Frontend (0/4)
- [ ] 5. Create src/utils/e2e.ts: generateKeys, encryptMessage, decryptMessage
- [ ] 6. Edit src/contexts/AuthContext.tsx: Generate/upload keys post-auth if missing
- [ ] 7. Edit src/pages/Chat.tsx: Load keys, encrypt before send, decrypt on receive, add banner
- [ ] 8. Test end-to-end messaging

## Final
- [ ] 9. Update TODO.md to completed
- [ ] 10. attempt_completion

