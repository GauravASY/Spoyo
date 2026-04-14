import axios from 'axios';
import querystring from 'querystring';
import { SpotifyPlaylist, SpotifyTrack, UserSession } from '../types';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3001/api/spotify/callback';

    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify credentials not configured');
    }
  }

  getAuthUrl(): string {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-private',
      'user-read-email',
    ].join(' ');

    const params = {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: this.generateRandomString(16),
    };

    return `${SPOTIFY_AUTH_URL}?${querystring.stringify(params)}`;
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  }

  async getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
    const playlists: SpotifyPlaylist[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await axios.get(
        `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const items = response.data.items;
      if (!items || items.length === 0) break;

      // Keep the raw items but ensure a minimal structure if needed
      const formattedItems = items.map((item: any) => ({
        ...item,
        tracks: item.tracks ? {
          ...item.tracks,
          items: item.tracks.items || [],
        } : undefined,
        owner: item.owner || { display_name: 'Unknown', id: '' }
      }));

      playlists.push(...formattedItems);
      offset += limit;

      if (items.length < limit) break;
    }

    return playlists;
  }

  async getPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await axios.get(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const items = response.data?.items;
      if (!items || items.length === 0) break;

      const validTracks = items
        .filter((item: any) => item.track !== null)
        .map((item: any) => item.track);

      tracks.push(...validTracks);
      offset += limit;

      if (items.length < limit) break;
    }

    return tracks;
  }

  async getPlaylist(accessToken: string, playlistId: string): Promise<SpotifyPlaylist> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  async getUserProfile(accessToken: string): Promise<{ displayName: string; email: string; avatar?: string }> {
    const response = await axios.get(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      displayName: response.data.display_name || response.data.id,
      email: response.data.email,
      avatar: response.data.images?.[0]?.url,
    };
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}