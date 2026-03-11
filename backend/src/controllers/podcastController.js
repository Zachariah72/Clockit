// Placeholder for future 3rd-party API integration (e.g., ListenNotes or Spotify)

const getFeaturedPodcasts = async (req, res) => {
    try {
        // TODO: Replace with actual API call (e.g., axios.get('https://listen-api.listennotes.com/api/v2/best_podcasts'))
        const featuredPodcasts = [
            {
                id: "1",
                title: "Tech Talk Daily",
                host: "Sarah Chen",
                description: "Daily insights into the latest technology trends and innovations",
                episodes: 245,
                duration: "45 min",
                rating: 4.8,
                category: "Technology",
                image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
                isSubscribed: false,
            },
            {
                id: "2",
                title: "Mindful Moments",
                host: "Dr. James Wilson",
                description: "Guided meditations and mindfulness practices for busy professionals",
                episodes: 120,
                duration: "20 min",
                rating: 4.9,
                category: "Wellness",
                image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
                isSubscribed: true,
            },
            {
                id: "3",
                title: "Business Breakthrough",
                host: "Maria Rodriguez",
                description: "Strategies and stories from successful entrepreneurs",
                episodes: 89,
                duration: "35 min",
                rating: 4.7,
                category: "Business",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=400&q=80",
                isSubscribed: false,
            },
        ];

        res.json({ podcasts: featuredPodcasts });
    } catch (err) {
        console.error('Error fetching featured podcasts:', err);
        res.status(500).json({ message: 'Server error while fetching podcasts' });
    }
};

const getPodcastCategories = async (req, res) => {
    try {
        // TODO: Replace with actual API call
        const categories = [
            "All", "Technology", "Business", "Wellness", "News", "Comedy", "Education", "True Crime"
        ];
        res.json({ categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchPodcasts = async (req, res) => {
    try {
        const { q } = req.query;
        // TODO: Replace with actual API search query
        res.json({ results: [], query: q });
    } catch (err) {
        console.error('Error searching podcasts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getFeaturedPodcasts,
    getPodcastCategories,
    searchPodcasts
};
