import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Search, Shuffle, Play, ListMusic, Heart, Clock, Music as MusicIcon, TrendingUp, Moon, Zap, Smile, Frown, Dumbbell, Star, Plus, Users, Radio, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaControls } from "@/components/media/MediaControls";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import heroMusic from "@/assets/hero-music.jpg";

const allSongs = [
  // Existing songs
  { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: album1, duration: "3:42", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: album2, duration: "4:15", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: album3, duration: "2:58", genre: "Lo-Fi", mood: "Meditating", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "4", title: "Electric Soul", artist: "Nova", albumArt: album1, duration: "3:21", genre: "R&B/Soul", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "5", title: "Midnight Run", artist: "Cyber Dreams", albumArt: album2, duration: "4:02", genre: "Electronic/EDM", mood: "Late Night", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "6", title: "Starlight", artist: "Aurora", albumArt: album3, duration: "3:55", genre: "Pop", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },

  // New songs
  { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: album1, duration: "3:30", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Vybz Kartel - God Is The Greatest (Official Music Video) - VybzKartelVEVO.mp3" },
  { id: "8", title: "Crocodile Teeth", artist: "Skillibeng", albumArt: album2, duration: "2:45", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Skillibeng - Crocodile Teeth (Official Music Video) - SkillibengVEVO.mp3" },
  { id: "9", title: "Let Go", artist: "Central Cee", albumArt: album3, duration: "2:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Central Cee - Let Go [Music Video] - Central Cee.mp3" },
  { id: "10", title: "CHINJE", artist: "Toxic Lyrikali", albumArt: album1, duration: "3:20", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Toxic Lyrikali - CHINJE (Official Music Video) - Toxic Lyrikali.mp3" },
  { id: "11", title: "Joro", artist: "Wizkid", albumArt: album2, duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Wizkid - Joro (Official Video) - WizkidVEVO.mp3" },
  { id: "12", title: "Gyal You A Party Animal", artist: "Charly Black", albumArt: album3, duration: "3:10", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Charly Black - Gyal You A Party Animal - CharlyBlackVEVO.mp3" },
  { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: album1, duration: "4:25", genre: "Pop", mood: "Happy", trackUrl: "/assets/halo - by beyonce (extended version) - Cristian Daniel Gonzalez Várgas 6-B.mp3" },
  { id: "14", title: "THE BAG Edition 6", artist: "Black Alpha Productions", albumArt: album2, duration: "3:40", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/assets/THE BAG Edition 6 Featuring DJ KYM NICKDEE - Black Alpha Productions.mp3" },
  { id: "15", title: "BACKBENCHER", artist: "TOXIC LYRIKALI", albumArt: album3, duration: "3:05", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/TOXIC LYRIKALI - BACKBENCHER (Official Video) - Toxic Lyrikali.mp3" },
  { id: "16", title: "Not Like Us", artist: "Kendrick Lamar", albumArt: album1, duration: "4:34", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Kendrick Lamar - Not Like Us - KendrickLamarVEVO.mp3" },
];

const playlists = [
  {
    id: "1",
    title: "My Favorites",
    description: "Your most loved tracks",
    image: album1,
    songCount: 10,
    songs: [
      { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: album1, duration: "3:42", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "4", title: "Electric Soul", artist: "Nova", albumArt: album1, duration: "3:21", genre: "R&B/Soul", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "6", title: "Starlight", artist: "Aurora", albumArt: album3, duration: "3:55", genre: "Pop", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: album1, duration: "3:30", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Vybz Kartel - God Is The Greatest (Official Music Video) - VybzKartelVEVO.mp3" },
      { id: "11", title: "Joro", artist: "Wizkid", albumArt: album2, duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Wizkid - Joro (Official Video) - WizkidVEVO.mp3" },
      { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: album1, duration: "4:25", genre: "Pop", mood: "Happy", trackUrl: "/assets/halo - by beyonce (extended version) - Cristian Daniel Gonzalez Várgas 6-B.mp3" },
      { id: "14", title: "THE BAG Edition 6", artist: "Black Alpha Productions", albumArt: album2, duration: "3:40", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/assets/THE BAG Edition 6 Featuring DJ KYM NICKDEE - Black Alpha Productions.mp3" },
      { id: "15", title: "BACKBENCHER", artist: "TOXIC LYRIKALI", albumArt: album3, duration: "3:05", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/TOXIC LYRIKALI - BACKBENCHER (Official Video) - Toxic Lyrikali.mp3" },
      { id: "9", title: "Let Go", artist: "Central Cee", albumArt: album3, duration: "2:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Central Cee - Let Go [Music Video] - Central Cee.mp3" },
      { id: "16", title: "Not Like Us", artist: "Kendrick Lamar", albumArt: album1, duration: "4:34", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Kendrick Lamar - Not Like Us - KendrickLamarVEVO.mp3" },
    ]
  },
  {
    id: "2",
    title: "Discover Weekly",
    description: "Fresh picks just for you",
    image: heroMusic,
    songCount: 10,
    songs: [
      { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: album2, duration: "4:15", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: album3, duration: "2:58", genre: "Lo-Fi", mood: "Meditating", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "5", title: "Midnight Run", artist: "Cyber Dreams", albumArt: album2, duration: "4:02", genre: "Electronic/EDM", mood: "Late Night", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "8", title: "Crocodile Teeth", artist: "Skillibeng", albumArt: album2, duration: "2:45", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Skillibeng - Crocodile Teeth (Official Music Video) - SkillibengVEVO.mp3" },
      { id: "10", title: "CHINJE", artist: "Toxic Lyrikali", albumArt: album1, duration: "3:20", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Toxic Lyrikali - CHINJE (Official Music Video) - Toxic Lyrikali.mp3" },
      { id: "12", title: "Gyal You A Party Animal", artist: "Charly Black", albumArt: album3, duration: "3:10", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Charly Black - Gyal You A Party Animal - CharlyBlackVEVO.mp3" },
      { id: "14", title: "THE BAG Edition 6", artist: "Black Alpha Productions", albumArt: album2, duration: "3:40", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/assets/THE BAG Edition 6 Featuring DJ KYM NICKDEE - Black Alpha Productions.mp3" },
      { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: album1, duration: "3:30", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/assets/Vybz Kartel - God Is The Greatest (Official Music Video) - VybzKartelVEVO.mp3" },
      { id: "9", title: "Let Go", artist: "Central Cee", albumArt: album3, duration: "2:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Central Cee - Let Go [Music Video] - Central Cee.mp3" },
      { id: "16", title: "Not Like Us", artist: "Kendrick Lamar", albumArt: album1, duration: "4:34", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Kendrick Lamar - Not Like Us - KendrickLamarVEVO.mp3" },
      { id: "17", title: "12 Days Of Christmas", artist: "Pentatonix", albumArt: album2, duration: "3:45", genre: "Pop", mood: "Happy", trackUrl: "/assets/Pentatonix - 12 Days Of Christmas (Official Video) - PentatonixVEVO.mp3" },
      { id: "18", title: "For Life", artist: "Runtown", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Runtown - For Life (Official Music Video) - Runtown.mp3" },
      { id: "19", title: "Shayi'Moto", artist: "Mellow & Sleazy, Scotts Maphuma & Mr Pilato ft. Seemah & Yanda Woods", albumArt: album1, duration: "4:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/assets/Mellow & Sleazy, Scotts Maphuma & Mr Pilato - Shayi'Moto (Lyrics) ft. Seemah & Yanda Woods - Unique Afrobeats.mp3" },
      { id: "20", title: "SMA (Vol. 1)", artist: "Nasty C ft. Rowlene", albumArt: album2, duration: "3:50", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Nasty C - SMA (Vol. 1) ft. Rowlene - NastyCVEVO.mp3" },
      { id: "21", title: "Taya", artist: "Okello Max", albumArt: album3, duration: "3:25", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Okello Max - Taya (Official Lyric Video) - Okello Max.mp3" },
      { id: "22", title: "BODYE", artist: "Olly Sholotan", albumArt: album1, duration: "3:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Olly Sholotan - BODYE [Official Music Video] - Olly Sholotan.mp3" },
      { id: "23", title: "Little Drummer Boy", artist: "Pentatonix", albumArt: album2, duration: "3:35", genre: "Pop", mood: "Happy", trackUrl: "/src/assets/[Official Video] Little Drummer Boy - Pentatonix - Pentatonix.mp3" },
      { id: "24", title: "Performance at Favor Mayian Thanksgiving", artist: "Agatha Naserian", albumArt: album3, duration: "4:20", genre: "Gospel", mood: "Happy", trackUrl: "/src/assets/AGATHA NASERIAN PERFORMANCE AT FAVOR MAYIAN THANKSGIVING - AGATHA NASERIAN.mp3" },
      { id: "25", title: "Come & Go", artist: "ArrDee", albumArt: album1, duration: "3:25", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/ArrDee - Come & Go (Official Music Video) - ArrDee.mp3" },
      { id: "26", title: "Achy Breaky Heart", artist: "Billy Ray Cyrus", albumArt: album2, duration: "3:45", genre: "Country", mood: "Happy", trackUrl: "/src/assets/Billy Ray Cyrus - Achy Breaky Heart (Official Music Video) - BillyRayCyrusVEVO.mp3" },
      { id: "27", title: "Jealousy", artist: "Ceeka RSA & Tyler ICU ft. Leemckrazy & Khalil Harrison", albumArt: album3, duration: "4:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/src/assets/Ceeka RSA & Tyler ICU - Jealousy (Australia Tour, Lyric Video) ft. Leemckrazy & Khalil Harrison - Tyler ICU.mp3" },
      { id: "28", title: "BAND4BAND", artist: "Central Cee ft. Lil Baby", albumArt: album1, duration: "3:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/CENTRAL CEE FT. LIL BABY - BAND4BAND (MUSIC VIDEO) - Central Cee.mp3" },
      { id: "29", title: "Residuals", artist: "Chris Brown", albumArt: album2, duration: "3:40", genre: "R&B/Soul", mood: "Chill", trackUrl: "/src/assets/Chris Brown - Residuals (Official Video) - ChrisBrownVEVO.mp3" },
      { id: "30", title: "Funds", artist: "Davido ft. ODUMODUBLVCK, Chike", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/src/assets/Davido - Funds (Official Video) ft. ODUMODUBLVCK, Chike - DavidoVEVO.mp3" },
      { id: "31", title: "I'm The One", artist: "DJ Khaled ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne", albumArt: album1, duration: "4:45", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "/src/assets/DJ Khaled - I'm The One ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne - DJKhaledVEVO.mp3" },
      { id: "32", title: "What If I Say", artist: "Fireboy DML", albumArt: album2, duration: "3:50", genre: "Afrobeat/Afropop/Amapiano", mood: "Chill", trackUrl: "/src/assets/Fireboy DML - What If I Say (Official Video) - FireboyDMLVEVO.mp3" },
      { id: "33", title: "SETE", artist: "K.O ft. Young Stunna, Blxckie", albumArt: album3, duration: "4:05", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/K.O - SETE (Official Music Video) ft. Young Stunna, Blxckie - KOOfficialVEVO.mp3" },
      { id: "34", title: "luther", artist: "Kendrick Lamar & SZA", albumArt: album1, duration: "4:20", genre: "Hip-Hop/Rap", mood: "Chill", trackUrl: "/src/assets/Kendrick Lamar & SZA - luther - KendrickLamarVEVO.mp3" },
      { id: "35", title: "Jolie", artist: "Khaid", albumArt: album2, duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/src/assets/Khaid - Jolie (Official Music Video) - Khaid.mp3" },
      { id: "36", title: "Balalu", artist: "Wakadinali", albumArt: album3, duration: "3:35", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "/src/assets/Wakadinali - Balalu  (Official Music Video) - Wakadinali.mp3" },
      { id: "37", title: "OOOUUU", artist: "Young M.A", albumArt: album1, duration: "4:00", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/Young M.A OOOUUU (Official Video) - Young MA.mp3" },
    ]
  },
  {
    id: "3",
    title: "Chill Mix",
    description: "Relax and unwind",
    image: album2,
    songCount: 6,
    songs: [
      { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: album3, duration: "2:58", genre: "Lo-Fi", mood: "Meditating", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: album1, duration: "3:42", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "6", title: "Starlight", artist: "Aurora", albumArt: album3, duration: "3:55", genre: "Pop", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: album2, duration: "4:15", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: album1, duration: "4:25", genre: "Pop", mood: "Happy", trackUrl: "/assets/halo - by beyonce (extended version) - Cristian Daniel Gonzalez Várgas 6-B.mp3" },
      { id: "5", title: "Midnight Run", artist: "Cyber Dreams", albumArt: album2, duration: "4:02", genre: "Electronic/EDM", mood: "Late Night", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
    ]
  },
  {
    id: "4",
    title: "Trending Hits",
    description: "Latest hot tracks everyone is listening to",
    image: album1,
    songCount: 8,
    songs: [
      { id: "25", title: "Come & Go", artist: "ArrDee", albumArt: album1, duration: "3:25", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "28", title: "BAND4BAND", artist: "Central Cee ft. Lil Baby", albumArt: album1, duration: "3:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "33", title: "SETE", artist: "K.O ft. Young Stunna, Blxckie", albumArt: album3, duration: "4:05", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "37", title: "OOOUUU", artist: "Young M.A", albumArt: album1, duration: "4:00", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "19", title: "Shayi'Moto", artist: "Mellow & Sleazy, Scotts Maphuma & Mr Pilato ft. Seemah & Yanda Woods", albumArt: album1, duration: "4:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "20", title: "SMA (Vol. 1)", artist: "Nasty C ft. Rowlene", albumArt: album2, duration: "3:50", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "21", title: "Taya", artist: "Okello Max", albumArt: album3, duration: "3:25", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "34", title: "luther", artist: "Kendrick Lamar & SZA", albumArt: album1, duration: "4:20", genre: "Hip-Hop/Rap", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
    ]
  },
  {
    id: "5",
    title: "Party Anthems",
    description: "High energy tracks for your next party",
    image: album2,
    songCount: 7,
    songs: [
      { id: "18", title: "For Life", artist: "Runtown", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "27", title: "Jealousy", artist: "Ceeka RSA & Tyler ICU ft. Leemckrazy & Khalil Harrison", albumArt: album3, duration: "4:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "30", title: "Funds", artist: "Davido ft. ODUMODUBLVCK, Chike", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "35", title: "Jolie", artist: "Khaid", albumArt: album2, duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "36", title: "Balalu", artist: "Wakadinali", albumArt: album3, duration: "3:35", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "21", title: "Taya", artist: "Okello Max", albumArt: album3, duration: "3:25", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "31", title: "I'm The One", artist: "DJ Khaled ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne", albumArt: album1, duration: "4:45", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
    ]
  },
  {
    id: "6",
    title: "Chill Vibes",
    description: "Smooth tracks to relax and unwind",
    image: album3,
    songCount: 6,
    songs: [
      { id: "29", title: "Residuals", artist: "Chris Brown", albumArt: album2, duration: "3:40", genre: "R&B/Soul", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "32", title: "What If I Say", artist: "Fireboy DML", albumArt: album2, duration: "3:50", genre: "Afrobeat/Afropop/Amapiano", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "34", title: "luther", artist: "Kendrick Lamar & SZA", albumArt: album1, duration: "4:20", genre: "Hip-Hop/Rap", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: album1, duration: "3:30", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: album1, duration: "4:25", genre: "Pop", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "14", title: "THE BAG Edition 6", artist: "Black Alpha Productions", albumArt: album2, duration: "3:40", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
    ]
  },
  {
    id: "7",
    title: "Workout Motivation",
    description: "Pump up tracks for your gym session",
    image: album1,
    songCount: 3,
    songs: [
      { id: "22", title: "BODYE", artist: "Olly Sholotan", albumArt: album1, duration: "3:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Olly Sholotan - BODYE [Official Music Video] - Olly Sholotan.mp3" },
      { id: "15", title: "BACKBENCHER", artist: "TOXIC LYRIKALI", albumArt: album3, duration: "3:05", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/TOXIC LYRIKALI - BACKBENCHER (Official Video) - Toxic Lyrikali.mp3" },
      { id: "10", title: "CHINJE", artist: "Toxic Lyrikali", albumArt: album1, duration: "3:20", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Toxic Lyrikali - CHINJE (Official Music Video) - Toxic Lyrikali.mp3" },
    ]
  },
  {
    id: "8",
    title: "Happy Tunes",
    description: "Uplifting songs to brighten your day",
    image: album2,
    songCount: 4,
    songs: [
      { id: "17", title: "12 Days Of Christmas", artist: "Pentatonix", albumArt: album2, duration: "3:45", genre: "Pop", mood: "Happy", trackUrl: "/assets/Pentatonix - 12 Days Of Christmas (Official Video) - PentatonixVEVO.mp3" },
      { id: "23", title: "Little Drummer Boy", artist: "Pentatonix", albumArt: album2, duration: "3:35", genre: "Pop", mood: "Happy", trackUrl: "/assets/[Official Video] Little Drummer Boy - Pentatonix - Pentatonix.mp3" },
      { id: "24", title: "Performance at Favor Mayian Thanksgiving", artist: "Agatha Naserian", albumArt: album3, duration: "4:20", genre: "Gospel", mood: "Happy", trackUrl: "/assets/AGATHA NASERIAN PERFORMANCE AT FAVOR MAYIAN THANKSGIVING - AGATHA NASERIAN.mp3" },
      { id: "26", title: "Achy Breaky Heart", artist: "Billy Ray Cyrus", albumArt: album2, duration: "3:45", genre: "Country", mood: "Happy", trackUrl: "/assets/Billy Ray Cyrus - Achy Breaky Heart (Official Music Video) - BillyRayCyrusVEVO.mp3" },
    ]
  },
  {
    id: "9",
    title: "Afrobeat Collection",
    description: "Finest African beats and rhythms",
    image: album3,
    songCount: 8,
    songs: [
      { id: "18", title: "For Life", artist: "Runtown", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Runtown - For Life (Official Music Video) - Runtown.mp3" },
      { id: "27", title: "Jealousy", artist: "Ceeka RSA & Tyler ICU ft. Leemckrazy & Khalil Harrison", albumArt: album3, duration: "4:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Ceeka RSA & Tyler ICU - Jealousy (Australia Tour, Lyric Video) ft. Leemckrazy & Khalil Harrison - Tyler ICU.mp3" },
      { id: "30", title: "Funds", artist: "Davido ft. ODUMODUBLVCK, Chike", albumArt: album3, duration: "3:30", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Davido - Funds (Official Video) ft. ODUMODUBLVCK, Chike - DavidoVEVO.mp3" },
      { id: "32", title: "What If I Say", artist: "Fireboy DML", albumArt: album2, duration: "3:50", genre: "Afrobeat/Afropop/Amapiano", mood: "Chill", trackUrl: "/assets/Fireboy DML - What If I Say (Official Video) - FireboyDMLVEVO.mp3" },
      { id: "35", title: "Jolie", artist: "Khaid", albumArt: album2, duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Khaid - Jolie (Official Music Video) - Khaid.mp3" },
      { id: "19", title: "Shayi'Moto", artist: "Mellow & Sleazy, Scotts Maphuma & Mr Pilato ft. Seemah & Yanda Woods", albumArt: album1, duration: "4:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/assets/Mellow & Sleazy, Scotts Maphuma & Mr Pilato - Shayi'Moto (Lyrics) ft. Seemah & Yanda Woods - Unique Afrobeats.mp3" },
      { id: "21", title: "Taya", artist: "Okello Max", albumArt: album3, duration: "3:25", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/assets/Okello Max - Taya (Official Lyric Video) - Okello Max.mp3" },
      { id: "22", title: "BODYE", artist: "Olly Sholotan", albumArt: album1, duration: "3:10", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/assets/Olly Sholotan - BODYE [Official Music Video] - Olly Sholotan.mp3" },
    ]
  },
  {
    id: "10",
    title: "Hip-Hop Central",
    description: "Best hip-hop and rap tracks",
    image: album1,
    songCount: 9,
    songs: [
      { id: "25", title: "Come & Go", artist: "ArrDee", albumArt: album1, duration: "3:25", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/ArrDee - Come & Go (Official Music Video) - ArrDee.mp3" },
      { id: "28", title: "BAND4BAND", artist: "Central Cee ft. Lil Baby", albumArt: album1, duration: "3:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/CENTRAL CEE FT. LIL BABY - BAND4BAND (MUSIC VIDEO) - Central Cee.mp3" },
      { id: "33", title: "SETE", artist: "K.O ft. Young Stunna, Blxckie", albumArt: album3, duration: "4:05", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/K.O - SETE (Official Music Video) ft. Young Stunna, Blxckie - KOOfficialVEVO.mp3" },
      { id: "37", title: "OOOUUU", artist: "Young M.A", albumArt: album1, duration: "4:00", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Young M.A OOOUUU (Official Video) - Young MA.mp3" },
      { id: "20", title: "SMA (Vol. 1)", artist: "Nasty C ft. Rowlene", albumArt: album2, duration: "3:50", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Nasty C - SMA (Vol. 1) ft. Rowlene - NastyCVEVO.mp3" },
      { id: "36", title: "Balalu", artist: "Wakadinali", albumArt: album3, duration: "3:35", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "/assets/Wakadinali - Balalu  (Official Music Video) - Wakadinali.mp3" },
      { id: "16", title: "Not Like Us", artist: "Kendrick Lamar", albumArt: album1, duration: "4:34", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/assets/Kendrick Lamar - Not Like Us - KendrickLamarVEVO.mp3" },
      { id: "31", title: "I'm The One", artist: "DJ Khaled ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne", albumArt: album1, duration: "4:45", genre: "Hip-Hop/Rap", mood: "Party", trackUrl: "/assets/DJ Khaled - I'm The One ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne - DJKhaledVEVO.mp3" },
      { id: "34", title: "luther", artist: "Kendrick Lamar & SZA", albumArt: album1, duration: "4:20", genre: "Hip-Hop/Rap", mood: "Chill", trackUrl: "/assets/Kendrick Lamar & SZA - luther - KendrickLamarVEVO.mp3" },
    ]
  },
  {
    id: "11",
    title: "Holiday Classics",
    description: "Festive songs for the holiday season",
    image: album2,
    songCount: 2,
    songs: [
      { id: "17", title: "12 Days Of Christmas", artist: "Pentatonix", albumArt: album2, duration: "3:45", genre: "Pop", mood: "Happy", trackUrl: "/assets/Pentatonix - 12 Days Of Christmas (Official Video) - PentatonixVEVO.mp3" },
      { id: "23", title: "Little Drummer Boy", artist: "Pentatonix", albumArt: album2, duration: "3:35", genre: "Pop", mood: "Happy", trackUrl: "/assets/[Official Video] Little Drummer Boy - Pentatonix - Pentatonix.mp3" },
    ]
  }
];

const moodModes = [
  { key: 'All', icon: MusicIcon, color: 'bg-primary' },
  { key: 'Chill', icon: Moon, color: 'bg-blue-500' },
  { key: 'Meditating', icon: Moon, color: 'bg-purple-500' },
  { key: 'Happy', icon: Smile, color: 'bg-yellow-500' },
  { key: 'Party', icon: Zap, color: 'bg-pink-500' },
  { key: 'Sad', icon: Frown, color: 'bg-gray-500' },
  { key: 'Workout', icon: Dumbbell, color: 'bg-red-500' },
  { key: 'Late Night', icon: Moon, color: 'bg-indigo-500' },
  { key: 'Trending', icon: TrendingUp, color: 'bg-green-500' },
];

const genres = [
  'All', 'Pop', 'Hip-Hop/Rap', 'R&B/Soul', 'Rock', 'Electronic/EDM', 'Jazz', 'Blues', 'Classical', 'Gospel', 'Reggae/Dancehall', 'Afrobeat/Afropop/Amapiano', 'Latin', 'Country', 'Folk', 'Indie', 'K-Pop/J-Pop/C-Pop', 'Bollywood/Indian Classical & Pop', 'Arabic/Middle Eastern', 'Caribbean', 'Lo-Fi', 'Instrumental', 'Soundtracks/Scores', 'Experimental/Alternative'
];

const Music = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "all" | "playlists" | "liked">("all");
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<typeof playlists[0] | null>(null);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  const filteredSongs = allSongs.filter(
    (song) =>
      (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedGenre === "All" || song.genre === selectedGenre) &&
      (selectedMood === "All" || song.mood === selectedMood)
  );

  // Auto-switch to search results when user starts typing
  useEffect(() => {
    if (searchQuery && activeTab !== "search") {
      setActiveTab("search");
    }
  }, [searchQuery, activeTab]);

  const currentMood = moodModes.find(m => m.key === selectedMood);

  const handlePlaylistClick = (playlist: typeof playlists[0]) => {
    setSelectedPlaylist(playlist);
  };

  const handleBackToMusic = () => {
    setSelectedPlaylist(null);
  };

  // Auto-hide bottom nav when music is playing (media controls stay visible)
  const resetHideTimer = () => {
    setShowBottomNav(true);
    lastInteractionRef.current = Date.now();

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Hide bottom nav after 4 seconds of inactivity (media controls stay visible)
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowBottomNav(false);
    }, 4000);
  };

  // Show controls on user interaction
  const handleUserInteraction = () => {
    resetHideTimer();
  };

  // Effect to handle media controls visibility
  useEffect(() => {
    // Add event listeners for user interactions
    const handleInteraction = () => handleUserInteraction();

    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    // Start the hide timer initially
    resetHideTimer();

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);

      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Effect to reset timer when playlist changes
  useEffect(() => {
    resetHideTimer();
  }, [selectedPlaylist]);

  // Handle navigation state from home page
  useEffect(() => {
    const state = location.state as {
      selectedPlaylist?: string;
      showRecentlyPlayed?: boolean;
      playSong?: any;
      songIndex?: number;
      fromHome?: boolean;
      activeTab?: string;
    };
    if (state) {
      if (state.selectedPlaylist) {
        // Find and select the specific playlist
        const playlist = playlists.find(p => p.id === state.selectedPlaylist);
        if (playlist) {
          setSelectedPlaylist(playlist);
        }
      } else if (state.showRecentlyPlayed) {
        // Show recently played/all songs view
        setActiveTab("all");
        // Could add a filter for recently played songs here
      } else if (state.playSong && state.fromHome) {
        // Play specific song from home page
        setActiveTab("all");
        // The song will be played automatically by the SongCard onClick handler
        // which is triggered when navigating from home
      } else if (state.activeTab === 'search') {
        // Navigate from home page search icon - show search bar
        setShowSearchBar(true);
        setActiveTab("search");
        // Focus the search input after a short delay
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 100);
      }
    }
  }, [location.state]);

  // Always show media controls when music is playing
  // (This is handled by the MediaControls component itself based on current track)

  // Playlist View Component
  const PlaylistView = ({ playlist }: { playlist: typeof playlists[0] }) => (
    <Layout hideBottomNav={!showBottomNav}>
      <div className={`min-h-screen ${currentMood?.color || 'bg-background'} transition-colors duration-500`}>
      {/* Playlist Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 glass-card rounded-b-3xl"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={handleBackToMusic}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Playlist</h1>
          </div>

          {/* Playlist Info */}
          <div className="flex items-end gap-4">
            <img
              src={playlist.image}
              alt={playlist.title}
              className="w-32 h-32 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{playlist.title}</h2>
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
              <p className="text-sm text-muted-foreground">{playlist.songCount} songs</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Playlist Songs */}
      <div className="px-4 mt-6">
        <div className="space-y-2">
          {playlist.songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SongCard
                title={song.title}
                artist={song.artist}
                albumArt={song.albumArt}
                duration={song.duration}
                trackUrl={song.trackUrl}
                playlist={playlist.songs.map(s => ({
                  id: `${s.title}-${s.artist}`,
                  title: s.title,
                  artist: s.artist,
                  album: playlist.title,
                  duration: 180,
                  url: s.trackUrl,
                  artwork: s.albumArt,
                }))}
                currentIndex={index}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Media Controls for Playlist - Always visible when playing */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border"
      >
        <MediaControls showDeviceControls />
      </motion.div>

      {/* Add padding to prevent content from being hidden behind fixed controls */}
      <div className="pb-32"></div>
      </div>
    </Layout>
  );

  return (
    <Layout hideBottomNav={!showBottomNav}>
      {selectedPlaylist ? (
        <PlaylistView playlist={selectedPlaylist} />
      ) : (
        <div className={`min-h-screen ${currentMood?.color || 'bg-background'} transition-colors duration-500`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">Music</h1>
              <ThemeToggle />
            </div>

            {/* Mood Selector */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Mood Mode</h3>
              <div className="flex gap-2 overflow-x-auto">
                {moodModes.map((mood) => (
                  <Button
                    key={mood.key}
                    variant={selectedMood === mood.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood.key)}
                    className="gap-1 flex-shrink-0"
                  >
                    <mood.icon className="w-4 h-4" />
                    {mood.key}
                  </Button>
                ))}
              </div>
            </div>


            {/* Genre Tabs */}
            <div className="mt-4">
              <Tabs value={selectedGenre} onValueChange={setSelectedGenre}>
                <TabsList className="w-full justify-start h-auto overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1 px-1">
                    {genres.slice(0, 8).map((genre) => (
                      <TabsTrigger key={genre} value={genre} className="text-xs px-3 py-1 whitespace-nowrap flex-shrink-0">
                        {genre}
                      </TabsTrigger>
                    ))}
                  </div>
                </TabsList>
              </Tabs>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
              </Button>
              {[
                { key: "all", label: "All Songs", icon: ListMusic },
                { key: "playlists", label: "Playlists", icon: Clock },
                { key: "liked", label: "Liked", icon: Heart },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.key as any)}
                  className="gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Bar - Show when search icon is clicked */}
            {showSearchBar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setActiveTab("search")}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Popular Artists */}
                <div className="flex flex-wrap gap-2">
                  {['Beyoncé', 'Kendrick Lamar', 'Wizkid', 'Drake', 'Burna Boy'].map((artist) => (
                    <Button
                      key={artist}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery(artist)}
                      className="text-xs px-3 py-1 h-8"
                    >
                      {artist}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Search Results Section */}
        {activeTab === "search" && searchQuery && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 mt-6"
          >
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Search Results for "{searchQuery}"</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSongs.slice(0, 20).map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <SongCard
                      title={song.title}
                      artist={song.artist}
                      albumArt={song.albumArt}
                      duration={song.duration}
                      trackUrl={song.trackUrl}
                      playlist={filteredSongs.map(s => ({
                        id: `${s.title}-${s.artist}`,
                        title: s.title,
                        artist: s.artist,
                        album: 'Search Results',
                        duration: 180,
                        url: s.trackUrl,
                        artwork: s.albumArt,
                      }))}
                      currentIndex={index}
                    />
                  </motion.div>
                ))}
              </div>
              {filteredSongs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No songs found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Discovery Section - Moved to top of Listening Groups */}
        {activeTab !== "search" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 mt-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Discover {selectedGenre}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {playlists.slice(0, 4).map((playlist) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FeaturedPlaylist
                    title={playlist.title}
                    description={playlist.description}
                    image={playlist.image}
                    songCount={playlist.songCount}
                    onClick={() => handlePlaylistClick(playlist)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Listening Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Listening Groups
            </h3>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Chill Session</p>
                <p className="text-sm text-muted-foreground">3 members • Now playing</p>
              </div>
              <Button variant="outline" size="sm">
                Join
              </Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Workout Mix</p>
                <p className="text-sm text-muted-foreground">5 members • Paused</p>
              </div>
              <Button variant="outline" size="sm">
                Join
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mt-6"
        >
          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1 gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle All
            </Button>
            <Button variant="glass" className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Play All
            </Button>
          </div>
        </motion.section>


        {/* Playlists Section */}
        {activeTab === "playlists" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Your Playlists</h3>
              <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    <Plus className="w-4 h-4" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="playlist-name">Playlist Name</Label>
                      <Input
                        id="playlist-name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Enter playlist name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="playlist-description">Description (optional)</Label>
                      <Textarea
                        id="playlist-description"
                        value={newPlaylistDescription}
                        onChange={(e) => setNewPlaylistDescription(e.target.value)}
                        placeholder="Enter playlist description"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatePlaylistOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        // TODO: Create playlist API call
                        console.log('Create playlist:', newPlaylistName, newPlaylistDescription);
                        setNewPlaylistName("");
                        setNewPlaylistDescription("");
                        setIsCreatePlaylistOpen(false);
                      }}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
              {playlists.map((playlist) => (
                <FeaturedPlaylist
                  key={playlist.id}
                  title={playlist.title}
                  description={playlist.description}
                  image={playlist.image}
                  songCount={playlist.songCount}
                  onClick={() => handlePlaylistClick(playlist)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Songs List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {activeTab === "liked" ? "Liked Songs" : selectedGenre === "All" ? "All Songs" : `${selectedGenre} Songs`}
            </h3>
            <span className="text-sm text-muted-foreground">
              {filteredSongs.length} songs
            </span>
          </div>
          <div className="space-y-2">
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <SongCard
                  title={song.title}
                  artist={song.artist}
                  albumArt={song.albumArt}
                  duration={song.duration}
                  isPlaying={index === 0}
                  trackUrl={song.trackUrl}
                  playlist={filteredSongs.map(s => ({
                    id: `${s.title}-${s.artist}`,
                    title: s.title,
                    artist: s.artist,
                    album: 'Clockit',
                    duration: 180,
                    url: s.trackUrl,
                    artwork: s.albumArt,
                  }))}
                  currentIndex={index}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>


          {/* Media Controls - Always visible when playing */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border"
          >
            <MediaControls showDeviceControls />
          </motion.div>

          {/* Hidden Bottom Nav Indicator */}
          {!showBottomNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20"
              onClick={() => setShowBottomNav(true)}
            >
              <div className="bg-secondary/20 backdrop-blur-sm rounded-full p-2 cursor-pointer hover:bg-secondary/30 transition-colors">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Add padding to prevent content from being hidden behind fixed controls */}
          <div className="pb-32"></div>
        </div>
      )}
    </Layout>
  );
};

export default Music;
