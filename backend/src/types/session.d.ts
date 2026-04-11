import { UserSession } from './types';

declare module 'express-session' {
  interface SessionData {
    spotify?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    youtubeMusic?: {
      tokens: any;
      authenticated: boolean;
    };
  }
}