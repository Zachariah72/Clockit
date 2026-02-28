# Clockit — Home & Music Page Deep Audit

> **Branch:** `music-page-restracture`  
> **Date:** 2026-02-25  
> **Scope:** `src/pages/Index.tsx` + `src/pages/Music.tsx` + `src/components/music/*`  
> **Mode:** Read-only — no code modified

---

## 1. Page Inventory

| File | Lines | Role |
|---|---|---|
| `src/pages/Index.tsx` | 815 | Home feed — discovery hub |
| `src/pages/Music.tsx` | 884 | Full music player + discovery |
| `src/components/music/SongCard.tsx` | — | Shared track row card |
| `src/components/music/FeaturedPlaylist.tsx` | — | Shared playlist card |
| `src/components/music/MusicSearch.tsx` | — | SoundCloud live search |
| `src/components/music/MusicDiscovery.tsx` | — | Last.fm algorithmic picks |
| `src/components/music/MusicModeSelector.tsx` | — | Mood selector component |
| `src/components/music/FullPlayer.tsx` | — | Full-screen player sheet |
| `src/components/music/MiniPlayer.tsx` | — | Compact bottom player |
| `src/components/music/SpotifyMusic.tsx` | — | Spotify SDK integration |
| `src/components/media/MediaControls.tsx` | — | Fixed bottom playback bar |

---

## 2. Home Page (`Index.tsx`) — Structural Breakdown

### 2.1 Section Map (Top → Bottom)

```
┌─────────────────────────────────────────────────────────┐
│  STICKY HEADER (glass-card, rounded-b-3xl)              │
│  [Clockit logo] [Search] [Plus/FAB] [Bell] [Radio] [User]│
│  • NotificationsDropdown (AnimatePresence)              │
│  • FAB Menu: Reel / Music / Story / Group               │
├─────────────────────────────────────────────────────────┤
│  STORIES ROW (horizontal scroll)                        │
│  <StoriesRow> — avatar bubbles + "+" create button       │
├─────────────────────────────────────────────────────────┤
│  HERO BANNER (h-32 sm:h-40, image + gradient overlay)   │
│  "Discover New Sounds" — Trending Now                   │
├─────────────────────────────────────────────────────────┤
│  FEATURED PLAYLISTS (horizontal scroll)                 │
│  3x <FeaturedPlaylist> — static mock data               │
│  "See all" → navigates to /music                        │
├─────────────────────────────────────────────────────────┤
│  RECENTLY PLAYED (vertical list)                        │
│  4x <SongCard> — static mock data                       │
│  Click → navigates to /music with playSong state        │
├─────────────────────────────────────────────────────────┤
│  SEARCH MODAL (Dialog, max-w-2xl)                       │
│  - Recent history, Popular tags, Live API results        │
├─────────────────────────────────────────────────────────┤
│  STORY VIEWER (full-screen overlay)                     │
│  STORY CREATOR (camera + gallery modal)                 │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Sources

| Section | Data Source | Type |
|---|---|---|
| Stories | `GET /api/stories` (auth token) | Live API |
| Featured Playlists | Hardcoded constant `featuredPlaylists[]` | Mock |
| Recently Played | Hardcoded constant `recentSongs[]` | Mock |
| Notifications | Hardcoded state `notifications[]` | Mock |
| Search Results | `GET /api/search?q=...&limit=10` | Live API |
| Hero Banner | Static `heroMusic` asset | Asset |

### 2.3 State Map

```
isStoryViewerOpen     → controls StoryViewer overlay
isStoryCreatorOpen    → controls StoryCreator overlay
selectedStoryId       → which story to open in viewer
isNotificationsOpen   → bell dropdown visibility
isFabOpen             → plus/create menu visibility
isSearchOpen          → global search dialog
searchQuery           → debounced (300ms) search input
searchResults         → API results array
searchHistory         → localStorage-style array (5 items max)
notifications[]       → unread notification count + list
stories[]             → fetched from API on mount
```

### 2.4 Navigation Contracts (Home → Other Pages)

| Action | Destination | Router State Passed |
|---|---|---|
| Click playlist | `/music` | `{ selectedPlaylist: id }` |
| "See all" playlists | `/music` | `{ showRecentlyPlayed: true }` |
| Click song | `/music` | `{ playSong, songIndex, fromHome: true }` |
| FAB → Reel | `/reels` | none |
| FAB → Music | `/music` | none |
| FAB → Story | `/stories` | none |
| FAB → Group | `/groups` | none |
| Radio icon | `/live` | `window.location.href` (hard nav!) |
| User icon | `/profile` | `window.location.href` (hard nav!) |
| Search → music| `/music` | `{ searchQuery: result.title }` |
| Search → artist| `/music` | `{ artist: result.title }` |
| Search → reel | `/reels` | `{ hashtag }` or `{ reelId }` |
| Search → user | `/profile/:id` | none |

> ⚠️ **Bug:** Radio and Profile icon use `window.location.href` instead of `navigate()` — this causes a full page reload and breaks SPA transitions.

---

## 3. Music Page (`Music.tsx`) — Structural Breakdown

### 3.1 Section Map (Top → Bottom)

```
┌─────────────────────────────────────────────────────────┐
│  STICKY HEADER (glass-card, rounded-b-3xl)              │
│  "Music" title                                          │
│  ├─ MOOD SELECTOR (horizontal scroll)                   │
│  │   9 moods: All / Chill / Meditating / Happy /        │
│  │   Party / Sad / Workout / Late Night / Trending       │
│  ├─ GENRE TABS (horizontal scroll, 24 genres)           │
│  └─ TAB BAR: [Search] [All Songs] [Discover]            │
│              [Playlists] [Liked]                        │
│  └─ SEARCH BAR (collapsible, shows on search icon click) │
├─────────────────────────────────────────────────────────┤
│  ALWAYS-VISIBLE SECTIONS (regardless of tab):           │
│  ├─ DISCOVER grid (4 playlists, 1-2 col, when !search)  │
│  ├─ LISTENING GROUPS (2 hardcoded mock groups)          │
│  └─ QUICK ACTIONS: [Shuffle All] [Play All]             │
├─────────────────────────────────────────────────────────┤
│  TAB-CONDITIONAL SECTIONS:                              │
│  ├─ "search"    → <MusicSearch /> (SoundCloud live)     │
│  ├─ "discover"  → <MusicDiscovery /> (Last.fm picks)    │
│  ├─ "playlists" → Horizontal playlist scroll            │
│  │               + Create Playlist Dialog               │
│  ├─ "all"       → Filtered SongCard list                │
│  └─ "liked"     → Empty state (not connected to API)    │
├─────────────────────────────────────────────────────────┤
│  FIXED BOTTOM:                                          │
│  <MediaControls> — visible always                       │
│  Click → opens <FullPlayer> sheet                       │
│  If !showBottomNav → pulsing dot indicator              │
└─────────────────────────────────────────────────────────┘
[Separate route: PlaylistView rendered when selectedPlaylist ≠ null]
```

### 3.2 Data Sources

| Section | Source | Type |
|---|---|---|
| All Songs | `GET /api/soundcloud/search?q=chill&limit=20` | Live API |
| Playlists | Derived from `allSongs` (11 default playlists, slices) | Computed |
| MusicSearch | `<MusicSearch>` — own internal fetch | SoundCloud |
| MusicDiscovery | `<MusicDiscovery>` — own internal fetch | Last.fm |
| Listening Groups | Hardcoded JSX (2 mock groups) | Mock |
| Liked Songs | Empty state — not wired | None |

### 3.3 State Map

```
allSongs[]            → fetched from SoundCloud API
playlists[]           → derived from allSongs (11 entries)
filteredSongs[]       → computed: allSongs filtered by mood + genre + query
searchQuery           → inline filter text
activeTab             → "all" | "search" | "discover" | "playlists" | "liked"
selectedMood          → mood filter key (9 options)
selectedGenre         → genre filter key (24 options)
selectedPlaylist      → null | playlist object → switches to PlaylistView
isCreatePlaylistOpen  → "Create New" dialog
showBottomNav         → auto-hides after 4s inactivity
showSearchBar         → collapsible search input in header
showFullPlayer        → FullPlayer sheet overlay
```

### 3.4 Navigation Contracts (Music → Elsewhere)

| Trigger | Destination | Method |
|---|---|---|
| Back button in PlaylistView | stays on `/music` | `setSelectedPlaylist(null)` |
| MediaControls click | Full Player Sheet | `setShowFullPlayer(true)` |

### 3.5 Incoming Navigation (What Home Sends, Music Reads)

```typescript
location.state = {
  selectedPlaylist?: string    // opens PlaylistView for that playlist id
  showRecentlyPlayed?: boolean // sets activeTab = "all"
  playSong?: song              // sets activeTab = "all" (partial - song not autoplay)
  songIndex?: number           // unused in effect
  fromHome?: boolean           // flag for above
  activeTab?: "search"         // opens search bar immediately
}
```

> ⚠️ **Gap:** When `playSong` state arrives from Home, `activeTab` is set to "all" but the specific song is **never auto-played**. The `SongCard` onClick would need to be triggered programmatically.

---

## 4. Shared Components — Relationship Map

```
Index.tsx                    Music.tsx
    │                            │
    ├── <StoriesRow>              │
    ├── <StoryViewer>            │
    ├── <StoryCreator>           │
    │                            │
    ├── <SongCard> ─────────────►│── <SongCard>
    │   (mock data)               │   (SoundCloud API data)
    │                            │
    ├── <FeaturedPlaylist> ─────►│── <FeaturedPlaylist>
    │   (3 static cards)          │   (11 derived playlists)
    │                            │
    │                            ├── <MusicSearch>
    │                            ├── <MusicDiscovery>
    │                            ├── <MusicModeSelector> (exists, unused in Music.tsx!)
    │                            ├── <FullPlayer>
    │                            └── <MediaControls>
    │
    └── [Both share: Layout, MediaPlayerContext, ThemeContext, AuthContext]
```

### 4.1 `SongCard` — Dual Usage Comparison

| Property | Home (Index.tsx) | Music (Music.tsx) |
|---|---|---|
| `title` | Mock string | API `track.title` |
| `artist` | Mock string | API `track.artist.name` |
| `albumArt` | Local asset (`album1.jpg`) | API `track.artwork_url` |
| `duration` | String `"3:42"` | Formatted from ms `formatDuration()` |
| `trackUrl` | `soundjay.com` bell wav | API `track.stream_url` via proxy |
| `isPlaying` | `index === 0` hardcoded | `index === 0` hardcoded |
| `playlist` | Mapped from `recentSongs[]` | Mapped from `filteredSongs[]` |

### 4.2 `FeaturedPlaylist` — Dual Usage Comparison

| Property | Home (Index.tsx) | Music (Music.tsx) |
|---|---|---|
| Data | 3 hardcoded objects | 11 derived from `allSongs` |
| `onClick` | `navigate('/music', { state: { selectedPlaylist: id } })` | `setSelectedPlaylist(playlist)` |
| Layout | Horizontal scroll row | Grid (2-col) + horizontal playlists tab |

---

## 5. Integration Relationship

The two pages are designed as a **source → destination** pair:

```
HOME (Index)                    MUSIC (Music)
────────────                    ─────────────
Discovery surface               Deep engagement surface
  • Teaser playlists ──────────► • Full playlist viewer
  • Teaser songs ──────────────► • Full song library
  • Search shortcut ───────────► • Full search (MusicSearch)
  • "See all" CTA ────────────► • All Songs tab
  • Playlist click ────────────► • PlaylistView
  • Song click ────────────────► • All Songs tab (song not autoplay)
```

**The Home page is the discovery teaser. The Music page is the full player engine.**  
They share the same `MediaPlayerContext` — so a song started from Home continues playing when the user navigates to Music (the `MediaControls` bar persists across both routes via `<Layout>`).

---

## 6. Current Issues & Gaps

| # | Severity | Page | Issue |
|---|---|---|---|
| 1 | 🔴 High | Home | `recentSongs` and `featuredPlaylists` are **hardcoded mock data** — should be fetched from the API or `MediaPlayerContext.recentlyPlayed` |
| 2 | 🔴 High | Music | "Liked Songs" tab is **not wired** — always shows empty state. No API call to save/fetch liked songs |
| 3 | 🟡 Medium | Music | Playlists are **generated by slicing `allSongs`** — they all point to the same tracks. A real playlist service is not yet connected |
| 4 | 🟡 Medium | Music | Listening Groups section is **hardcoded** — should pull from `/api/listening-groups` (the Groups page already does this) |
| 5 | 🟡 Medium | Home→Music | **`playSong` state from Home does not autoplay** the song on Music page — the `useEffect` only sets `activeTab = "all"` |
| 6 | 🟡 Medium | Home | Radio & Profile icons use `window.location.href` instead of `navigate()` — **breaks SPA routing** |
| 7 | 🟡 Medium | Music | `MusicModeSelector` component **exists in `components/music/` but is not used** in `Music.tsx` — the mood selector is re-implemented inline |
| 8 | 🟠 Low | Music | `getApiBaseUrl()` is **re-implemented locally** in `Music.tsx` — the global `getApiUrl()` utility exists in `src/utils/api.ts` and should be used instead |
| 9 | 🟠 Low | Music | Mood filter uses **color classes like `bg-blue-500`** as background context for the whole page — applied via `currentMood?.color` on the wrapper div; unclear if intentional theme-shift UX |
| 10 | 🟠 Low | Home | Search uses `fetch('/api/search?...')` with a **relative URL** — should use `getApiUrl()` to work in production |

---

## 7. Mobile UI Analysis

### 7.1 What Works Well (Keep)

- **Sticky glass header** with `rounded-b-3xl` — clean iOS-feel top bar ✅
- **Horizontal scroll sections** with `scrollbar-hide` — standard mobile pattern ✅
- **Framer Motion staggered entrance** — premium feel ✅
- **`touch-manipulation`** class on header buttons — prevents 300ms delay ✅
- **`pb-32`** padding at bottom — prevents content hidden behind fixed `<MediaControls>` ✅
- **Auto-hide bottom nav** in Music (4s timer) — smart for full playback focus ✅

### 7.2 Mobile Pain Points

| # | Problem | Impact |
|---|---|---|
| 1 | **Hero banner is only `h-32` (128px)** — too short on tall phones. Static image with no real CTA | Low visual impact |
| 2 | **Header crammed with 6 icons** (Search, Plus, Bell, Radio, User) — too tight on small screens (375px iPhone SE) | Touch error risk |
| 3 | **Music header has 3 rows** (Mood row + Genre tabs + Tab bar) — on small phones the sticky header takes up 40-50% of visible viewport | Content space loss |
| 4 | **Song cards in Home use mock `soundjay.com` WAV** — won't actually play meaningful music; disappointing first impression | Bad UX on first open |
| 5 | **Search modal is `max-w-2xl`** — fine on tablet but the `max-h-[80vh]` with `overflow-hidden` cuts off results on phones | Truncated results |
| 6 | **Notification dropdown `w-72`** may overflow on 320px width phones | Layout break |
| 7 | **Playlist cards in Home are horizontal scroll with no snap points** — feels imprecise on touch | Poor scroll feel |
| 8 | **Music page has no loading/skeleton state** — the song list appears empty until SoundCloud API responds | Jarring blank screen |

---

## 8. Integration Suggestion — "Home + Music as One"

This is your design lane. Here is a clear integration model for how other devs designing the Home page can treat Home and Music as a unified experience:

### 8.1 Mental Model: "Surface ↔ Engine"

```
HOME = the storefront window
MUSIC = the full store inside

Home shows SAMPLES → Music is where you LIVE inside the content
```

Both pages already share:
- Same `<MediaPlayerContext>` → persistent player across both
- Same `<SongCard>` and `<FeaturedPlaylist>` components
- Same `<Layout>` wrapper with bottom nav
- Same design language (glass-card, rounded-3xl, Framer Motion)

### 8.2 Proposed Integration Architecture

```
HomeMusic Integration Points
├── Shared Data Layer
│   ├── MediaPlayerContext.recentlyPlayed → drives Home "Recently Played"
│   ├── MediaPlayerContext.currentTrack   → Hero banner shows "Now Playing"
│   └── API /listening-groups            → Home shows "Active Groups" teaser
│
├── Cross-Page Navigation Contracts (to keep stable)
│   ├── Home → Music: { selectedPlaylist, playSong, showRecentlyPlayed }
│   ├── Home → Music: { activeTab: 'search', searchQuery }
│   └── Music → stays internal (PlaylistView is in-page, not a route)
│
└── Shared UI Atoms (do not redesign these separately)
    ├── <SongCard>           — used identically on both pages
    ├── <FeaturedPlaylist>   — used identically on both pages
    └── <MediaControls>      — fixed bottom bar; shared via Layout
```

### 8.3 Recommended Design Lanes for Other Devs

If your team is splitting work:

| Dev Lane | Owns | Can Use |
|---|---|---|
| **Your lane (Home + Music)** | `Index.tsx`, `Music.tsx`, `components/music/*` | Full ownership |
| **Social dev** | `Stories.tsx`, `Reels.tsx`, `Chat.tsx` | `<StoriesRow>` embedded in Home |
| **Discovery dev** | `MusicDiscovery.tsx`, `MusicSearch.tsx` | Used in Music `discover` + `search` tab |
| **Player dev** | `MediaPlayerContext`, `MediaControls`, `FullPlayer` | Used in Music + Layout |

**Contract to protect:** The `location.state` shape between Home→Music. Don't change the keys (`selectedPlaylist`, `playSong`, `fromHome`, `showRecentlyPlayed`, `activeTab`) without coordinating.

---

## 9. Mobile UI Redesign Suggestions (Visual)

These are suggestions ONLY — no code changes:

### 9.1 Header Simplification

**Current (Home):** 6 icons in one row → cramped on 375px.

**Suggestion:**
```
Left: [Logo + "Stories & Music" subtitle]
Right: [Search icon] [Bell icon with badge]
Plus/Create: Move to a floating bottom-right FAB circle button
Radio + Profile: Move into the FAB menu or bottom nav
```

### 9.2 Hero Banner Elevation

**Current:** `h-32` static image with gradient text — low impact.

**Suggestion:** Make it a dynamic "Now Playing" or "Trending" card:
- If music is playing: show current track artwork, track name, animated waveform
- If not playing: show "Top trending song" fetched from MusicDiscovery
- Height: `h-48 sm:h-56` (more breathing room)
- Replace static `heroMusic.jpg` with dynamic album art + blur backdrop

### 9.3 Home Section Order (Mobile Priority)

Current order vs suggested priority order:

| Current | Suggested (Mobile-First) |
|---|---|
| Stories Row | Stories Row (keep — social hook) |
| Hero Banner | Now Playing / Trending Card (dynamic) |
| Featured Playlists | Featured Playlists (keep — with snap scroll) |
| Recently Played | Quick Play Chips (mood-based shortcuts to Music) |
| *(nothing)* | Recently Played (move below quick plays) |

**Rationale:** On mobile, show the most interactive content first. "Recently Played" is the lowest-friction re-entry point — it should be above the fold or at least reachable without heavy scrolling.

### 9.4 Music Header Collapse Strategy

**Current:** 3 header rows always visible = 50% of screen used by header.

**Suggestion:**
- **Scroll-collapse the Mood and Genre rows** — on scroll down, collapse them; scroll up to reveal.
- Keep only Tab bar + title visible when scrolled far down.
- This gives 70% of the screen to the content list on mobile.

### 9.5 Playlist Cards — Add Scroll Snap

**Current:** `overflow-x-auto` — drifts imprecisely on touch.

**Suggestion:** Add `scroll-snap-type: x mandatory` on the container and `scroll-snap-align: start` on each card. This makes swiping feel crisp and intentional — one card at a time.

### 9.6 Skeleton Loading State

**Current:** Music page shows a blank list (`0 songs`) until API responds.

**Suggestion:** Add 4–6 skeleton `SongCard` rows while `allSongs.length === 0 && isLoading`. Use Tailwind `animate-pulse` with rounded shapes matching the SongCard layout.

### 9.7 Home → Music "Now Playing" Bridge

**Current:** The Home page has no visual indication of what's playing.

**Suggestion:** If `MediaPlayerContext.currentTrack` is not null, show a subtle "mini now-playing" banner below the Hero Banner:
```
[ Album Art ] Now Playing: "Neon Dreams" – Midnight Wave [▶ Resume]
```
This makes Home feel alive and connected to the music player.

---

## 10. Summary for Team

| Area | Status | Owner Action |
|---|---|---|
| Home data (songs, playlists) | 🔴 All mock — needs real API | Wire `recentlyPlayed` from MediaPlayerContext |
| Music songs | 🟢 Live from SoundCloud | Keep — working |
| Music playlists | 🟡 Sliced from same tracks | Needs real playlist service |
| Liked songs | 🔴 Empty, not wired | Backend endpoint + UI needed |
| Home → Music routing | 🟢 Contract defined | Keep keys stable |
| Mobile header (Home) | 🟡 Too many icons | FAB consolidation recommended |
| Mobile header (Music) | 🟡 Too tall | Scroll-collapse recommended |
| Hero banner | 🟠 Static / low impact | Elevate to dynamic "Now Playing" card |
| Playlist scroll | 🟠 No snap | Add CSS scroll-snap |
| Loading state | 🔴 No skeleton | Add animate-pulse skeleton |

---

*End of Home & Music Audit — `home_music_audit.md`*
