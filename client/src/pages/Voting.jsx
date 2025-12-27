import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import useWakeLock from '../hooks/useWakeLock';
import ThemeVoting from '../components/ThemeVoting';
import NumberDraw from '../components/NumberDraw';
import Button from '../components/Button';

export default function Voting() {
  const { code } = useParams();
  const navigate = useNavigate();
  const {
    votingState,
    drawingState,
    gameState,
    room,
    voteTheme,
    skipVoting,
    forceStartGame,
    changeThemeNumber,
    drawAnimationComplete,
    resetGame,
    leaveRoom,
    error,
  } = useGame();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Keep screen awake during voting
  useEffect(() => {
    requestWakeLock();
    return () => releaseWakeLock();
  }, [requestWakeLock, releaseWakeLock]);

  // Navigate to game when gameState is received
  useEffect(() => {
    if (gameState && gameState.code) {
      console.log('Game started, navigating to game');
      navigate(`/jogo/${gameState.code}`, { replace: true });
    }
  }, [gameState, navigate]);

  // Redirect to lobby if reset
  useEffect(() => {
    if (room && !votingState && !drawingState && !gameState) {
      console.log('Back to lobby');
      navigate(`/sala/${room.code}`, { replace: true });
    }
  }, [room, votingState, drawingState, gameState, navigate]);

  // Redirect to join page if no state
  useEffect(() => {
    if (!votingState && !drawingState && !gameState && !room) {
      console.log('No state, redirecting to join page');
      navigate(`/entrar/${code}`, { replace: true });
    }
  }, [votingState, drawingState, gameState, room, navigate, code]);

  const handleVote = useCallback(async (themeId) => {
    try {
      await voteTheme(code, themeId);
    } catch (err) {
      console.error('Error voting:', err);
    }
  }, [code, voteTheme]);

  const handleSkipVoting = useCallback(async () => {
    try {
      await skipVoting(code);
    } catch (err) {
      console.error('Error skipping:', err);
    }
  }, [code, skipVoting]);

  const handleChangeTheme = useCallback(async (newNumber) => {
    try {
      await changeThemeNumber(code, newNumber);
    } catch (err) {
      console.error('Error changing theme:', err);
    }
  }, [code, changeThemeNumber]);

  const handleForceStart = useCallback(async (themeId) => {
    console.log('Voting.handleForceStart called with:', { code, themeId });
    try {
      await forceStartGame(code, themeId);
      console.log('forceStartGame completed');
    } catch (err) {
      console.error('Error force starting:', err);
    }
  }, [code, forceStartGame]);

  const handleDrawComplete = useCallback(async () => {
    try {
      await drawAnimationComplete(code);
    } catch (err) {
      console.error('Error completing draw:', err);
    }
  }, [code, drawAnimationComplete]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  const handleBackToLobby = useCallback(async () => {
    try {
      await resetGame(code);
    } catch (err) {
      console.error('Error resetting game:', err);
    }
  }, [code, resetGame]);

  // Show number draw animation (first phase - before voting)
  if (drawingState) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col items-center justify-center p-6"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-white/80 mb-8 text-center"
        >
          Sorteando o tema...
        </motion.h2>

        <NumberDraw
          targetNumber={drawingState.drawnNumber}
          onComplete={handleDrawComplete}
          duration={1200}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-white/50 text-sm"
        >
          Preparando votação...
        </motion.p>
      </motion.div>
    );
  }

  // Show voting
  if (votingState) {
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
          className="text-center mb-2"
        >
          <p className="text-white/40 text-sm">Sala {code}</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Voting component */}
        <div className="flex-1 flex items-center">
          <ThemeVoting
            themes={votingState.themes}
            votes={votingState.votes}
            players={votingState.players}
            hasVoted={votingState.hasVoted}
            onVote={handleVote}
            isHost={votingState.isHost}
            onSkipVoting={handleSkipVoting}
            onChangeTheme={handleChangeTheme}
            onForceStart={handleForceStart}
            onBackToLobby={handleBackToLobby}
            drawnNumber={votingState.drawnNumber}
          />
        </div>

        {/* Leave button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Button onClick={handleLeave} variant="secondary" size="sm" className="w-full">
            Sair do Jogo
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Loading
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-primary rounded-full"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
      <p className="text-white/60">Carregando...</p>
    </div>
  );
}
