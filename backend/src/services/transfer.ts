import { SpotifyService } from './spotify';
import { YouTubeMusicService } from './youtubeMusic';
import { TransferResult, FailedTrack, SpotifyTrack } from '../types';

export class TransferService {
  private spotifyService: SpotifyService;
  private youtubeMusicService: YouTubeMusicService;

  constructor() {
    this.spotifyService = new SpotifyService();
    this.youtubeMusicService = new YouTubeMusicService();
  }

  async transferPlaylist(
    spotifyAccessToken: string,
    youtubeTokens: any,
    spotifyPlaylistId: string,
    targetPlaylistName?: string,
    targetPlaylistDescription?: string
  ): Promise<TransferResult> {
    // Set YouTube credentials
    this.youtubeMusicService.setCredentials(youtubeTokens);

    // Get Spotify playlist details
    const spotifyPlaylist = await this.spotifyService.getPlaylist(spotifyAccessToken, spotifyPlaylistId);
    const tracks = await this.spotifyService.getPlaylistTracks(spotifyAccessToken, spotifyPlaylistId);

    // Create new YouTube Music playlist
    const playlistName = targetPlaylistName || `${spotifyPlaylist.name} (from Spotify)`;
    const playlistDescription = targetPlaylistDescription || 
      `Transferred from Spotify. ${spotifyPlaylist.description || ''}`;

    const youtubePlaylistId = await this.youtubeMusicService.createPlaylist(
      playlistName,
      playlistDescription
    );

    const failedTracks: FailedTrack[] = [];
    let transferredCount = 0;

    // Transfer each track
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      
      try {
        // Search for the track on YouTube Music
        const videoId = await this.youtubeMusicService.searchTrack(track);

        if (videoId) {
          // Add to YouTube Music playlist
          await this.youtubeMusicService.addVideoToPlaylist(youtubePlaylistId, videoId);
          transferredCount++;
        } else {
          failedTracks.push({
            spotifyTrack: track,
            reason: 'Song not found on YouTube Music',
          });
        }
      } catch (error: any) {
        console.error(`Error transferring track "${track.name}":`, error);
        
        let reason = 'Unknown error occurred';
        
        if (error.response?.data?.error?.message) {
          reason = error.response.data.error.message;
        } else if (error.message) {
          reason = error.message;
        }

        failedTracks.push({
          spotifyTrack: track,
          reason: `Transfer failed: ${reason}`,
        });
      }

      // Add small delay to avoid rate limiting
      if (i < tracks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return {
      success: failedTracks.length === 0,
      playlistName,
      transferredCount,
      failedTracks,
      totalTracks: tracks.length,
    };
  }

  async validateTokens(
    spotifyAccessToken: string,
    youtubeTokens: any
  ): Promise<{ spotifyValid: boolean; youtubeValid: boolean }> {
    let spotifyValid = false;
    let youtubeValid = false;

    // Validate Spotify token
    try {
      await this.spotifyService.getUserPlaylists(spotifyAccessToken);
      spotifyValid = true;
    } catch (error) {
      console.error('Spotify token validation failed:', error);
    }

    // Validate YouTube token
    try {
      this.youtubeMusicService.setCredentials(youtubeTokens);
      await this.youtubeMusicService.getUserPlaylists();
      youtubeValid = true;
    } catch (error) {
      console.error('YouTube token validation failed:', error);
    }

    return { spotifyValid, youtubeValid };
  }
}