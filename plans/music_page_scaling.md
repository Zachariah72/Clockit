# 🎵 Music Page Scaling Implementation Plan (Frontend to Backend)

This document outlines the step-by-step implementation plan to take the Clockit Music Page from its current state to a robust, scalable system capable of handling 10,000+ creators. The focus is on performance, reliability, and mobile-first architecture.

---

## 📱 Phase 1: Frontend State & Persistence
*Goal: Ensure the UI remains responsive and data persists across sessions without hammering the backend on every interaction.*

### 1.1 `MediaPlayerContext` Enhancements
- [ ] **Global State:** Implement logic for `likedTrackIds` and `recentlyPlayed` directly in the context.
- [ ] **Local Caching:** Sync `likedTrackIds` and `recentlyPlayed` with `localStorage` (or `AsyncStorage`/IndexedDB for larger capacities).
- [ ] **Optimistic Updates:** When a user likes a song, immediately update the local state before the API call finishes. Revert on failure.

### 1.2 Resource Management & Performance
- [ ] **Memory Leaks:** Explicitly destroy and garbage-collect HTML5 audio components when switching tracks.
- [ ] **Component Memoization:** Heavily utilize `React.memo` and `useMemo` on `SongCard`, `PlaylistCard`, and the `FullPlayer` to prevent unnecessary re-renders when the global time updates every second.
- [ ] **Virtualization:** Implement virtualized lists (e.g., `react-window` or `react-virtuoso`) for the "All Songs" and search result lists to render only the visible items on mobile.

---

## ⚙️ Phase 2: Backend Orchestration & Caching
*Goal: Protect external APIs from rate limits and proxy audio streams securely.*

### 2.1 API Proxies & Aggregation
- [ ] **Spotify Controller (`spotifyController.js`):** Implement robust token refreshing for Server-to-Server and User OAuth flows. Ensure the `client_credentials` token is cached in memory.
- [ ] **Last.fm Controller (`lastfmController.js`):** Standardize the response format mapping to match the Clockit `Track` interface exactly so the frontend doesn't have to parse different shapes.
- [ ] **Streaming Proxy (`soundcloudController.js`):** Optimize the stream proxy route (`/api/soundcloud/stream/:id`) handling HTTP Range requests correctly for seeking (essential for the frontend progress bar).

### 2.2 Redis Caching Strategy (Critical for 10k+ Users)
- [ ] **Global Charts Cache:** Cache standard "Trending/Top" results from external APIs (Last.fm, Deezer) in Redis for 1 to 4 hours. Thousands of users will hit the "Discover" tab; doing an external API call every time will result in rate-limiting/banning.
- [ ] **Search Cache:** Cache frequent global search queries (e.g., "Afrobeat", "Drake") for 15-30 minutes.

---

## 🗄️ Phase 3: Database & Logic (MongoDB)
*Goal: Store user-generated content and preferences with fast read access.*

### 3.1 Schema Design
- [ ] **`UserTrack` Collection:** Index heavily on `userId` and `uploadedAt`.
- [ ] **`Playlist` Collection:** Create structured schema for custom playlists (`ownerId`, `collaborators`, `tracks[]`).
- [ ] **`UserLikes` Collection:** Instead of giant arrays on the User model, keep a separate indexed collection for Likes mapping `userId` -> `trackId` for O(1) lookups on the backend.

### 3.2 File Handling (Uploads)
- [ ] **Storage Bucket:** Ensure user-uploaded music uses a robust storage backend (like S3 or Cloudinary audio). Currently, `multer` writes to local disk; this needs to be moved to a cloud provider to survive horizontal scaling (multiple instances of the Node.js server).
- [ ] **Validation:** Harden the `multer` config (Limit filesize strict 50mb, validate MIME types against spoofing).

---

## 🧪 Phase 4: Launch & Verification Checklist
*Goal: Ensure the system is production-ready.*

- [ ] **Build Check:** Frontend transpiles successfully (`npm run build`). No typescript errors left in discovery files.
- [ ] **Environment Variables:** Confirm all variables listed in `backend_credentials_checklist.md` are safely loaded in the production environment.
- [ ] **Load Testing:** Simulate 500 concurrent connections hitting the search endpoint to ensure Redis caching holds up.
- [ ] **Mobile Parity:** Test the floating mini-player and bottom-sheet overlays on actual iOS Safari and Chrome Android for touch responses and CSS snapping.
- [ ] **Audio Resumption:** Ensure audio pauses correctly when a phone call arrives or another media app takes focus (relying on `useMediaSession` hook).
