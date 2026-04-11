import { google } from 'googleapis';
import { YouTubeMusicPlaylist, YouTubeMusicTrack, SpotifyTrack } from '../types';

const youtube = google.youtube('v3');

export class YouTubeMusicService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/youtube/callback'
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      prompt: 'consent',
    });
  }

  async exchangeCodeForToken(code: string): Promise<{ tokens: any }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return { tokens };
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async getUserPlaylists(): Promise<YouTubeMusicPlaylist[]> {
    const response = await youtube.playlists.list({
      auth: this.oauth2Client,
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
    });

    const playlists = response.data.items || [];
    
    return Promise.all(
      playlists.map(async (playlist: any) => {
        const tracks = await this.getPlaylistTracks(playlist.id);
        return {
          playlistId: playlist.id,
          name: playlist.snippet?.title || '',
          description: playlist.snippet?.description || '',
          thumbnails: playlist.snippet?.thumbnails || [],
          trackCount: playlist.contentDetails?.itemCount || 0,
          tracks,
          author: {
            name: playlist.snippet?.channelTitle || '',
            id: playlist.snippet?.channelId || '',
          },
        };
      })
    );
  }

  async getPlaylistTracks(playlistId: string): Promise<YouTubeMusicTrack[]> {
    const tracks: YouTubeMusicTrack[] = [];
    let nextPageToken: string | undefined;

    do {
      const response: any = await youtube.playlistItems.list({
        auth: this.oauth2Client,
        part: ['snippet', 'contentDetails'],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const items = response.data.items || [];
      
      for (const item of items) {
        if (item.contentDetails?.videoId) {
          try {
            const videoResponse: any = await youtube.videos.list({
              auth: this.oauth2Client,
              part: ['snippet', 'contentDetails'],
              id: [item.contentDetails.videoId],
            });

            const video = videoResponse.data.items?.[0];
            if (video) {
              tracks.push({
                videoId: video.id,
                title: video.snippet?.title || '',
                artists: [{ name: video.snippet?.channelTitle || '' }],
                duration: this.parseDuration(video.contentDetails?.duration || 'PT0M0S'),
                thumbnails: video.snippet?.thumbnails ? Object.values(video.snippet.thumbnails) : [],
              });
            }
          } catch (error) {
            console.error(`Error fetching video ${item.contentDetails.videoId}:`, error);
          }
        }
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return tracks;
  }

  async getUserProfile(): Promise<{ displayName: string; avatar?: string }> {
    const response = await youtube.channels.list({
      auth: this.oauth2Client,
      part: ['snippet'],
      mine: true,
    });
    const channel = response.data.items?.[0];
    return {
      displayName: channel?.snippet?.title || 'YouTube User',
      avatar: (channel?.snippet?.thumbnails as any)?.default?.url,
    };
  }

  async searchTrack(spotifyTrack: SpotifyTrack): Promise<string | null> {
    const query = `${spotifyTrack.name} ${spotifyTrack.artists.map(a => a.name).join(' ')}`;
    
    try {
      const response: any = await youtube.search.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        q: query,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: 5,
      });

      const items = response.data.items || [];
      
      // Find the best match
      for (const item of items) {
        const title = item.snippet?.title?.toLowerCase() || '';
        const trackName = spotifyTrack.name.toLowerCase();
        
        // Check if the title contains the track name
        if (title.includes(trackName)) {
          return item.id?.videoId || null;
        }
      }

      // Return first result if no exact match
      return items[0]?.id?.videoId || null;
    } catch (error) {
      console.error(`Error searching for track "${spotifyTrack.name}":`, error);
      return null;
    }
  }

  async createPlaylist(name: string, description: string): Promise<string> {
    const response: any = await youtube.playlists.insert({
      auth: this.oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: name,
          description: description,
        },
        status: {
          privacyStatus: 'private',
        },
      },
    });

    return response.data.id;
  }

  async addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
    await youtube.playlistItems.insert({
      auth: this.oauth2Client,
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      },
    });
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (e.g., PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
}