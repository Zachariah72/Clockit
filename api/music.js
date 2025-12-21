const mongoose = require('mongoose');
const MusicReference = require('../../backend/src/models/MusicReference');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // For now, return mock data since we don't have real music data in DB
    const mockSongs = [
      { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: "/src/assets/album-1.jpg", duration: "3:42", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: "/src/assets/album-2.jpg", duration: "4:15", genre: "Electronic/EDM", mood: "Chill", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: "/src/assets/album-3.jpg", duration: "2:58", genre: "Lo-Fi", mood: "Meditating", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "4", title: "Electric Soul", artist: "Nova", albumArt: "/src/assets/album-1.jpg", duration: "3:21", genre: "R&B/Soul", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "5", title: "Midnight Run", artist: "Cyber Dreams", albumArt: "/src/assets/album-2.jpg", duration: "4:02", genre: "Electronic/EDM", mood: "Late Night", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "6", title: "Starlight", artist: "Aurora", albumArt: "/src/assets/album-3.jpg", duration: "3:55", genre: "Pop", mood: "Happy", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
      { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: "/src/assets/album-1.jpg", duration: "3:30", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/src/assets/Vybz Kartel - God Is The Greatest (Official Music Video) - VybzKartelVEVO.mp3" },
      { id: "8", title: "Crocodile Teeth", artist: "Skillibeng", albumArt: "/src/assets/album-2.jpg", duration: "2:45", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/src/assets/Skillibeng - Crocodile Teeth (Official Music Video) - SkillibengVEVO.mp3" },
      { id: "9", title: "Let Go", artist: "Central Cee", albumArt: "/src/assets/album-3.jpg", duration: "2:55", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/Central Cee - Let Go [Music Video] - Central Cee.mp3" },
      { id: "10", title: "CHINJE", artist: "Toxic Lyrikali", albumArt: "/src/assets/album-1.jpg", duration: "3:20", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/src/assets/Toxic Lyrikali - CHINJE (Official Music Video) - Toxic Lyrikali.mp3" },
      { id: "11", title: "Joro", artist: "Wizkid", albumArt: "/src/assets/album-2.jpg", duration: "3:15", genre: "Afrobeat/Afropop/Amapiano", mood: "Party", trackUrl: "/src/assets/Wizkid - Joro (Official Video) - WizkidVEVO.mp3" },
      { id: "12", title: "Gyal You A Party Animal", artist: "Charly Black", albumArt: "/src/assets/album-3.jpg", duration: "3:10", genre: "Reggae/Dancehall", mood: "Party", trackUrl: "/src/assets/Charly Black - Gyal You A Party Animal - CharlyBlackVEVO.mp3" },
      { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: "/src/assets/album-1.jpg", duration: "4:25", genre: "Pop", mood: "Happy", trackUrl: "/src/assets/halo - by beyonce (extended version) - Cristian Daniel Gonzalez Várgas 6-B.mp3" },
      { id: "14", title: "THE BAG Edition 6", artist: "Black Alpha Productions", albumArt: "/src/assets/album-2.jpg", duration: "3:40", genre: "Afrobeat/Afropop/Amapiano", mood: "Trending", trackUrl: "/src/assets/THE BAG Edition 6 Featuring DJ KYM NICKDEE - Black Alpha Productions.mp3" },
      { id: "15", title: "BACKBENCHER", artist: "TOXIC LYRIKALI", albumArt: "/src/assets/album-3.jpg", duration: "3:05", genre: "Afrobeat/Afropop/Amapiano", mood: "Workout", trackUrl: "/src/assets/TOXIC LYRIKALI - BACKBENCHER (Official Video) - Toxic Lyrikali.mp3" },
      { id: "16", title: "Not Like Us", artist: "Kendrick Lamar", albumArt: "/src/assets/album-1.jpg", duration: "4:34", genre: "Hip-Hop/Rap", mood: "Trending", trackUrl: "/src/assets/Kendrick Lamar - Not Like Us - KendrickLamarVEVO.mp3" },
    ];

    // Filter by query params
    let filteredSongs = mockSongs;

    if (req.query.genre && req.query.genre !== 'All') {
      filteredSongs = filteredSongs.filter(song => song.genre === req.query.genre);
    }

    if (req.query.mood) {
      filteredSongs = filteredSongs.filter(song => song.mood === req.query.mood);
    }

    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredSongs = filteredSongs.filter(song =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
      );
    }

    res.json(filteredSongs);

  } catch (error) {
    console.error('Music API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};