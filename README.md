# Clockit - Social Music & Media Platform

A comprehensive social media and music streaming platform built with React, TypeScript, Node.js, and MongoDB. Features TikTok-style video sharing, Spotify-like music streaming, Snapchat-style stories, and real-time social interactions.

## 🚀 Features

### Core Platform Features
- **Home Feed:** Discover trending music, featured playlists, and community posts.
- **Short-form Video Creation** - Record and edit videos with TikTok-style interface
- **Music Streaming** - Full-featured music player with playlists and discovery
- **Social Stories** - Share disappearing photos and videos (Snapchat-style)
- **Real-time Chat** - Group messaging with media sharing
- **Live Streaming** - Go live with audience interaction
- **Genre & Community Sections:** Explore music by genre and connect with other users.
- **Artist Following** - Follow favorite artists and get notifications
- **Playlist Creation** - Create and share music playlists
- **Listening Groups** - Synchronized music listening with friends
- **Reels & Snappy Sections:** Enjoy short-form music content and highlights
- **Full & Mini Player:** Listen to music with a full-featured player or a compact mini player
- **Sidebar & Navigation:** Easy navigation with a sidebar, bottom navigation, and right panel

### Technical Features
- **PWA Support** - Installable progressive web app with offline functionality
- **Offline Playback** - Download music for offline listening (Premium)
- **Bluetooth Integration** - Connect wireless audio devices
- **Cross-platform** - Responsive design for all devices
- **Real-time Updates** - WebSocket-powered live features

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and fast development
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
- Vercel account (for deployment)
- Supabase account (optional, for OAuth)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/clockitapp.git
cd clockitapp

2. Install Dependencies

npm install
cd backend && npm install && cd ..

3. Environment Set Up

cp .env.example .env
cp backend/.env.example backend/.env

4. Configure Environment Variables

Edit .env and backend/.env with your API keys and database URLs

5. Start development servers

# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm run dev

Open your browser and navigate to http://localhost:5173

📁 Project Structure

clockitapp/
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── pwa-*.png
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── music/
│   │   ├── stories/
│   │   ├── video/
│   │   └── ui/
│   ├── pages/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json

🌐 Deployment
Frontend Deployment (Vercel)
Install Vercel CLI

bash
npm i -g vercel
vercel login
Deploy

bash
vercel --prod
Set Environment Variables in Vercel

Go to your Vercel dashboard → Settings → Environment Variables

Add:

text
VITE_API_URL=https://your-backend-url.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Backend Deployment Options
Option 1: Railway/Render (Recommended)
Create account on Railway or Render

Connect repository and deploy

Set environment variables

Option 2: Heroku
bash
heroku create your-app-name
git push heroku main
🎵 Music Features
16+ Pre-loaded songs with trending artists

Playlist management with create/edit/delete

Mood-based filtering (Chill, Party, Workout, etc.)

Genre categorization (Afrobeat, Reggae, Hip-Hop, etc.)

Bluetooth device connectivity

Offline download support (Premium)

📱 PWA Installation
The app includes PWA support for installation on devices:

Build for production: npm run build

Deploy to Vercel

Users can install from browser menu on mobile/desktop

🔐 Authentication
Email/password registration

OAuth integration (Google, Facebook, Apple)

JWT tokens for session management

Profile customization

Supabase OAuth Configuration
Add these URLs to your Supabase project's Authentication > Providers > OAuth Redirect URLs:

Development:

http://localhost:5173/auth/callback

http://localhost:5173/

Production (Vercel):

https://your-vercel-app.vercel.app/auth/callback

https://your-vercel-app.vercel.app/

📊 Analytics & Insights
Listening history tracking

Clockit Wrapped annual statistics

Artist analytics (for creators)

Content performance metrics

🐛 Troubleshooting
Common Issues
API Connection Issues

Check VITE_API_URL in Vercel environment variables

Ensure backend is running and accessible

Database Connection

Verify MongoDB Atlas IP whitelist

Check connection string format

PWA Not Installing

Ensure HTTPS in production

Check service worker registration

Media Playback Issues

Check audio file URLs

Verify CORS settings on backend

OAuth Sign-in Not Working (ERR_CONNECTION_REFUSED)

Ensure all redirect URLs are added to Supabase dashboard

Add both development and production URLs

🤝 Contributing
Fork the repository

Create feature branch: git checkout -b feature-name

Commit changes: git commit -m 'Add feature'

Push to branch: git push origin feature-name

Create Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Built with modern web technologies

Inspired by leading social media platforms

Community-driven development

📞 Support
For support, email support@clockit.com or create an issue on GitHub.

Clockit - Where music meets social connection! 🎵🤝


