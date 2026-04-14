# Spoyo - Spotify to YouTube Music Transfer

A beautifully designed web application that allows users to seamlessly transfer their Spotify playlists to YouTube Music. Spoyo securely authenticates with both platforms, retrieves your playlists, and meticulously attempts to transfer every song while keeping you informed of its progress through a dynamic, premium interface.

## Features

- **Modern Premium Interface**: Experience a highly responsive, animated UI with dynamic particle and music wave backgrounds.
- **Secure OAuth Integration**: Safely connect to both Spotify and YouTube Music without sharing your passwords.
- **Playlist Management**: Browse your complete Spotify library and view track details.
- **One-Click Transfer**: Quickly transfer entire playlists into your YouTube Music account.
- **Intelligent Error Handling**: Detailed failure reporting for songs that cannot be matched or transferred.
- **Live Progress Tracking**: Step-by-step real-time progress updates during the transfer.

## Prerequisites

Before running the application, you need to set up API credentials for both Spotify and YouTube Music:

### Spotify API Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account and click "Create App".
3. Fill in the app details:
   - App name: `Spoyo` (or preferred name)
   - App description: `Transfer playlists to YouTube Music.`
   - Redirect URI: `http://localhost:3001/api/spotify/callback`
4. Save the **Client ID** and **Client Secret**.

### YouTube Data API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one.
3. Enable the YouTube Data API v3:
   - Navigate to "APIs & Services" > "Library".
   - Search for "YouTube Data API v3" and click "Enable".
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials".
   - Click "Create Credentials" > "OAuth client ID".
   - Select "Web application".
   - Add authorized redirect URI: `http://localhost:3001/api/youtube/callback`
5. Save the **Client ID** and **Client Secret**.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spotify-youtube-music
```

2. Install dependencies across the workspace:
```bash
npm run install:all
```

3. Set up your environment variables:
```bash
cp backend/.env.example backend/.env
```

4. Populate your `backend/.env` with your API credentials:
```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback

# YouTube Data API Credentials
YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/youtube/callback

# Security and Networking
SESSION_SECRET=your_random_session_secret_here
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

## Running the Application

### Development Mode

Run both the frontend and backend servers simultaneously from the root directory:
```bash
npm run dev
```

This will concurrently start:
- **Frontend** (Vite + React): http://localhost:3000
- **Backend** (Express API): http://localhost:3001

### Running Individual Services

Start only the backend:
```bash
npm run dev:backend
```

Start only the frontend:
```bash
npm run dev:frontend
```

### Production Build

Build both frontend and backend bundles:
```bash
npm run build
```

Then start the production server:
```bash
cd backend && npm start
```

## How to Use

1. **Connect Accounts**
   - Visit http://localhost:3000
   - Click "Connect Spotify" and authorize the app.
   - Click "Connect YouTube Music" and authorize the app.

2. **Select Playlist**
   - Once both accounts are securely connected, you can browse your Spotify playlists.
   - Click on any playlist to view its songs before initiating.

3. **Transfer**
   - Review your selected playlist.
   - Click "Transfer to YouTube Music".
   - Follow the visual progress bar during the transfer.

4. **Review Results**
   - Find out exactly how many songs transferred successfully.
   - View detailed reasons for any skipped or missing songs.
   - Your newly replicated playlist will be immediately visible in YouTube Music!

## Project Structure

```
spotify-youtube-music/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── auth.ts          # API routes for auth, profile, and transfer
│   │   ├── services/
│   │   │   ├── spotify.ts       # Spotify API integration
│   │   │   ├── youtubeMusic.ts  # YouTube Music API integration
│   │   │   └── transfer.ts      # Playlist transfer logic
│   │   ├── types/
│   │   └── index.ts             # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI elements & backgrounds (Particle, Waveform)
│   │   ├── pages/               # Top-level views (Home, AuthSuccess, Transfer)
│   │   ├── services/            # API client
│   │   ├── App.tsx              # Main application router
│   │   └── index.css            # Global styling system
│   ├── index.html
│   └── package.json
└── package.json                 # Root package.json with workspaces setting
```

## API Endpoints

### Authentication & Profiles
- `GET /api/spotify/auth` - Get Spotify OAuth URL
- `GET /api/spotify/callback` - Spotify OAuth callback
- `POST /api/spotify/store-tokens` - Securely store tokens via frontend proxy
- `GET /api/spotify/me` - Fetch Spotify user profile
- `GET /api/youtube/auth` - Get YouTube OAuth URL
- `GET /api/youtube/callback` - YouTube OAuth callback
- `POST /api/youtube/store-tokens` - Securely store tokens via frontend proxy
- `GET /api/youtube/me` - Fetch YouTube user profile
- `GET /api/auth/status` - Check current connection/authentication status

### Playlists
- `GET /api/spotify/playlists` - Fetch all user Spotify playlists
- `GET /api/spotify/playlists/:id` - Fetch all track details for a Spotify playlist
- `GET /api/youtube/playlists` - Fetch YouTube Music playlists

### Transfer Actions
- `POST /api/transfer` - Initiate a transfer of a selected playlist to YouTube Music

### Logout Flow
- `POST /api/logout/:platform` - Destroy session cache (supports `spotify`, `youtube`, or `all`)


## Technologies Used

### Backend Stack
- **Node.js** & **Express.js** 
- **TypeScript**
- **Spotify Web API** & **YouTube Data API v3**
- **Axios** (for robust network fetching)
- **Express Session** 

### Frontend Stack
- **React 18** & **TypeScript**
- **Vite**
- **React Router DOM**
- **Custom CSS3** (Leveraging modern variables, glassmorphism, & micro-animations)

## Troubleshooting

### "Failed to fetch playlists"
- Ensure both redirected URIs match exactly in your configuration files and corresponding OAuth portal pages.
- Confirm your local environment credentials have been updated correctly inside `/backend/.env`.

### UI Connection Loops or Expired Tokens
- Due to strict security, some tokens invalidate upon restart. Attempt clearing your browser cookies/session and try again.
- Confirm your `.env` contains identical platform callback URLs as what has been cached.

### "Transfer failed / Skipped items"
- Songs mapped using string permutations are occasionally rejected natively by YouTube. Click into failed records to check API error responses.

## Security Notes
- `backend/.env` is ignored by default in `.gitignore`. **NEVER** expose your real API credentials!
- Our Vite proxy securely passes and embeds HTTP cookies into the session store dynamically without directly displaying user metadata.
- Generated callback parameters (`access_token` and `yt_tokens`) exist ephemerally during `AuthSuccess` redirection.