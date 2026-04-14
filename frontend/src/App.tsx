import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthSuccess from './pages/AuthSuccess';
import Transfer from './pages/Transfer';
import { ParticleBackground } from './components/ParticleBackground';
import { MusicWaveBackground } from './components/MusicWaveBackground';
import { Waveform } from './components/Waveform';
import './App.css';

function App() {
  return (
    <Router>
      <MusicWaveBackground />
      <ParticleBackground />
      <div className="app">
        <header className="app-header">
          <div className="app-brand">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-dot" />
              <span className="brand-dot" />
              <span className="brand-dot" />
            </div>
            <div className="brand-text">
              <h1>Playlist Transfer</h1>
              <p>Spotify <span className="arrow">→</span> YouTube Music</p>
            </div>
          </div>
          <div className="app-header-right">
            <Waveform />
            <span className="status-chip">
              <span className="status-dot" />
              live
            </span>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/transfer" element={<Transfer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
