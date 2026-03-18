const fs = require('fs');
let c = fs.readFileSync('src/pages/Index.tsx', 'utf8');

c = c.replace(
  '  const dropdownRef = useRef(null);',
  `  const dropdownRef = useRef(null);\n\n  const [playlists, setPlaylists] = useState<any[]>(FEATURED_PLAYLISTS);\n\n  useEffect(() => {\n    const fetchPlaylists = async () => {\n      try {\n        const data = await getUserPlaylists();\n        if (data && data.length > 0) {\n          const formatted = data.map((p: any) => ({\n            id: p._id || p.id,\n            title: p.name,\n            description: p.description || 'Clockit Playlist',\n            image: p.coverImage || 'https://picsum.photos/seed/playlist/300/300',\n            songCount: p.tracks?.length || 0,\n          }));\n          setPlaylists(formatted.slice(0, 4));\n        }\n      } catch (err) {\n        console.error("Failed to fetch playlists:", err);\n      }\n    };\n    fetchPlaylists();\n  }, []);`
);

c = c.replace(
  /<FeaturedPlaylist\s+title="Trending Now"\s+description="The hottest tracks right now"\s+image=\{heroMusicImage\}\s+songCount=\{50\}\s+onPlay=\{handlePlayTrending\}\s+\/>/,
  `<FeaturedPlaylist\n                  title="Trending Now"\n                  description="The hottest tracks right now"\n                  image={heroMusicImage}\n                  songCount={50}\n                  onPlay={handlePlayTrending}\n                  onClick={() => navigate('/music')}\n                />`
);

c = c.replace(
  /<button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">\s*See all\s*<\/button>/,
  `<button \n                    className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"\n                    onClick={() => navigate('/music')}\n                  >\n                    See all\n                  </button>`
);

c = c.replace(
  /\{FEATURED_PLAYLISTS\.map\(\s*\(playlist\)\s*=>\s*\([\s\S]*?<FeaturedPlaylist[\s\S]*?key=\{playlist\.id\}[\s\S]*?\/>\s*\)\s*\)\}/,
  `{playlists.map((playlist) => (\n                    <FeaturedPlaylist\n                      key={playlist.id}\n                      title={playlist.title}\n                      description={playlist.description}\n                      image={playlist.image}\n                      songCount={playlist.songCount}\n                      onPlay={handlePlayTrending}\n                      onClick={() => navigate(\`/music?playlist=\${playlist.id}\`)}\n                    />\n                  ))}`
);

fs.writeFileSync('src/pages/Index.tsx', c);
console.log('Done!');
