import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import useWakeLock from '../hooks/useWakeLock';
import Button from '../components/Button';
import Card from '../components/Card';
import CardDraw from '../components/CardDraw';

export default function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { gameState, room, revealAllCards, resetGame, leaveRoom, error, clearError } = useGame();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const [isRevealing, setIsRevealing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false); // Local peek at card (doesn't reveal to others)
  const [showCardDraw, setShowCardDraw] = useState(true); // Show card draw animation

  // Keep screen awake during game
  useEffect(() => {
    requestWakeLock();
    return () => releaseWakeLock();
  }, [requestWakeLock, releaseWakeLock]);

  // Memoize player info to prevent unnecessary recalculations
  const { myPlayer, myCard, isHost, myName, allRevealed } = useMemo(() => {
    if (!gameState) {
      return { myPlayer: null, myCard: null, isHost: false, myName: '', allRevealed: false };
    }
    const player = gameState.players.find((p) => p.isYou);
    return {
      myPlayer: player,
      myCard: player?.card,
      isHost: gameState.isHost,
      myName: player?.name || '',
      allRevealed: gameState.allRevealed || false,
    };
  }, [gameState]);

  const showResults = gameState?.status === 'reveal';
  const selectedTheme = gameState?.selectedTheme;
  const revealedCount = gameState?.players?.filter((p) => p.revealed).length || 0;
  const totalPlayers = gameState?.players?.length || 0;

  // Redirect to lobby on game reset
  useEffect(() => {
    if (room && !gameState) {
      console.log('Game reset, navigating to lobby');
      navigate(`/sala/${room.code}`, { replace: true });
    }
  }, [room, gameState, navigate]);

  // Redirect to home if no game state and no room
  useEffect(() => {
    if (!gameState && !room) {
      console.log('No gameState or room, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [gameState, room, navigate]);

  // Toggle peek at card (local only - doesn't reveal to others)
  const handlePeekCard = () => {
    if (allRevealed) return; // All cards already revealed
    setIsPeeking(!isPeeking);
  };

  // Host reveals all cards at once
  const handleRevealAllCards = async () => {
    if (isRevealing || allRevealed) return;

    setIsRevealing(true);
    clearError();

    try {
      await revealAllCards(code);
    } catch (err) {
      console.error('Error revealing all cards:', err);
    } finally {
      setIsRevealing(false);
    }
  };

  const handlePlayAgain = async () => {
    if (isResetting) return;

    setIsResetting(true);
    clearError();

    try {
      await resetGame(code);
    } catch (err) {
      console.error('Error resetting game:', err);
      setIsResetting(false);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  const handleCardDrawComplete = useCallback(() => {
    setShowCardDraw(false);
  }, []);

  // Loading state
  if (!gameState) {
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

  // Card draw animation (first time seeing your card)
  if (showCardDraw && myCard && !showResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col items-center justify-center p-6"
      >
        <CardDraw
          targetNumber={myCard}
          playerName={myName}
          onComplete={handleCardDrawComplete}
          duration={1200}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-4 overflow-hidden"
    >
      {/* Header - compact */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-2"
      >
        <p className="text-white/30 text-xs">Sala {code}</p>
      </motion.div>

      {/* Theme display - compact */}
      {selectedTheme && !showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-2 mb-3"
        >
          <p className="text-xs text-center">
            <span className="text-white/40">Tema: </span>
            <span className="text-white font-medium">{selectedTheme.title}</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-white/30 mt-1">
            <span>1 = {selectedTheme.min}</span>
            <span>→</span>
            <span>100 = {selectedTheme.max}</span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2 px-3 py-2 bg-red-500/20 rounded-lg text-red-400 text-xs text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <AnimatePresence mode="wait">
          {showResults ? (
            // Results view
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md px-2"
            >
              {/* Show theme in results */}
              {selectedTheme && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-xl p-3 mb-4 text-center"
                >
                  <p className="text-xs text-white/50 mb-1">Tema jogado</p>
                  <p className="text-base font-semibold text-gradient">{selectedTheme.title}</p>
                </motion.div>
              )}

              <p className="text-center text-white/60 text-sm mb-3">
                Ordem correta (menor → maior):
              </p>

              {/* Ordered cards */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {gameState.orderedCards?.map((item, index) => (
                  <motion.div
                    key={`${item.name}-${item.card}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.15, type: 'spring' }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative">
                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold z-10">
                        {index + 1}
                      </span>
                      <Card
                        number={item.card}
                        playerName={item.name}
                        revealed={true}
                        size="sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Play again button (host only) */}
              {isHost && (
                <Button
                  onClick={handlePlayAgain}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isResetting}
                >
                  Jogar Novamente
                </Button>
              )}

              {!isHost && (
                <p className="text-center text-white/40 text-sm">
                  Aguardando o host iniciar nova rodada...
                </p>
              )}
            </motion.div>
          ) : (
            // Card view - MAIN GAME SCREEN
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full"
            >
              {/* Your card - big and centered */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="mb-4"
              >
                <Card
                  number={myCard}
                  playerName={myName}
                  revealed={allRevealed || isPeeking}
                  size="full"
                  onClick={!allRevealed ? handlePeekCard : undefined}
                  isYourCard={true}
                />
              </motion.div>

              {/* Status and actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center w-full max-w-xs"
              >
                {allRevealed ? (
                  <>
                    <p className="text-green-400 text-sm font-medium mb-4">
                      ✓ Todas as cartas reveladas!
                    </p>
                    {isHost && (
                      <Button
                        onClick={handlePlayAgain}
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={isResetting}
                      >
                        Jogar Novamente
                      </Button>
                    )}
                    {!isHost && (
                      <p className="text-white/40 text-sm">
                        Aguardando o host iniciar nova rodada...
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-white/50 text-sm mb-4">
                      {isPeeking
                        ? 'Toque na carta para esconder'
                        : 'Toque na carta para espiar seu número'}
                    </p>

                    {/* Host reveal all button */}
                    {isHost && (
                      <Button
                        onClick={handleRevealAllCards}
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={isRevealing}
                      >
                        Revelar Todas as Cartas
                      </Button>
                    )}
                    {!isHost && (
                      <p className="text-white/40 text-sm">
                        Aguardando o host revelar as cartas...
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom section - Players status */}
      {!showResults && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-auto pt-4"
        >
          {allRevealed ? (
            <>
              {/* All cards revealed - show sorted order */}
              <p className="text-white/60 text-sm text-center mb-3">Ordem das cartas:</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {gameState.orderedCards?.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="text-2xl font-bold text-gradient">{player.card}</span>
                    <span className="text-xs text-white/50">{player.name}</span>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Player chips - waiting for reveal */}
              <p className="text-white/40 text-xs text-center mb-2">Jogadores:</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10"
                  >
                    {player.name}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Host controls - only show when NOT revealed */}
          {isHost && !allRevealed && (
            <Button
              onClick={handlePlayAgain}
              variant="secondary"
              size="sm"
              className="w-full mb-2"
              loading={isResetting}
            >
              ↩️ Voltar ao Lobby
            </Button>
          )}

          {/* Leave button */}
          <Button onClick={handleLeave} variant="secondary" size="sm" className="w-full">
            Sair do Jogo
          </Button>
        </motion.div>
      )}

      {/* Leave button for results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <Button onClick={handleLeave} variant="secondary" size="sm" className="w-full">
            Sair do Jogo
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
