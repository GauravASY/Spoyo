import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthSuccess.css';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      // Redirect back to home with error
      navigate(`/?error=${error}`);
      return;
    }

    // Wait a moment then redirect back to home
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, error]);

  if (error) {
    return (
      <div className="auth-success">
        <div className="auth-message error">
          <div className="auth-icon-large error-icon">✕</div>
          <h2>Authentication Failed</h2>
          <p>There was an error connecting your {platform} account.</p>
          <p className="error-details">Error: {error}</p>
          <p className="redirect-message">Redirecting you back</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-success">
      <div className="auth-message success">
        <div className="auth-icon-large success-icon">✓</div>
        <h2>Account Connected</h2>
        <p>
          Your {platform === 'spotify' ? 'Spotify' : 'YouTube Music'} account has been connected successfully.
        </p>
        <p className="redirect-message">Redirecting you back</p>
      </div>
    </div>
  );
};

export default AuthSuccess;