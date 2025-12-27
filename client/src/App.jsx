import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import Voting from './pages/Voting';
import Game from './pages/Game';
import InstallPrompt from './components/InstallPrompt';
import ReconnectingOverlay from './components/ReconnectingOverlay';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen min-h-[100dvh] flex flex-col safe-top safe-bottom relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/entrar/:code" element={<Join />} />
            <Route path="/sala/:code" element={<Lobby />} />
            <Route path="/votacao/:code" element={<Voting />} />
            <Route path="/jogo/:code" element={<Game />} />
          </Routes>
        </AnimatePresence>
      </div>
      <InstallPrompt />
      <ReconnectingOverlay />
    </>
  );
}

export default App;
