import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, playlistService } from '../services/api';
import { AuthStatus, UserProfile, SpotifyPlaylist } from '../types';
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
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);
  const [playlistDetailsLoading, setPlaylistDetailsLoading] = useState<Record<string, boolean>>({});
  const [playlistDetailsError, setPlaylistDetailsError] = useState<Record<string, string>>({});

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

      if (status.spotify) fetchSpotifyPlaylists();
    } catch (err) {
      console.error('Error loading auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpotifyPlaylists = async () => {
    setPlaylistsLoading(true);
    try {
      const playlists = await playlistService.getSpotifyPlaylists();
      setSpotifyPlaylists(playlists);
    } catch (err) {
      console.error('Failed to fetch Spotify playlists:', err);
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const togglePlaylist = async (id: string) => {
    if (openPlaylistId === id) {
      setOpenPlaylistId(null);
      return;
    }
    setOpenPlaylistId(id);

    const playlist = spotifyPlaylists.find(p => p.id === id);
    if (!playlist?.tracks?.items || playlist.tracks.items.length === 0) {
      setPlaylistDetailsLoading(prev => ({ ...prev, [id]: true }));
      setPlaylistDetailsError(prev => ({ ...prev, [id]: '' }));
      try {
        const fullPlaylist = await playlistService.getSpotifyPlaylist(id);
        setSpotifyPlaylists(prev => prev.map(p => p.id === id ? fullPlaylist : p));
      } catch (err: any) {
        console.error('Failed to fetch full playlist details:', err);
        if (err.response?.status === 403) {
           setPlaylistDetailsError(prev => ({ ...prev, [id]: 'Spotify API Restricted: Third-party apps cannot access private playlists they did not create.' }));
        } else {
           setPlaylistDetailsError(prev => ({ ...prev, [id]: 'Failed to load tracks.' }));
        }
      } finally {
        setPlaylistDetailsLoading(prev => ({ ...prev, [id]: false }));
      }
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
        setSpotifyPlaylists([]);
        setOpenPlaylistId(null);
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
        <div className="home-loading">
          <span className="loading-pulse" />
          <span>Loading your sonic gallery</span>
        </div>
      </div>
    );
  }

  const bothConnected = authStatus.spotify && authStatus.youtube;

  return (
    <div className="home">
      {error && (
        <div className="error-banner glass-panel">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)} aria-label="dismiss">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="material-symbols-outlined filled">bolt</span>
            NEW · V3 ENGINE LIVE
          </div>
          <h1 className="hero-title">
            Seamlessly <span className="sonic-gradient-text">move</span> your music.
          </h1>
          <p className="hero-sub">
            The Spoyo bridge migrates playlists, liked songs, and artist libraries
            between ecosystems in high-fidelity.
          </p>

          <div className="hero-cta">
            <button
              className="btn btn-primary btn-large"
              onClick={handleStartTransfer}
              disabled={!bothConnected}
            >
              {bothConnected ? 'Start Transfer' : 'Get Started'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="hero-hint">
              <span className="material-symbols-outlined">info</span>
              {bothConnected
                ? 'Both accounts connected — ready to migrate.'
                : 'Connect both accounts to activate migration.'}
            </p>
          </div>
        </div>

        {/* ─── Connection bento ─── */}
        <div className="connection-bento">
          <div className="bento-link" aria-hidden="true" />

          {/* Spotify card */}
          <article className={`connection-card glass-panel ${authStatus.spotify ? 'connected' : ''}`}>
            <div className="card-top">
              <div className="card-icon card-icon-primary">
                <span className="material-symbols-outlined filled">library_music</span>
              </div>
              <span className="card-tag card-tag-primary">Source</span>
            </div>

            <div className="card-body">
              <h3 className="card-title">Spotify</h3>
              {authStatus.spotify && spotifyProfile ? (
                <div className="profile-info">
                  {spotifyProfile.avatar && (
                    <img src={spotifyProfile.avatar} alt="" className="profile-avatar" />
                  )}
                  <div>
                    <p className="profile-name">{spotifyProfile.displayName}</p>
                    {spotifyProfile.email && <p className="profile-email">{spotifyProfile.email}</p>}
                  </div>
                </div>
              ) : (
                <p className="card-desc">Connect your Spotify library to begin scanning playlists.</p>
              )}
            </div>

            {spotifyError && <p className="card-error">{spotifyError}</p>}

            {authStatus.spotify ? (
              <button onClick={() => handleDisconnect('spotify')} className="btn btn-tertiary">
                Disconnect
              </button>
            ) : (
              <button onClick={handleSpotifyAuth} className="btn btn-primary card-btn">
                Connect
              </button>
            )}
          </article>

          {/* YouTube card */}
          <article className={`connection-card glass-panel ${authStatus.youtube ? 'connected secondary' : 'secondary'}`}>
            <div className="card-top">
              <div className="card-icon card-icon-secondary">
                <span className="material-symbols-outlined filled">play_circle</span>
              </div>
              <span className="card-tag card-tag-secondary">Target</span>
            </div>

            <div className="card-body">
              <h3 className="card-title">YouTube Music</h3>
              {authStatus.youtube && youtubeProfile ? (
                <div className="profile-info">
                  {youtubeProfile.avatar && (
                    <img src={youtubeProfile.avatar} alt="" className="profile-avatar" />
                  )}
                  <p className="profile-name">{youtubeProfile.displayName}</p>
                </div>
              ) : (
                <p className="card-desc">Link your Google account to sync your sonic history.</p>
              )}
            </div>

            {youtubeError && <p className="card-error">{youtubeError}</p>}

            {authStatus.youtube ? (
              <button onClick={() => handleDisconnect('youtube')} className="btn btn-tertiary">
                Disconnect
              </button>
            ) : (
              <button onClick={handleYouTubeAuth} className="btn btn-secondary card-btn">
                Connect
              </button>
            )}
          </article>

          {/* Real-time sync banner */}
          <div className="sync-banner glass-panel">
            <div className="sync-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="sync-meta">
              <span className="sync-label">Real-time sync</span>
              <div className="sync-status">
                <span className="material-symbols-outlined">sync</span>
                <span>{bothConnected ? 'Ready' : 'Awaiting connection'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Spotify playlists section ─── */}
      {authStatus.spotify && (
        <section className="playlists-section">
          <div className="section-head">
            <h2 className="section-title">Your Spotify library</h2>
            {playlistsLoading ? (
              <span className="section-meta loading">fetching…</span>
            ) : (
              <span className="section-meta">
                {spotifyPlaylists.length} {spotifyPlaylists.length === 1 ? 'playlist' : 'playlists'}
              </span>
            )}
          </div>

          {!playlistsLoading && spotifyPlaylists.length > 0 && (
            <div className="playlists-list">
              {spotifyPlaylists.map(playlist => {
                const isOpen = openPlaylistId === playlist.id;
                return (
                  <div key={playlist.id} className={`playlist-item ${isOpen ? 'open' : ''}`}>
                    <button className="playlist-row" onClick={() => togglePlaylist(playlist.id)}>
                      <span className="playlist-pill" aria-hidden="true" />
                      {playlist.images?.[0] ? (
                        <img src={playlist.images[0].url} alt="" className="playlist-thumb" />
                      ) : (
                        <div className="playlist-thumb playlist-thumb-empty">
                          <span className="material-symbols-outlined">music_note</span>
                        </div>
                      )}
                      <div className="playlist-row-info">
                        <span className="playlist-name">{playlist.name}</span>
                        <span className="playlist-meta">
                          {playlist.tracks?.total || playlist.tracks?.items?.length || 0} tracks · {playlist.owner?.display_name ?? 'Unknown'}
                        </span>
                      </div>
                      <span className={`playlist-chevron material-symbols-outlined ${isOpen ? 'open' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div className="playlist-details">
                        {playlist.description && (
                          <p className="playlist-desc">{playlist.description.replace(/<[^>]*>/g, '')}</p>
                        )}
                        <div className="home-tracks-container">
                          {playlistDetailsLoading[playlist.id] ? (
                            <div className="mini-loading">Loading tracks…</div>
                          ) : playlistDetailsError[playlist.id] ? (
                            <div className="mini-loading parse-error">
                              <span className="material-symbols-outlined">warning</span>
                              {playlistDetailsError[playlist.id]}
                            </div>
                          ) : playlist.tracks?.items && playlist.tracks.items.length > 0 ? (
                            <ul className="mini-tracks-ul">
                              {playlist.tracks.items.map((item, index) => item.track && (
                                <li key={item.track.id + index} className="mini-track-row">
                                  <span className="mini-track-idx">{index + 1}</span>
                                  <div className="mini-track-info">
                                    <span className="mini-track-name">{item.track.name}</span>
                                    <span className="mini-track-artists">
                                      {item.track.artists.map(a => a.name).join(', ')}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mini-loading" style={{ opacity: 0.6 }}>No tracks found</div>
                          )}
                        </div>
                        {bothConnected && (
                          <button
                            className="btn btn-primary transfer-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/transfer', { state: { preSelectedPlaylist: playlist } });
                            }}
                          >
                            Transfer this playlist
                            <span className="material-symbols-outlined">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── How it works ─── */}
      <section className="info-section">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          {[
            'Connect your Spotify account to access your playlists.',
            'Connect YouTube Music where your playlists will land.',
            'Select the playlist you want to migrate.',
            'We match every song to YouTube Music in high-fidelity.',
          ].map((text, i) => (
            <div className="step glass-panel" key={i}>
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
