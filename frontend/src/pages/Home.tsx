import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthStatus, UserProfile } from '../types';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ spotify: false, youtube: false });
  const [spotifyProfile, setSpotifyProfile] = useState<UserProfile | null>(null);
  const [youtubeProfile, setYoutubeProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      const messages: Record<string, string> = {
        spotify_auth_failed: 'Spotify authorization was denied.',
        youtube_auth_failed: 'YouTube authorization was denied.',
        spotify_token_exchange_failed: 'Failed to connect Spotify. Please try again.',
        youtube_token_exchange_failed: 'Failed to connect YouTube. Please try again.',
        missing_code: 'Authorization code missing. Please try again.',
      };
      setError(messages[urlError] || `Authentication error: ${urlError}`);
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    loadAuthAndProfiles();
  }, []);

  const loadAuthAndProfiles = async () => {
    try {
      const status = await authService.checkAuthStatus();
      setAuthStatus(status);

      const [spotify, youtube] = await Promise.allSettled([
        status.spotify ? authService.getSpotifyProfile() : Promise.resolve(null),
        status.youtube ? authService.getYouTubeProfile() : Promise.resolve(null),
      ]);

      if (spotify.status === 'fulfilled') setSpotifyProfile(spotify.value);
      if (youtube.status === 'fulfilled') setYoutubeProfile(youtube.value);
    } catch (err) {
      console.error('Error loading auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyAuth = async () => {
    setSpotifyError(null);
    try {
      const authUrl = await authService.getSpotifyAuthUrl();
      window.location.href = authUrl;
    } catch {
      setSpotifyError('Failed to initiate Spotify authentication. Please try again.');
    }
  };

  const handleYouTubeAuth = async () => {
    setYoutubeError(null);
    try {
      const authUrl = await authService.getYouTubeAuthUrl();
      window.location.href = authUrl;
    } catch {
      setYoutubeError('Failed to initiate YouTube authentication. Please try again.');
    }
  };

  const handleDisconnect = async (platform: 'spotify' | 'youtube') => {
    try {
      await authService.logout(platform);
      if (platform === 'spotify') {
        setAuthStatus(s => ({ ...s, spotify: false }));
        setSpotifyProfile(null);
      } else {
        setAuthStatus(s => ({ ...s, youtube: false }));
        setYoutubeProfile(null);
      }
    } catch {
      setError(`Failed to disconnect ${platform === 'spotify' ? 'Spotify' : 'YouTube'}. Please try again.`);
    }
  };

  const handleStartTransfer = () => {
    navigate('/transfer');
  };

  if (loading) {
    return (
      <div className="home">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const bothConnected = authStatus.spotify && authStatus.youtube;

  return (
    <div className="home">
      {error && (
        <div className="error-banner">
          {error}
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="auth-section">
        <h2>Connect Your Accounts</h2>
        <p className="auth-description">
          To transfer playlists, you need to connect both your Spotify and YouTube Music accounts.
        </p>

        <div className="auth-buttons">
          {/* Spotify Card */}
          <div className={`auth-card ${authStatus.spotify ? 'connected' : ''}`}>
            <div className="auth-icon spotify-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h3>Spotify</h3>

            {authStatus.spotify && spotifyProfile ? (
              <div className="profile-info">
                {spotifyProfile.avatar && (
                  <img src={spotifyProfile.avatar} alt="" className="profile-avatar" />
                )}
                <p className="profile-name">{spotifyProfile.displayName}</p>
                {spotifyProfile.email && (
                  <p className="profile-email">{spotifyProfile.email}</p>
                )}
              </div>
            ) : (
              <p className="auth-status">
                {authStatus.spotify ? '✓ Connected' : 'Not connected'}
              </p>
            )}

            {spotifyError && <p className="card-error">{spotifyError}</p>}

            {authStatus.spotify ? (
              <button onClick={() => handleDisconnect('spotify')} className="btn btn-disconnect">
                Disconnect
              </button>
            ) : (
              <button onClick={handleSpotifyAuth} className="btn btn-spotify">
                Connect Spotify
              </button>
            )}
          </div>

          <div className="auth-connector">
            <div className="connector-line"></div>
            <span className="connector-icon">→</span>
          </div>

          {/* YouTube Card */}
          <div className={`auth-card ${authStatus.youtube ? 'connected' : ''}`}>
            <div className="auth-icon youtube-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3>YouTube Music</h3>

            {authStatus.youtube && youtubeProfile ? (
              <div className="profile-info">
                {youtubeProfile.avatar && (
                  <img src={youtubeProfile.avatar} alt="" className="profile-avatar" />
                )}
                <p className="profile-name">{youtubeProfile.displayName}</p>
              </div>
            ) : (
              <p className="auth-status">
                {authStatus.youtube ? '✓ Connected' : 'Not connected'}
              </p>
            )}

            {youtubeError && <p className="card-error">{youtubeError}</p>}

            {authStatus.youtube ? (
              <button onClick={() => handleDisconnect('youtube')} className="btn btn-disconnect">
                Disconnect
              </button>
            ) : (
              <button onClick={handleYouTubeAuth} className="btn btn-youtube">
                Connect YouTube
              </button>
            )}
          </div>
        </div>

        {bothConnected && (
          <div className="start-section">
            <div className="success-message">
              ✓ Both accounts connected successfully!
            </div>
            <button onClick={handleStartTransfer} className="btn btn-primary btn-large">
              Start Transfer
            </button>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Connect your Spotify account to access your playlists</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>Connect your YouTube Music account where playlists will be transferred</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>Select the playlist you want to transfer</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <p>Click transfer and we'll match songs to YouTube Music</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
