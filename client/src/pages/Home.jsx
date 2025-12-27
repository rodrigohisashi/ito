import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

export default function Home() {
  const navigate = useNavigate();
  const { playerName, setPlayerName, createRoom, joinRoom, reconnectToRoom, connected, error, clearError, isReconnecting } = useGame();

  const [name, setName] = useState(playerName);
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const [savedRoom, setSavedRoom] = useState(null);

  // Verifica se tem uma sessão salva
  useEffect(() => {
    const room = localStorage.getItem('ito-current-room');
    const savedName = localStorage.getItem('ito-player-name');
    if (room && savedName) {
      setSavedRoom({ code: room, name: savedName });
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!name.trim()) return;
    setLoading(true);
    clearError();

    try {
      const room = await createRoom(name.trim());
      navigate(`/sala/${room.code}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    setLoading(true);
    clearError();

    try {
      const room = await joinRoom(roomCode.trim().toUpperCase(), name.trim());
      navigate(`/sala/${room.code}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    if (!savedRoom) return;
    setLoading(true);
    clearError();

    try {
      const result = await reconnectToRoom(savedRoom.code, savedRoom.name);
      if (result.state === 'lobby') {
        navigate(`/sala/${savedRoom.code}`);
      } else if (result.state === 'voting') {
        navigate(`/votacao/${savedRoom.code}`);
      } else if (result.state === 'playing') {
        navigate(`/jogo/${savedRoom.code}`);
      }
    } catch (err) {
      console.error(err);
      // Se falhar, limpa a sessão salva
      localStorage.removeItem('ito-current-room');
      setSavedRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem('ito-current-room');
    setSavedRoom(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12 text-center"
      >
        <h1 className="text-7xl font-bold text-gradient mb-2">ITO</h1>
        <p className="text-white/60">Jogo de Cartas Cooperativo</p>
      </motion.div>

      {/* Connection status */}
      {!connected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 px-4 py-2 glass rounded-full text-yellow-400 text-sm flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Conectando ao servidor...
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Reconnect banner */}
      {savedRoom && connected && mode === null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 w-full max-w-sm"
        >
          <div className="glass rounded-xl p-4 border border-primary/30">
            <p className="text-white/60 text-sm mb-1">Sessão anterior encontrada</p>
            <p className="text-white font-medium mb-3">
              Sala <span className="text-primary font-bold">{savedRoom.code}</span> como <span className="text-primary">{savedRoom.name}</span>
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleReconnect}
                variant="primary"
                size="md"
                className="flex-1"
                loading={loading}
              >
                Reconectar
              </Button>
              <Button
                onClick={handleClearSession}
                variant="secondary"
                size="md"
              >
                ✕
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {mode === null ? (
          // Initial buttons
          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!connected}
            >
              Criar Sala
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={!connected}
            >
              Entrar na Sala
            </Button>
          </div>
        ) : (
          // Form
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Name input */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Seu nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>

            {/* Room code input (join mode) */}
            {mode === 'join' && (
              <div>
                <label className="block text-sm text-white/60 mb-2">Código da sala</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2"
                  maxLength={4}
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 tracking-[0.2em] text-center text-xl font-bold"
                />
              </div>
            )}

            {/* Action button */}
            <Button
              onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!name.trim() || (mode === 'join' && roomCode.length !== 4)}
              loading={loading}
            >
              {mode === 'create' ? 'Criar Sala' : 'Entrar'}
            </Button>

            {/* Back button */}
            <Button
              onClick={() => {
                setMode(null);
                clearError();
              }}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Voltar
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-white/30 text-sm"
      >
        Feito com cartas de 0 a 100
      </motion.p>
    </motion.div>
  );
}
