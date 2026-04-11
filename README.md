# Spotify to YouTube Music Playlist Transfer

A web application that allows users to transfer their Spotify playlists to YouTube Music. The app authenticates with both platforms, fetches playlists, and transfers songs while handling any songs that are not available on YouTube Music.

## Features

- **OAuth Authentication**: Securely connect to Spotify and YouTube Music
- **Playlist Browser**: View all your Spotify playlists
- **Song Transfer**: Transfer entire playlists with one click
- **Error Handling**: Shows which songs couldn't be transferred and why
- **Progress Tracking**: Real-time updates on transfer progress
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

Before running the application, you need to set up API credentials for both Spotify and YouTube Music:

### Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - App name: `Playlist Transfer` (or any name you prefer)
   - App description: `Transfer playlists to YouTube Music`
   - Redirect URI: `http://localhost:3001/api/spotify/callback`
5. Save the Client ID and Client Secret

### YouTube Data API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:3001/api/youtube/callback`
5. Save the Client ID and Client Secret

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spotify-youtube-music
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
```

4. Edit `backend/.env` and add your API credentials:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback

YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/youtube/callback

SESSION_SECRET=your_random_session_secret
```

## Running the Application

### Development Mode

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Individual Services

Start only the backend:
```bash
npm run dev:backend
```

Start only the frontend:
```bash
npm run dev:frontend
```

### Production Build

Build both frontend and backend:
```bash
npm run build
```

Start the production server:
```bash
cd backend && npm start
```

## How to Use

1. **Connect Accounts**
   - Visit http://localhost:3000
   - Click "Connect Spotify" and authorize the app
   - Click "Connect YouTube Music" and authorize the app

2. **Select Playlist**
   - Once both accounts are connected, click "Start Transfer"
   - Browse your Spotify playlists
   - Click on a playlist to view its songs

3. **Transfer**
   - Review the songs in the playlist
   - Click "Transfer to YouTube Music"
   - Wait for the transfer to complete

4. **Review Results**
   - See how many songs were transferred successfully
   - View any songs that couldn't be transferred and why
   - The new playlist will appear in your YouTube Music account

## Project Structure

```
spotify-youtube-music/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── auth.ts          # API routes for auth and transfer
│   │   ├── services/
│   │   │   ├── spotify.ts       # Spotify API integration
│   │   │   ├── youtubeMusic.ts  # YouTube Music API integration
│   │   │   └── transfer.ts      # Playlist transfer logic
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   └── index.ts             # Express server entry point
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Authentication page
│   │   │   ├── AuthSuccess.tsx  # OAuth callback handler
│   │   │   └── Transfer.tsx     # Playlist transfer interface
│   │   ├── services/
│   │   │   └── api.ts           # API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── package.json                 # Root package.json with workspaces
```

## API Endpoints

### Authentication
- `GET /api/spotify/auth` - Get Spotify OAuth URL
- `GET /api/spotify/callback` - Spotify OAuth callback
- `GET /api/youtube/auth` - Get YouTube OAuth URL
- `GET /api/youtube/callback` - YouTube OAuth callback
- `GET /api/auth/status` - Check authentication status

### Playlists
- `GET /api/spotify/playlists` - Get user's Spotify playlists
- `GET /api/spotify/playlists/:id` - Get specific Spotify playlist
- `GET /api/youtube/playlists` - Get user's YouTube Music playlists

### Transfer
- `POST /api/transfer` - Transfer a playlist to YouTube Music

### Logout
- `POST /api/logout/:platform` - Logout from a platform

## Error Handling

The application handles various error scenarios:

- **Authentication errors**: Redirects back to home page with error message
- **API rate limiting**: Built-in delays between requests
- **Song not found**: Continues with other songs and reports failures at the end
- **Network errors**: Graceful error messages displayed to user
- **Invalid tokens**: Automatic token refresh for Spotify

## Limitations

- YouTube Music API searches may not always find the exact song match
- Some songs may not be available on YouTube Music
- Transfer speed is limited to avoid API rate limits
- Maximum 100 songs can be fetched per request from Spotify

## Technologies Used

### Backend
- Node.js
- Express.js
- TypeScript
- Spotify Web API
- YouTube Data API v3
- Axios
- Express Session

### Frontend
- React 18
- TypeScript
- React Router
- Vite
- CSS3 (custom styling)

## Troubleshooting

### "Failed to fetch playlists"
- Check that your API credentials are correct
- Ensure redirect URIs match exactly in both the app and API dashboards
- Check browser console for detailed error messages

### "Transfer failed"
- Some songs may not be available on YouTube Music
- Check the failed songs list for specific reasons
- Try transferring again - some failures may be temporary

### Authentication loops
- Clear browser cookies and try again
- Check that your redirect URIs are configured correctly
- Ensure you're using the correct credentials

## Security Notes

- Never commit your `.env` file with real credentials
- The app uses HTTP-only cookies for session management
- OAuth tokens are stored server-side only
- Session secrets should be strong and unique

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.