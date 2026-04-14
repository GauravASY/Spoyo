import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playlistService, transferService, authService } from '../services/api';
import { SpotifyPlaylist, TransferResult, FailedTrack } from '../types';
import './Transfer.css';

const Transfer = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setAuthStatus] = useState({ spotify: false, youtube: false });
  const location = useLocation();

  useEffect(() => {
    checkAuthAndLoadPlaylists();
  }, []);

  const checkAuthAndLoadPlaylists = async () => {
    try {
      const status = await authService.checkAuthStatus();
      setAuthStatus(status);

      if (!status.spotify || !status.youtube) {
        navigate('/');
        return;
      }

      const userPlaylists = await playlistService.getSpotifyPlaylists();
      setPlaylists(userPlaylists);
      
      const preSelected = location.state?.preSelectedPlaylist;
      if (preSelected) {
        await handlePlaylistSelect(preSelected);
        navigate('.', { replace: true, state: {} }); // Clear state so back button works normally
      }
    } catch (err: any) {
      setError('Failed to load playlists. Please try again.');
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = async (playlist: SpotifyPlaylist) => {
    try {
      setLoading(true);
      const fullPlaylist = await playlistService.getSpotifyPlaylist(playlist.id);
      setSelectedPlaylist(fullPlaylist);
    } catch (err) {
      console.error('Error loading playlist details:', err);
      alert('Failed to load playlist details');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedPlaylist) return;

    setTransferring(true);
    setError(null);
    setResult(null);

    try {
      const transferResult = await transferService.transferPlaylist(
        selectedPlaylist.id,
        `${selectedPlaylist.name} (from Spotify)`,
        `Transferred from Spotify. ${selectedPlaylist.description || ''}`
      );
      setResult(transferResult);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  const handleBack = () => {
    if (selectedPlaylist) {
      setSelectedPlaylist(null);
      setResult(null);
      setError(null);
    } else {
      navigate('/');
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="transfer">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show transfer result
  if (result) {
    return (
      <div className="transfer">
        <div className="result-container">
          <button onClick={handleBack} className="btn btn-secondary back-btn">
            ← Back to Playlists
          </button>

          <div className={`result-card ${result.success ? 'success' : 'partial'}`}>
            <div className="result-header">
              <div className="result-icon">{result.success ? '✓' : '◐'}</div>
              <h2>{result.success ? 'Transfer Complete!' : 'Transfer Partially Complete'}</h2>
            </div>

            <div className="result-stats">
              <div className="stat">
                <span className="stat-value">{result.transferredCount}</span>
                <span className="stat-label">Songs Transferred</span>
              </div>
              <div className="stat">
                <span className="stat-value">{result.totalTracks}</span>
                <span className="stat-label">Total Songs</span>
              </div>
              <div className="stat">
                <span className="stat-value">{result.failedTracks.length}</span>
                <span className="stat-label">Failed</span>
              </div>
            </div>

            {result.playlistName && (
              <p className="playlist-name">
                Created playlist: <strong>{result.playlistName}</strong>
              </p>
            )}
          </div>

          {result.failedTracks.length > 0 && (
            <div className="failed-tracks-section">
              <h3>Failed Songs</h3>
              <p className="failed-description">
                The following songs could not be transferred to YouTube Music:
              </p>
              <div className="failed-tracks-list">
                {result.failedTracks.map((failed: FailedTrack, index: number) => (
                  <div key={index} className="failed-track-item">
                    <div className="failed-track-info">
                      <span className="track-name">{failed.spotifyTrack.name}</span>
                      <span className="track-artist">
                        {failed.spotifyTrack.artists.map(a => a.name).join(', ')}
                      </span>
                    </div>
                    <span className="failed-reason" title={failed.reason}>
                      {failed.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show selected playlist details
  if (selectedPlaylist) {
    return (
      <div className="transfer">
        <div className="playlist-detail">
          <button onClick={handleBack} className="btn btn-secondary back-btn">
            ← Back to Playlists
          </button>

          <div className="playlist-header-detail">
            {selectedPlaylist.images?.[0]?.url && (
              <img 
                src={selectedPlaylist.images[0].url} 
                alt={selectedPlaylist.name}
                className="playlist-cover-large"
              />
            )}
            <div className="playlist-info-detail">
              <h2>{selectedPlaylist.name}</h2>
              <p className="playlist-description">{selectedPlaylist.description || 'No description'}</p>
              <p className="playlist-meta">
                By {selectedPlaylist.owner?.display_name || 'Unknown'} • {' '}
                {selectedPlaylist.tracks?.items?.length || 0} songs
              </p>
            </div>
          </div>

          <div className="tracks-section">
            <h3>Tracks</h3>
            <div className="tracks-list">
              {selectedPlaylist.tracks?.items?.map((item, index) => {
                const track = item.track;
                if (!track) return null;
                
                return (
                  <div key={track.id} className="track-item">
                    <span className="track-number">{index + 1}</span>
                    <div className="track-details">
                      <span className="track-title">{track.name}</span>
                      <span className="track-artists">
                        {track.artists.map(a => a.name).join(', ')}
                      </span>
                    </div>
                    <span className="track-duration">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="transfer-actions">
            <button 
              onClick={handleTransfer} 
              className="btn btn-primary btn-large"
              disabled={transferring}
            >
              {transferring ? (
                <>
                  <span className="spinner-small"></span>
                  Transferring...
                </>
              ) : (
                'Transfer to YouTube Music'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show playlist selection
  return (
    <div className="transfer">
      <div className="playlist-selection">
        <div className="selection-header">
          <h2>Select a Playlist to Transfer</h2>
          <p>Choose a Spotify playlist you want to transfer to YouTube Music</p>
        </div>

        {playlists.length === 0 ? (
          <div className="no-playlists">
            <p>No playlists found in your Spotify account.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go Back
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id} 
                className="playlist-card"
                onClick={() => handlePlaylistSelect(playlist)}
              >
                <div className="playlist-cover">
                  {playlist.images?.[0]?.url ? (
                    <img src={playlist.images[0].url} alt={playlist.name} />
                  ) : (
                    <div className="playlist-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-name">{playlist.name}</h3>
                  <p className="playlist-tracks">{playlist.tracks?.total || 0} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfer;