export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks?: {
    total: number;
    items: { track: SpotifyTrack }[];
  };
  owner?: {
    display_name: string;
    id: string;
  };
}

export interface YouTubeMusicTrack {
  videoId: string;
  title: string;
  artists: { name: string }[];
  duration: number;
  thumbnails: { url: string; width: number; height: number }[];
}

export interface YouTubeMusicPlaylist {
  playlistId: string;
  name: string;
  description: string;
  thumbnails: { url: string; width: number; height: number }[];
  trackCount: number;
  tracks: YouTubeMusicTrack[];
  author: {
    name: string;
    id: string;
  };
}

export interface TransferResult {
  success: boolean;
  playlistName: string;
  transferredCount: number;
  failedTracks: FailedTrack[];
  totalTracks: number;
}

export interface FailedTrack {
  spotifyTrack: SpotifyTrack;
  reason: string;
}

export interface AuthStatus {
  spotify: boolean;
  youtube: boolean;
}

export interface UserProfile {
  displayName: string;
  email?: string;
  avatar?: string;
}