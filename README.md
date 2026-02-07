# Clockit - Social Music & Media Platform

A comprehensive social media and music streaming platform built with React, TypeScript, Node.js, and MongoDB. Features TikTok-style video sharing, Spotify-like music streaming, Snapchat-style stories, and real-time social interactions.

## 🚀 Features

### Core Platform Features
- **Short-form Video Creation** - Record and edit videos up to 10 minutes
- **Music Streaming** - Full-featured music player with playlists and discovery
- **Social Stories** - Share disappearing photos and videos
- **Real-time Chat** - Group messaging with media sharing
- **Live Streaming** - Go live with audience interaction
- **Artist Following** - Follow favorite artists and get notifications
- **Playlist Creation** - Create and share music playlists
- **Listening Groups** - Synchronized music listening with friends

### Technical Features
- **PWA Support** - Installable progressive web app
- **Offline Playback** - Download music for offline listening
- **Bluetooth Integration** - Connect wireless audio devices
- **Cross-platform** - Responsive design for all devices
- **Real-time Updates** - WebSocket-powered live features

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **OAuth** (Google, Facebook, Apple)

### DevOps
- **Vercel** for frontend deployment
- **MongoDB Atlas** for database
- **PWA** with service workers

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Vercel account
- Supabase account (optional)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/clockit.git
cd clockit
```

### 2. Install dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 3. Environment Setup
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 4. Configure environment variables
Edit `.env` and `backend/.env` with your API keys and database URLs.

### 5. Start development servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm run dev
```

## 🌐 Vercel Deployment

### Frontend Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy Frontend**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add the following:
     ```
     VITE_API_URL=https://your-backend-url.com
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Backend Deployment Options

#### Option 1: Vercel Serverless Functions
1. Restructure backend routes as API functions
2. Deploy backend to Vercel
3. Update frontend API calls

#### Option 2: Railway/Render (Recommended)
1. **Create account** on Railway or Render
2. **Connect repository** and deploy
3. **Set environment variables**:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   GOOGLE_CLIENT_ID=...
   FACEBOOK_APP_ID=...
   ```

#### Option 3: Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Database Setup

1. **Create MongoDB Atlas cluster**
2. **Get connection string**
3. **Add IP whitelist** (0.0.0.0/0 for development)
4. **Create database user**

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (backend/.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clockit
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

## 📱 PWA Installation

The app includes PWA support for installation on devices:

1. **Build for production**: `npm run build`
2. **Deploy to Vercel**
3. **Users can install** from browser menu on mobile/desktop

## 🎵 Music Features

- **16 Pre-loaded songs** with trending artists
- **Playlist management** with create/edit/delete
- **Mood-based filtering** (Chill, Party, Workout, etc.)
- **Genre categorization** (Afrobeat, Reggae, Hip-Hop, etc.)
- **Bluetooth device connectivity**
- **Offline download support** (Premium)

## 🎬 Video Features

- **Short-form videos** with TikTok-style interface
- **Duet and Stitch** functionality
- **AR filters and effects**
- **Video editing tools**
- **Real-time comments**

## 💬 Social Features

- **Stories** with 24-hour expiration
- **Group chat** with media sharing
- **Live streaming** with real-time interaction
- **Artist following** and notifications
- **Friend connections** and discovery

## 🔐 Authentication

- **Email/password** registration
- **OAuth integration** (Google, Facebook, Apple)
- **JWT tokens** for session management
- **Profile customization**

## 📊 Analytics & Insights

- **Listening history** tracking
- **Clockit Wrapped** annual statistics
- **Artist analytics** (for creators)
- **Content performance** metrics

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check VITE_API_URL in Vercel environment variables
   - Ensure backend is running and accessible

2. **Database Connection**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string format

3. **PWA Not Installing**
   - Ensure HTTPS in production
   - Check service worker registration

4. **Media Playback Issues**
   - Check audio file URLs
   - Verify CORS settings on backend

5. **OAuth Sign-in Not Working (ERR_CONNECTION_REFUSED)**
   - Ensure all redirect URLs are added to Supabase dashboard (see below)
   - Add both development and production URLs to Supabase

## 🔐 Supabase OAuth Configuration

### Required Redirect URLs

Add the following URLs to your Supabase project's **Authentication > Providers > OAuth Redirect URLs**:

**Development:**
- `http://localhost:5173/auth/callback`
- `http://localhost:5173/`

**Production (Vercel):**
- `https://your-vercel-app.vercel.app/auth/callback`
- `https://your-vercel-app.vercel.app/`

### Steps to Configure:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Click on the OAuth provider (Google, Facebook, Apple)
5. Add all redirect URLs in the **Redirect URLs** field (one per line):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/
   https://your-vercel-domain.vercel.app/auth/callback
   https://your-vercel-domain.vercel.app/
   ```
6. Save changes

### Why This Fix Works:

- Uses `window.location.origin` to dynamically determine the correct domain
- Creates a dedicated `/auth/callback` route to handle OAuth redirects
- Works seamlessly in both development (localhost) and production (Vercel)
- No hardcoded URLs means automatic environment adaptation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by leading social media platforms
- Community-driven development

## 📞 Support

For support, email support@clockit.com or create an issue on GitHub.

---

**Clockit** - Where music meets social connection! 🎵🤝
