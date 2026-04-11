import { Router } from 'express';
import { SpotifyService } from '../services/spotify';
import { YouTubeMusicService } from '../services/youtubeMusic';
import { TransferService } from '../services/transfer';

const router = Router();
const spotifyService = new SpotifyService();
const youtubeMusicService = new YouTubeMusicService();
const transferService = new TransferService();

// Spotify OAuth routes
router.get('/spotify/auth', (req, res) => {
  const authUrl = spotifyService.getAuthUrl();
  res.json({ authUrl });
});

router.get('/spotify/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=spotify_auth_failed`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=missing_code`);
  }

  try {
    const tokens = await spotifyService.exchangeCodeForToken(code);
    
    // Store tokens in session
    if (req.session) {
      req.session.spotify = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresIn * 1000,
      };
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?platform=spotify`);
  } catch (error) {
    console.error('Spotify OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=spotify_token_exchange_failed`);
  }
});

// YouTube Music OAuth routes
router.get('/youtube/auth', (req, res) => {
  const authUrl = youtubeMusicService.getAuthUrl();
  res.json({ authUrl });
});

router.get('/youtube/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=youtube_auth_failed`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=missing_code`);
  }

  try {
    const { tokens } = await youtubeMusicService.exchangeCodeForToken(code);
    
    // Store tokens in session
    if (req.session) {
      req.session.youtubeMusic = {
        tokens,
        authenticated: true,
      };
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?platform=youtube`);
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=youtube_token_exchange_failed`);
  }
});

// Check authentication status
router.get('/auth/status', (req, res) => {
  const spotifyAuthenticated = !!(req.session?.spotify?.accessToken);
  const youtubeAuthenticated = !!(req.session?.youtubeMusic?.authenticated);

  res.json({
    spotify: spotifyAuthenticated,
    youtube: youtubeAuthenticated,
  });
});

// Get Spotify user profile
router.get('/spotify/me', async (req, res) => {
  try {
    if (!req.session?.spotify?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    const expiresAt = req.session.spotify.expiresAt;
    if (Date.now() >= expiresAt && req.session.spotify.refreshToken) {
      const refreshed = await spotifyService.refreshAccessToken(req.session.spotify.refreshToken);
      req.session.spotify.accessToken = refreshed.accessToken;
      req.session.spotify.expiresAt = Date.now() + refreshed.expiresIn * 1000;
    }

    const profile = await spotifyService.getUserProfile(req.session.spotify.accessToken);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching Spotify profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get YouTube user profile
router.get('/youtube/me', async (req, res) => {
  try {
    if (!req.session?.youtubeMusic?.tokens) {
      return res.status(401).json({ error: 'Not authenticated with YouTube' });
    }

    youtubeMusicService.setCredentials(req.session.youtubeMusic.tokens);
    const profile = await youtubeMusicService.getUserProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching YouTube profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get Spotify playlists
router.get('/spotify/playlists', async (req, res) => {
  try {
    if (!req.session?.spotify?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    // Check if token needs refresh
    const expiresAt = req.session.spotify.expiresAt;
    if (Date.now() >= expiresAt && req.session.spotify.refreshToken) {
      const refreshed = await spotifyService.refreshAccessToken(req.session.spotify.refreshToken);
      req.session.spotify.accessToken = refreshed.accessToken;
      req.session.spotify.expiresAt = Date.now() + refreshed.expiresIn * 1000;
    }

    const playlists = await spotifyService.getUserPlaylists(req.session.spotify.accessToken);
    res.json({ playlists });
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get YouTube Music playlists
router.get('/youtube/playlists', async (req, res) => {
  try {
    if (!req.session?.youtubeMusic?.tokens) {
      return res.status(401).json({ error: 'Not authenticated with YouTube Music' });
    }

    youtubeMusicService.setCredentials(req.session.youtubeMusic.tokens);
    const playlists = await youtubeMusicService.getUserPlaylists();
    res.json({ playlists });
  } catch (error) {
    console.error('Error fetching YouTube Music playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get specific Spotify playlist with tracks
router.get('/spotify/playlists/:id', async (req, res) => {
  try {
    if (!req.session?.spotify?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    const { id } = req.params;
    const playlist = await spotifyService.getPlaylist(req.session.spotify.accessToken, id);
    const tracks = await spotifyService.getPlaylistTracks(req.session.spotify.accessToken, id);

    res.json({
      playlist: {
        ...playlist,
        tracks: {
          ...playlist.tracks,
          items: tracks.map(track => ({ track })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Transfer playlist
router.post('/transfer', async (req, res) => {
  try {
    if (!req.session?.spotify?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    if (!req.session?.youtubeMusic?.tokens) {
      return res.status(401).json({ error: 'Not authenticated with YouTube Music' });
    }

    const { playlistId, targetName, targetDescription } = req.body;

    if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
    }

    const result = await transferService.transferPlaylist(
      req.session.spotify.accessToken,
      req.session.youtubeMusic.tokens,
      playlistId,
      targetName,
      targetDescription
    );

    res.json(result);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed', details: error });
  }
});

// Logout
router.post('/logout/:platform', (req, res) => {
  const { platform } = req.params;

  if (req.session) {
    if (platform === 'spotify') {
      delete req.session.spotify;
    } else if (platform === 'youtube') {
      delete req.session.youtubeMusic;
    } else if (platform === 'all') {
      req.session.destroy(() => {});
    }
  }

  res.json({ success: true });
});

export default router;