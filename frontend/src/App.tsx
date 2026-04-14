import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import AuthSuccess from './pages/AuthSuccess';
import Transfer from './pages/Transfer';
import { ParticleBackground } from './components/ParticleBackground';
import { MusicWaveBackground } from './components/MusicWaveBackground';
import './App.css';

function App() {
  return (
    <Router>
      <MusicWaveBackground />
      <ParticleBackground />
      <div className="app">
        <nav className="app-nav">
          <NavLink to="/" className="brand-wordmark">
            Spoyo
          </NavLink>
          <div className="nav-links">
            <NavLink to="/" end className="nav-link">Transfer</NavLink>
            <a className="nav-link" href="#">History</a>
            <a className="nav-link" href="#">Support</a>
          </div>
          <div className="nav-actions">
            <span className="material-symbols-outlined nav-icon">settings</span>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/transfer" element={<Transfer />} />
          </Routes>
        </main>

        <div className="ambient-blob ambient-blob-primary" aria-hidden="true" />
        <div className="ambient-blob ambient-blob-secondary" aria-hidden="true" />
      </div>
    </Router>
  );
}

export default App;
