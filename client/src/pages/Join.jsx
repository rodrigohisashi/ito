import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

export default function Join() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { playerName, setPlayerName, joinRoom, room, votingState, gameState, connected, error, clearError } = useGame();

  const [name, setName] = useState(playerName);
  const [isJoining, setIsJoining] = useState(false);

  // If already in room, redirect appropriately
  useEffect(() => {
    if (room && room.code === code.toUpperCase()) {
      navigate(`/sala/${code}`, { replace: true });
    }
  }, [room, code, navigate]);

  useEffect(() => {
    if (votingState && votingState.code === code.toUpperCase()) {
      navigate(`/votacao/${code}`, { replace: true });
    }
  }, [votingState, code, navigate]);

  useEffect(() => {
    if (gameState && gameState.code === code.toUpperCase()) {
      navigate(`/jogo/${code}`, { replace: true });
    }
  }, [gameState, code, navigate]);

  const handleJoin = async () => {
    if (!name.trim() || isJoining) return;

    setIsJoining(true);
    clearError();

    try {
      await joinRoom(code, name.trim());
      navigate(`/sala/${code}`, { replace: true });
    } catch (err) {
      console.error('Error joining:', err);
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim() && connected) {
      handleJoin();
    }
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
        className="mb-8 text-center"
      >
        <h1 className="text-5xl font-bold text-gradient mb-2">ITO</h1>
        <p className="text-white/60">Jogo de Cartas Cooperativo</p>
      </motion.div>

      {/* Room code display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-2xl px-6 py-4 mb-8"
      >
        <p className="text-xs text-white/50 text-center mb-1">ENTRANDO NA SALA</p>
        <p className="text-3xl font-bold tracking-[0.2em] text-gradient text-center">
          {code.toUpperCase()}
        </p>
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
          className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Name input */}
        <div>
          <label className="block text-sm text-white/60 mb-2">Qual é o seu nome?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite seu nome"
            maxLength={20}
            autoFocus
            className="w-full px-4 py-4 glass rounded-xl text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Join button */}
        <Button
          onClick={handleJoin}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!name.trim() || !connected}
          loading={isJoining}
        >
          Entrar na Sala
        </Button>

        {/* Back to home */}
        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          size="md"
          className="w-full"
        >
          Voltar ao Início
        </Button>
      </motion.div>
    </motion.div>
  );
}
