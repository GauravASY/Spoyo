import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthSuccess from './pages/AuthSuccess';
import Transfer from './pages/Transfer';
import { ParticleBackground } from './components/ParticleBackground';
import { Waveform } from './components/Waveform';
import './App.css';

function App() {
  return (
    <Router>
      <ParticleBackground />
      <div className="app">
        <header className="app-header">
          <h1>Playlist Transfer</h1>
          <p>Spotify → YouTube Music</p>
          <Waveform />
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
