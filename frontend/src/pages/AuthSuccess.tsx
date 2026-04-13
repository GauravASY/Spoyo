import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import './AuthSuccess.css';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform');
  const error = searchParams.get('error');
  const [storing, setStoring] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      navigate(`/?error=${error}`);
      return;
    }

    const storeTokensAndRedirect = async () => {
      setStoring(true);
      try {
        if (platform === 'spotify') {
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const expiresIn = searchParams.get('expires_in');

          if (!accessToken || !refreshToken) {
            navigate('/?error=missing_spotify_tokens');
            return;
          }

          // Store tokens by calling backend through the Vite proxy
          // This ensures the session cookie is set on the proxied connection
          await authService.storeSpotifyTokens(
            accessToken,
            refreshToken,
            Number(expiresIn) || 3600
          );
        } else if (platform === 'youtube') {
          const ytTokensStr = searchParams.get('yt_tokens');

          if (!ytTokensStr) {
            navigate('/?error=missing_youtube_tokens');
            return;
          }

          const ytTokens = JSON.parse(ytTokensStr);
          await authService.storeYouTubeTokens(ytTokens);
        }

        // Wait a moment for the success message to show, then redirect
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('Failed to store tokens:', err);
        setStoreError('Failed to save authentication. Please try again.');
        setTimeout(() => {
          navigate('/?error=token_store_failed');
        }, 2000);
      } finally {
        setStoring(false);
      }
    };

    storeTokensAndRedirect();
  }, [navigate, error, platform, searchParams]);

  if (error || storeError) {
    return (
      <div className="auth-success">
        <div className="auth-message error">
          <div className="auth-icon-large error-icon">✕</div>
          <h2>Authentication Failed</h2>
          <p>There was an error connecting your {platform} account.</p>
          <p className="error-details">Error: {error || storeError}</p>
          <p className="redirect-message">Redirecting you back</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-success">
      <div className="auth-message success">
        <div className="auth-icon-large success-icon">✓</div>
        <h2>{storing ? 'Connecting...' : 'Account Connected'}</h2>
        <p>
          Your {platform === 'spotify' ? 'Spotify' : 'YouTube Music'} account
          {storing ? ' is being connected...' : ' has been connected successfully.'}
        </p>
        <p className="redirect-message">Redirecting you back</p>
      </div>
    </div>
  );
};

export default AuthSuccess;