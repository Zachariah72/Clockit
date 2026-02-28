# Clockit PWA – Comprehensive UI Audit

> **Branch:** `music-page-restracture`  
> **Audit Date:** 2025  
> **Auditor:** kelvin 
> **Note:** This is a read-only audit — no code was modified.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| **Build Tool** | Vite 5 |
| **UI Framework** | React 18 + TypeScript 5 |
| **Styling** | Tailwind CSS 3 + Custom CSS Tokens |
| **Component Library** | Shadcn UI (Radix UI primitives) |
| **Animations** | Framer Motion 12 |
| **Routing** | React Router DOM v6 |
| **State / Data Fetching** | React Context API + TanStack React Query |
| **Real-time** | Socket.IO Client v4 |
| **Auth / DB** | Supabase (PostgreSQL + Auth + Storage) |
| **Secondary Backend** | Node.js + Express (hosted on Render: `clockit-gvm2.onrender.com`) |
| **Secondary DB (Backend)** | MongoDB via Mongoose |
| **PWA** | `vite-plugin-pwa` |
| **Media** | HTML5 Audio API + Web Bluetooth API + Spotify Web Playback SDK |
| **Icons** | Lucide React |

---

## 2. Project Structure Overview

```
Clockit/
├── src/
│   ├── App.tsx                    # Root – wraps all providers + router
│   ├── pages/                     # 22 route-level page components
│   ├── components/                # 84 reusable UI components
│   ├── contexts/                  # 4 global context providers
│   ├── hooks/                     # 8 custom hooks
│   ├── services/                  # 3 API service files
│   ├── utils/                     # api.ts (URL helper)
│   └── integrations/supabase/     # Supabase client setup
├── backend/
│   └── src/
│       ├── server.js              # Express server entry
│       ├── controllers/           # 19 controller files
│       ├── models/                # 42 Mongoose models
│       ├── routes/                # 27 route files
│       ├── middlewares/           # Auth middleware
│       └── utils/                 # Helpers
├── supabase/
│   └── migrations/                # 2 SQL migrations
└── public/ + assets/
```

---

## 3. Global App Architecture

### 3.1 Provider Stack (`App.tsx`)

```
QueryClientProvider           ← TanStack Query
  BrowserRouter               ← React Router
    ThemeProvider             ← Dark/light mode
      AuthProvider            ← User session
        SocketProvider        ← Real-time WS
          MediaPlayerProvider ← Global audio player
            MediaNotification / PWAInstallPrompt / OfflineIndicator
            TooltipProvider
              AppRouter       ← Route definitions
```

### 3.2 Routing System (`AppRouter.tsx`)

**Routing Logic:**
- On load, checks `localStorage.onboardingCompleted` and `user` state.
- New user (no flag) → `/onboarding` → `/auth`.
- Returning logged-out user → `/auth`.
- Logged-in user on `/auth` or `/onboarding` → redirect to `/`.

**Route Map:**

| Path | Page | Auth Required |
|---|---|---|
| `/onboarding` | Onboarding | No |
| `/auth` | Auth | No |
| `/auth/callback` | AuthCallback | No |
| `/auth/spotify/callback` | SpotifyCallback | No |
| `/` | Index (Home) | Yes |
| `/music` | Music | Yes |
| `/reels` | Reels | Yes |
| `/stories` | Stories | Yes |
| `/chat` | Chat | Yes |
| `/snap` | Snap | Yes |
| `/live` | Live | Yes |
| `/groups` | Groups | Yes |
| `/search` | Search | Yes |
| `/profile` | Profile (own) | Yes |
| `/profile/:id` | Profile (user) | Yes |
| `/settings` | Settings | Yes |
| `/settings/:section` | Settings Sub-section | Yes |
| `/downloaded-music` | DownloadedMusic | Yes |
| `/offline-reels` | OfflineReels | Yes |
| `/podcasts` | Podcasts | Yes |
| `/appearance` | Appearance | Yes |
| `/live-feed` | LiveFeed | Yes |
| `*` | NotFound (404) | No |

---

## 4. Page-by-Page Feature Audit

### 4.1 Onboarding (`/onboarding`)

**Purpose:** Splash screen for first-time app launch.  
**Features:**
- Full-screen animated hero with background image and gradient overlay (purple/blue/indigo).
- "Clockit" branding + tagline.
- Auto-redirects to `/auth` after 6 seconds.
- "Get Started" button for immediate navigation.
- Sets `localStorage.onboardingCompleted = true` on proceed.

**UI Stack:** Static layout, no Framer Motion, gradient overlay via Tailwind classes.

---

### 4.2 Authentication (`/auth`)

**Purpose:** User login and registration.  
**Features:**
- Email/Password sign-in and sign-up.
- OAuth via Google, Apple, Facebook.
- Optional avatar upload on register (uploads to Supabase `avatars` storage bucket).
- "Remember Me" toggle.
- Supabase-first auth, with dual-write to MongoDB backend (`/auth/register`, `/auth/login`).
- Stores JWT from backend in `localStorage.auth_token`.

**Design:** Split-pane or modal layout. Uses Shadcn `Input`, `Button`, `Dialog`.

---

### 4.3 Home / Index (`/`)

**Purpose:** Main discovery feed and app hub.  
**Sections:**
1. **Header** – Clockit logo, navigation icons (Search, Notifications), floating action button.
2. **Stories Row** – Horizontal scrollable story bubbles; click to open `StoryViewer`, "+" to open `StoryCreator`.
3. **Hero Banner** – Featured content card with gradient backdrop.
4. **Featured Playlists** – Horizontal scrollable `FeaturedPlaylist` cards.
5. **Recent Plays** – Vertical list of `SongCard` items with play state.

**Modals:** `StoryViewer`, `StoryCreator`, Search `Dialog`.  
**Data:** Mock-data playlists + songs; stories fetched via API.  
**Animations:** Framer Motion entrance animations (opacity + y-axis) staggered per section.

---

### 4.4 Music (`/music`)

**Purpose:** Full music player and discovery interface.  
**Sections / Tabs:**
| Tab | Description |
|---|---|
| **All Songs** | Filtered song list by mood/genre |
| **Search** | `MusicSearch` component — live search |
| **Discover** | `MusicDiscovery` — algorithmic recommendations |
| **Playlists** | User and curated playlists |
| **Liked** | User-liked songs |

**Filters:**
- **Mood Selector** – Chips: Happy, Sad, Energetic, Calm, Focus, Party.
- **Genre Tabs** – All, Pop, Rock, Hip-Hop, Electronic, Classical, etc.

**Playback:**
- Clicking a song calls `playTrack()` from `MediaPlayerContext`.
- `MediaControls` component is fixed at the bottom.
- Supports `PlaylistView` inline view when a playlist is selected.

**Data Source:** External API via `getApiUrl()` → SoundCloud/music endpoints.  
**Navigation State:** Accepts `state.searchQuery`, `state.artist`, `state.playlist` from React Router for cross-page navigation.

---

### 4.5 Chat (`/chat`)

**Purpose:** Direct messaging between users.  
**Features:**
- **Conversation List** – All DMs with avatar, name, last message, timestamp, unread badge.
- **User Search** – Search bar to find users and start a new conversation.
- **Chat View** – Message bubbles, scroll to bottom, read receipts.
- **Real-time** – Socket.IO events: `join_conversation`, `leave_conversation`, `send_message`, `new_message`.
- **Message Persistence** – Sends via Socket.IO AND makes REST API call for database persistence.
- **Snaps** – Snap (ephemeral image) viewer support within conversation.
- **Call Buttons** – Voice/video call initiation (UI present, integration status unclear).

**Design:** Full-screen mobile layout; `glass-card` header, bubble-style messages.

---

### 4.6 Reels (`/reels`)

**Purpose:** TikTok-style vertical short-video feed.  
**Features:**
- **Vertical Swipe Navigation** – Framer Motion drag gesture with velocity-based snap to next/prev reel.
- **Video Playback** – HTML5 `<video>` with autoplay on `isActive`.
- **Double-Tap to Like** – Heart animation burst on screen center.
- **Actions Sidebar** – Like, Comment, Share, Save, Audio.
- **Upload Reel** – Camera/gallery recording, upload to Supabase `reels-videos` bucket.
- **Offline Reels** – Separate `/offline-reels` page for cached content.
- **Mock Data + API** – Falls back to mock reels if fetch fails.

**API Endpoint:** `GET /api/reels` (paginated), `POST /api/reels` (upload).

---

### 4.7 Stories (`/stories`)

**Purpose:** 24-hour ephemeral photo/video content.  
**Features:**
- **Friends' Stories** – Grid/row of friend avatars; click to open `StoryViewer`.
- **My Story** – "+" to open `StoryCreator` (camera or gallery).
- **Filters** – Visual filters applied to camera capture.
- **Snap History** – Recent snaps grid from `localStorage.snapHistory`.
- **Story Viewer** – Full-screen overlay with progress bar, swipe to next.

**Data:** Stories fetched from API via `GET /stories`.  
**Note:** `mediaUrl` currently sent as raw base64 data URL — file upload storage is not yet fully implemented.

---

### 4.8 Profile (`/profile`, `/profile/:id`)

**Purpose:** User profile page — own or others'.  
**Sections / Tabs:**
| Tab | Content |
|---|---|
| **Posts** | Grid of user posts |
| **Stories** | Story thumbnails |
| **Saved** | Saved content (reels, songs, posts) |
| **Drafts** | Unpublished draft content |
| **Insights** | Analytics (views, reach, impressions) |
| **Playlists** | User-created playlists |

**Features:**
- Stats bar: Followers / Following / Streak count / Stories count.
- Edit modal (avatar upload, username, display name, bio, link).
- Follow/Unfollow button on other users' profiles.
- Share Music button with recipient picker.
- Verified badge indicator.

**Data:** `profileApi.getProfile()`, `profileApi.getReels()`, `profileApi.getSavedContent()`, `profileApi.getDrafts()`.

---

### 4.9 Live (`/live`)

**Purpose:** Live streaming — broadcast and viewer experience.  
**Features:**
- **Discover Streams** – List of active live sessions.
- **Go Live** – Enter title, start broadcast via Socket.IO.
- **Join Stream** – Enter as viewer, see live video + chat overlay.
- **Chat Overlay** – Real-time chat during stream via Socket.IO events.
- **Broadcaster Controls** – Mute, camera toggle, end stream.

**Tech:** Socket.IO for signaling; WebRTC implied for video transport (not fully visible in code).

---

### 4.10 Groups (`/groups`)

**Purpose:** Music listening communities.  
**Features:**
- **Your Groups** – List of joined groups with member count, privacy (public/private), activity indicator.
- **Discover Groups** – 2-column grid of suggested groups with join button.
- **Create Group** – Dialog with name, description, private toggle.
- **Group Actions** – Open group chat, open group playlist.

**API Endpoints:** `GET /listening-groups`, `GET /listening-groups/discover`, `POST /listening-groups`, `POST /listening-groups/:id/join`.

---

### 4.11 Search (`/search`)

**Purpose:** Global search across music, users, reels, hashtags.  
**Features:**
- Debounced search (300ms) via `profileApi.search()`.
- **Recent Searches** – Stored in component state; removable with X.
- **Popular Searches** – Static tag chips (Pop Music, Rock Bands, etc.).
- **Result Types:** Songs, Artists, Playlists, Users (with follow/unfollow), Hashtags, Reels.
- **Navigation on Click:** Routes to appropriate page with context state (e.g., `/music` with `searchQuery`, `/reels` with `reelId`).
- Follow toggle calls `profileApi.toggleFollow()`.

**API:** `GET /search?q=...&type=...&limit=...`

---

### 4.12 Snap (`/snap`)

**Purpose:** Capture and share ephemeral photo moments.  
**Features:**
- **Camera View** – Uses `<Camera>` component for live preview + capture.
- **Snap Preview** – After capture: image preview, caption input (max 100 chars), retake option.
- **Actions** – Download, Web Share API, Send to Story.
- **Snap History** – Grid of up to 6 recent snaps stored in `localStorage.snapHistory`.
- **Stories Feed** – Shows recent stories from API with view/like/comment counts.

**API:** `POST /api/stories` to publish snap as story.

---

### 4.13 Settings (`/settings`)

**Purpose:** App configuration hub.  
**Sections (navigates to `/settings/:sectionId`):**

| Section | Description |
|---|---|
| Account | Profile management |
| Privacy & Security | Privacy controls |
| Messaging & Calls | Communication preferences |
| Music & Audio | Listening experience settings |
| Content & Feed | Feed personalization |
| Analytics & Insights | Data visibility |
| Notifications | Notification toggles |
| Appearance & Themes | Dark/light mode and themes |
| Screen Time & Wellbeing | Digital wellness |
| App & Data | Storage management |
| Legal & Support | Terms, Privacy, Help |

- **Search bar** filters sections by keyword.
- **Logout** button at bottom calls `signOut()` → clears Supabase session + `localStorage.auth_token`.
- Version number displayed: `Clockit v1.0.0`.

---

### 4.14 Additional Pages

| Page | Description |
|---|---|
| `DownloadedMusic` | Shows locally cached/downloaded tracks for offline playback |
| `OfflineReels` | Shows cached reels for offline viewing |
| `Podcasts` | Podcast discovery and playback |
| `LiveFeed` | Aggregated live stream discovery feed |
| `Appearance` | Theme customization (colors, fonts, modes) |
| `AuthCallback` | Handles Supabase OAuth redirect |
| `SpotifyCallback` | Handles Spotify OAuth redirect + token storage |
| `NotFound` | 404 page |
| `CameraTest` | Development tool for testing the Camera component |

---

## 5. Global Context & State Management

### 5.1 AuthContext

**File:** `src/contexts/AuthContext.tsx`  
**State:** `user`, `session`, `profile`, `loading`.  
**Auth Flow:**
1. On mount: checks `localStorage.auth_token` → verifies with `/auth/verify`.
2. Subscribes to `supabase.auth.onAuthStateChange`.
3. On Supabase session: calls `/auth/oauth-verify` → saves backend JWT.
4. Dual ID system: MongoDB `_id` used for most backend calls; Supabase `UUID` for DB queries.

**Methods:** `signUp`, `signIn`, `signInWithOAuth`, `signOut`.  
**OAuth Providers:** Google, Apple, Facebook (Spotify handled separately).

---

### 5.2 MediaPlayerContext

**File:** `src/contexts/MediaPlayerContext.tsx`  
**Purpose:** Global audio engine powering the persistent music player.

**State:**
- `currentTrack`, `playlist`, `currentIndex`
- `isPlaying`, `currentTime`, `volume`, `isMuted`
- `isShuffled`, `repeatMode` (`off` | `one` | `all`)
- `playbackSource` (`local` | `spotify`)
- `deviceConnected`, `deviceName` (Bluetooth)
- `offlineMode`, `cachedTracks`

**Capabilities:**
- HTML5 `Audio` element with `timeupdate`, `ended`, `loadedmetadata` listeners.
- **Spotify Web Playback SDK** integration via `useSpotifyPlayer` hook — plays Spotify URIs.
- **Web Bluetooth API** – `connectBluetoothDevice()` for BT audio output.
- **Media Session API** – Sets metadata and action handlers so native OS media controls work.
- **Offline Mode** – `toggleOfflineMode()` + `cacheTrack()` / `isTrackCached()`.

**Playback Control:** `play`, `pause`, `stop`, `next`, `previous`, `seekTo`, `setVolume`, `toggleMute`, `addToQueue`, `removeFromQueue`.

---

### 5.3 SocketContext

**File:** `src/contexts/SocketContext.tsx`  
**Purpose:** Persistent Socket.IO connection for real-time features.

- Connects to backend URL (derived from `getApiUrl()` with `/api` stripped).
- Authenticated via JWT (`auth.token`).
- Reconnects up to 5 times with 1s delay.
- Exposes `socket` and `isConnected` to children.

**Used in:** `Chat.tsx`, `Live.tsx` (join rooms, emit/receive events).

---

### 5.4 ThemeContext

**File:** `src/contexts/ThemeContext.tsx` (inferred from `ThemeProvider` import).  
**Purpose:** Manages dark/light/system theme mode.  
**Storage:** Persists theme preference to localStorage.

---

## 6. Service Layer

### 6.1 `getApiUrl()` (`src/utils/api.ts`)

```
Production: https://clockit-gvm2.onrender.com/api
Dev: VITE_API_URL env variable
```

### 6.2 `profileApi` (`src/services/profileApi.ts`)

Wrapper around `api` (axios/fetch abstraction). Covers:

| Function | Endpoint |
|---|---|
| `getProfile(userId?)` | `GET /profile` or `/profile/:id` |
| `updateProfile(data)` | `PUT /profile` |
| `uploadAvatar(file)` | `POST /profile/avatar` (multipart) |
| `getFollowers(userId?)` | `GET /profile/:id/followers` |
| `getFollowing(userId?)` | `GET /profile/:id/following` |
| `toggleFollow(userId)` | `POST /profile/:id/follow` |
| `search(query)` | `GET /search?q=...` |
| `getStories(userId?)` | `GET /profile/stories` |
| `getReels(userId?)` | `GET /profile/reels` |
| `getSavedContent(type)` | `GET /profile/saved?type=...` |
| `toggleSaveContent(data)` | `POST /profile/save` |
| `getDrafts(type)` | `GET /profile/drafts?type=...` |
| `shareMusic(data)` | `POST /profile/share-music` |

---

## 7. Backend Architecture (Node.js)

**Hosted at:** `https://clockit-gvm2.onrender.com`  
**Entry:** `backend/src/server.js`

**Structure:**
- **42 Mongoose Models** – Users, reels, stories, messages, conversations, groups, playlists, songs, etc.
- **19 Controllers** – Business logic per feature area.
- **27 Route Files** – Express routes, all prefixed with `/api`.
- **Auth Middleware** – JWT verification via Bearer token.
- **Utilities** – Helpers (Cloudinary migration script present).

**Key API Categories:**
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify`, `/api/auth/oauth-verify`
- Profile: `/api/profile`
- Reels: `/api/reels`
- Stories: `/api/stories`
- Chat: `/api/messages`, `/api/conversations`
- Groups: `/api/listening-groups`
- Search: `/api/search`
- Music: (proxied/external via SoundCloud API integration)

---

## 8. Supabase / Database Architecture

### 8.1 Tables (Migration 1)

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `user_id (FK auth.users)`, `username`, `display_name`, `avatar_url`, `bio`, `streak_count` | RLS: public read, owner write |
| `followers` | `follower_id`, `following_id` | Unique pair constraint |
| `stories` | `user_id`, `media_url`, `media_type`, `caption`, `expires_at` | 24hr expiry field |
| `story_views` | `story_id`, `viewer_id` | Unique per viewer |
| `reels` | `user_id`, `video_url`, `thumbnail_url`, `caption`, `music_title`, `music_artist`, `likes_count`, `comments_count`, `shares_count` | |
| `reel_likes` | `reel_id`, `user_id` | Unique per user |
| `conversations` | `participant_1`, `participant_2` | Unique pair constraint |
| `messages` | `conversation_id`, `sender_id`, `content`, `message_type`, `is_read` | Realtime enabled |

### 8.2 RLS Policies

| Table | Read | Write |
|---|---|---|
| `profiles` | Public | Owner only |
| `followers` | Public | Authenticated follower |
| `stories` | Public | Owner only |
| `reels` | Public | Owner only |
| `reel_likes` | Public | Authenticated user |
| `conversations` | Participants only | Initiator |
| `messages` | Participants only | Participants |

### 8.3 Triggers & Functions

- `handle_new_user()` – Auto-creates `profiles` row on `auth.users` INSERT.
- `update_updated_at_column()` – Auto-updates `updated_at` on `profiles` modification.
- `supabase_realtime` publication enabled on `messages` table.

### 8.4 Storage Buckets (inferred)

| Bucket | Usage |
|---|---|
| `avatars` | User profile pictures (signUp avatar upload) |
| `reels-videos` | Uploaded reel video files |
| *(stories bucket)* | Story media (partially implemented) |

---

## 9. PWA Features

**Plugin:** `vite-plugin-pwa`  
**Components:**
- `PWAInstallPrompt` – Shows install banner when browser `beforeinstallprompt` fires.
- `OfflineIndicator` – Shows network status overlay when offline.

**Offline Support:**
- `OfflineReels` page – pre-downloaded reel content.
- `DownloadedMusic` page – cached audio tracks.
- `MediaPlayerContext.offlineMode` + `cachedTracks` – offline playback state.

---

## 10. UI/UX Design System

### 10.1 Design Language

- **Theme:** Dark-first with glassmorphism (`glass-card`, `backdrop-blur`).
- **Colors:** HSL-based design tokens (CSS variables). Primary: purple/gradient.
- **Typography:** System font stack; `text-gradient` utility for gradient text.
- **Borders:** Soft `border-border/50`, rounded corners `rounded-xl`, `rounded-3xl`.

### 10.2 Animation Patterns (Framer Motion)

- **Page sections:** `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` with staggered `delay`.
- **Headers:** `initial={{ opacity: 0, y: -20 }}`.
- **Cards:** `initial={{ opacity: 0, scale: 0.95 }}`.
- **Swipe:** Drag gesture in Reels — horizontal or vertical.
- **AnimatePresence** – Used for route/modal transitions.

### 10.3 Shared Layout

- **`<Layout>`** component wraps all pages — provides consistent padding, bottom nav spacing.
- **Bottom Navigation** – Fixed nav bar with icons for Home, Music, Chat, Reels, Profile.
- **Sticky Headers** – `sticky top-0 z-20 glass-card rounded-b-3xl` pattern across all pages.

### 10.4 Reusable Components (Key)

| Component | Purpose |
|---|---|
| `SongCard` | Music track row with artwork, title, artist, play indicator |
| `FeaturedPlaylist` | Playlist card with cover art and count |
| `StoryViewer` | Full-screen story overlay with progress bar |
| `StoryCreator` | Camera/gallery + filter UI for story creation |
| `MediaControls` | Persistent bottom music playback bar |
| `FullPlayer` | Full-screen expanded music player |
| `Camera` | Reusable camera component (used in Snap, Stories) |
| `MediaNotification` | OS-level media notification bridge |
| `PWAInstallPrompt` | Install prompt banner |
| `OfflineIndicator` | Network status overlay |

---

## 11. Known Issues & Observations

| # | Area | Observation | Severity |
|---|---|---|---|
| 1 | Auth | Dual auth system (Supabase + MongoDB JWT) creates ID sync complexity — Supabase UUID vs MongoDB `_id` | Medium |
| 2 | Stories | `mediaUrl` is sent as raw base64 data URL to API — file-to-URL upload pipeline not complete | Medium |
| 3 | Snap | `sendSnapAsStory` POSTs to hardcoded `/api/stories` instead of `getApiUrl()` + `/stories` | Low |
| 4 | Groups | Group chat and group playlist buttons only `console.log` — not wired to real navigation | Low |
| 5 | Search | `mockResults` defined but never used — real results from API only, empty on default load | Low |
| 6 | Settings | Settings sub-sections route to `/settings/:id` but those child pages are not in `AppRouter.tsx` `Routes` | Medium |
| 7 | Reels | Duplicate `handleTrackEnd` / `handleTrackEndWithRef` — dead code for the non-ref version | Low |
| 8 | Live | WebRTC video transport not visible in frontend code — only Socket.IO signaling present | Unknown |
| 9 | Backend | MongoDB backend runs in parallel with Supabase — risk of data divergence without sync strategy | High |
| 10 | API | `getApiUrl()` falls back to production URL in development — could cause accidental prod calls | Low |

---

## 12. Feature Map Summary

```
Clockit PWA
│
├── Content Creation
│   ├── Snap (camera → story)
│   ├── Stories (camera/gallery + filters)
│   └── Reels (video recording + upload)
│
├── Content Consumption
│   ├── Home Feed (stories, playlists, recent plays)
│   ├── Reels (swipe vertical feed)
│   ├── Music (mood/genre browser, full player)
│   ├── Live (stream viewer)
│   └── Podcasts
│
├── Social
│   ├── Profile (follow/unfollow, stats, tabs)
│   ├── Groups (listening communities)
│   ├── Search (global: music/users/reels/hashtags)
│   └── Chat (DMs, snaps, calls)
│
├── Player Features
│   ├── HTML5 local audio
│   ├── Spotify Web Playback SDK
│   ├── Web Bluetooth output
│   ├── Media Session API (OS controls)
│   ├── Shuffle / Repeat modes
│   └── Offline caching
│
└── PWA / Platform
    ├── Install prompt
    ├── Offline indicator
    ├── Downloaded music
    └── Offline reels
```

---

*End of Clockit PWA UI Audit — `ui_audit.md`*
