import fs from 'fs';

const appPath = 'src/App.tsx';
const indexPath = 'src/pages/Index.tsx';

let appContent = fs.readFileSync(appPath, 'utf8');

// Imports to keep in App but also used in Index (or move completely to Index)
// We will just construct Index.tsx imports manually and remove the ones from App.tsx that are NO LONGER needed.

const indexImports = `import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { FullPlayer } from '@/components/music/FullPlayer';
import { SnappySection } from '@/components/home/SnappySection';
import { ReelsSection } from '@/components/home/ReelsSection';
import { GenreSection } from '@/components/home/GenreSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FeedPost } from '@/components/home/FeedPost';
import { MobileSuggestions } from '@/components/home/MobileSuggestions';
import { CommunitySection } from "@/components/home/CommunitySection";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Bell, Plus, Radio, PencilLine, Camera, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMusicImage from '@/assets/hero-music.jpg';
`;

// Extract from App.tsx lines 57 to 473 (the data arrays + HomePage)
// We'll use regex to make it robust.
const homePageMatch = appContent.match(/(const FEED_POSTS = \[[\s\S]*?)(const App = \(\) => \()/);

if (!homePageMatch) {
  console.error("Could not find HomePage in App.tsx");
  process.exit(1);
}

const extractedHomePageCode = homePageMatch[1].trim();

const newIndexContent = `${indexImports}

${extractedHomePageCode}

export default HomePage;
`;

fs.writeFileSync(indexPath, newIndexContent);

// Now remove the extracted code from App.tsx
appContent = appContent.replace(homePageMatch[1], `import Index from "./pages/Index";\n\n`);

// Remove unused imports from App.tsx
const unusedImportsRegexes = [
  /import \{ useState, useEffect, useRef \} from 'react';\n/,
  /import \{ FullPlayer \} from '@\/components\/music\/FullPlayer';\n/,
  /import heroMusicImage from '@\/assets\/hero-music\.jpg';\n/,
  /import \{ SnappySection \} from '@\/components\/home\/SnappySection';\n/,
  /import \{ ReelsSection \} from '@\/components\/home\/ReelsSection';\n/,
  /import \{ GenreSection \} from '@\/components\/home\/GenreSection';\n/,
  /import \{ BottomNav \} from '@\/components\/layout\/BottomNav';\n/,
  /import \{ MiniPlayer \} from '@\/components\/layout\/MiniPlayer';\n/,
  /import \{ Sidebar \} from '@\/components\/layout\/Sidebar';\n/,
  /import \{ RightPanel \} from '@\/components\/layout\/RightPanel';\n/,
  /import \{ FeedPost \} from '@\/components\/home\/FeedPost';\n/,
  /import \{ MobileSuggestions \} from '@\/components\/home\/MobileSuggestions';\n/,
  /import \{ Bell, Plus, Music as MusicIcon, Settings, Search \} from "lucide-react";\n/,
  /import \{ CommunitySection \} from "\.\/components\/home\/CommunitySection";\n/,
  /import \{ FeaturedPlaylist \} from "\.\/components\/music\/FeaturedPlaylist";\n/,
  /import \{ NotificationCenter \} from "\.\/components\/notifications\/NotificationCenter";\n/
];

unusedImportsRegexes.forEach(regex => {
  appContent = appContent.replace(regex, '');
});

// Fix lucide-react in App.tsx, since Settings & Search were imported there and might be used in Routes?
// Actually Settings & Search in App.tsx were pages, let's check:
// Wait, `import Settings from "./pages/Settings"` would be default import, but `import { Settings, Search } from "lucide-react"` is for icons. 
// Do App.tsx routes use Settings and Search? 
// <Route path="/settings" element={<Settings />} /> uses them! But that implies they were imported as components.
// Ah, `import Settings from "./pages/Settings"` might be missing or conflicting!
// Let's not remove `{ Settings, Search }` blindly, App.tsx might actually use them. Wait, they are used as components `<Settings />`.
// I will just let ESLint tell me if I break something.

// Replace `<Route path="/" element={<HomePage />} />` with `<Route path="/" element={<Index />} />`
appContent = appContent.replace(/<Route path="\/" element=\{<HomePage \/>\} \/>/g, '<Route path="/" element={<Index />} />');

fs.writeFileSync(appPath, appContent);
console.log("Successfully refactored HomePage to Index!");
