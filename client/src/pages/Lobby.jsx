import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import PlayerList from '../components/PlayerList';
import RoomCode from '../components/RoomCode';

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { room, votingState, drawingState, gameState, startGame, kickPlayer, leaveRoom, error, clearError } = useGame();
  const [isStarting, setIsStarting] = useState(false);

  // Navigate to voting when drawingState or votingState is received
  useEffect(() => {
    if (drawingState && drawingState.code) {
      console.log('Drawing started, navigating to voting');
      navigate(`/votacao/${drawingState.code}`, { replace: true });
    }
  }, [drawingState, navigate]);

  useEffect(() => {
    if (votingState && votingState.code) {
      console.log('Voting started, navigating to voting');
      navigate(`/votacao/${votingState.code}`, { replace: true });
    }
  }, [votingState, navigate]);

  // Navigate to game if game already started (rejoining)
  useEffect(() => {
    if (gameState && gameState.code) {
      console.log('Game in progress, navigating to game');
      navigate(`/jogo/${gameState.code}`, { replace: true });
    }
  }, [gameState, navigate]);

  // Redirect to join page if no room and no other state
  useEffect(() => {
    if (!room && !votingState && !drawingState && !gameState) {
      console.log('No room or gameState, redirecting to join page');
      navigate(`/entrar/${code}`, { replace: true });
    }
  }, [room, votingState, drawingState, gameState, navigate, code]);

  const handleStartGame = async () => {
    if (isStarting) return;

    setIsStarting(true);
    clearError();

    try {
      await startGame(code);
      // Navigation will happen via useEffect when votingState is received
    } catch (err) {
      console.error('Error starting game:', err);
      setIsStarting(false);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  const handleKick = async (playerId, playerName) => {
    if (!window.confirm(`Remover ${playerName} da sala?`)) return;

    try {
      await kickPlayer(code, playerId);
    } catch (err) {
      console.error('Error kicking player:', err);
    }
  };

  // Show loading while waiting for draw/voting to start after clicking
  if (isStarting && !votingState && !drawingState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-primary rounded-full"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <p className="text-white/60">Sorteando tema...</p>
        </motion.div>
      </div>
    );
  }

  // Don't render if no room
  if (!room) {
    return null;
  }

  const canStart = room.isHost && room.players.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">Sala de Espera</h1>
        <p className="text-white/60">Compartilhe o código com seus amigos</p>
      </motion.div>

      {/* Room code */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <RoomCode code={code} />
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Players section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm">
            Jogadores ({room.players.length}/8)
          </p>
          {room.players.length < 2 && (
            <p className="text-yellow-400 text-xs">Mínimo 2 jogadores</p>
          )}
        </div>
        <PlayerList
          players={room.players}
          isHost={room.isHost}
          onKick={room.isHost ? handleKick : null}
        />
      </motion.div>

      {/* Waiting animation */}
      {!room.isHost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3 my-6"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <p className="text-white/40 text-sm">Aguardando o host iniciar...</p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mt-4"
      >
        {room.isHost && (
          <Button
            onClick={handleStartGame}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canStart}
            loading={isStarting}
          >
            {room.players.length < 2 ? 'Aguardando jogadores...' : 'Começar Jogo'}
          </Button>
        )}

        <Button onClick={handleLeave} variant="danger" size="md" className="w-full">
          Sair da Sala
        </Button>
      </motion.div>
    </motion.div>
  );
}
