import axios from 'axios';
import { SpotifyPlaylist, YouTubeMusicPlaylist, TransferResult, AuthStatus, UserProfile } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authService = {
  async getSpotifyAuthUrl(): Promise<string> {
    const response = await api.get('/spotify/auth');
    return response.data.authUrl;
  },

  async getYouTubeAuthUrl(): Promise<string> {
    const response = await api.get('/youtube/auth');
    return response.data.authUrl;
  },

  async checkAuthStatus(): Promise<AuthStatus> {
    const response = await api.get('/auth/status');
    return response.data;
  },

  async logout(platform: 'spotify' | 'youtube' | 'all'): Promise<void> {
    await api.post(`/logout/${platform}`);
  },

  async getSpotifyProfile(): Promise<UserProfile> {
    const response = await api.get('/spotify/me');
    return response.data;
  },

  async getYouTubeProfile(): Promise<UserProfile> {
    const response = await api.get('/youtube/me');
    return response.data;
  },
};

export const playlistService = {
  async getSpotifyPlaylists(): Promise<SpotifyPlaylist[]> {
    const response = await api.get('/spotify/playlists');
    return response.data.playlists;
  },

  async getYouTubePlaylists(): Promise<YouTubeMusicPlaylist[]> {
    const response = await api.get('/youtube/playlists');
    return response.data.playlists;
  },

  async getSpotifyPlaylist(id: string): Promise<SpotifyPlaylist> {
    const response = await api.get(`/spotify/playlists/${id}`);
    return response.data.playlist;
  },
};

export const transferService = {
  async transferPlaylist(
    playlistId: string,
    targetName?: string,
    targetDescription?: string
  ): Promise<TransferResult> {
    const response = await api.post('/transfer', {
      playlistId,
      targetName,
      targetDescription,
    });
    return response.data;
  },
};

export default api;