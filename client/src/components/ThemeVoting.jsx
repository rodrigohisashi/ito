import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function ThemeVoting({
  themes,
  votes,
  players,
  hasVoted,
  onVote,
  isHost,
  onSkipVoting,
  onChangeTheme,
  onForceStart,
  onBackToLobby,
  drawnNumber,
  countdownSeconds,
}) {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [customNumber, setCustomNumber] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [localCountdown, setLocalCountdown] = useState(null);

  // Sync local countdown with server countdown
  useEffect(() => {
    if (countdownSeconds !== null && countdownSeconds !== undefined && countdownSeconds > 0) {
      setLocalCountdown(countdownSeconds);
    } else {
      setLocalCountdown(null);
    }
  }, [countdownSeconds]);

  // Decrement local countdown every second
  useEffect(() => {
    if (localCountdown === null || localCountdown <= 0) return;

    const timer = setInterval(() => {
      setLocalCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localCountdown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPlayers = players?.length || 0;
  const totalVotes = Object.keys(votes || {}).length;
  const allVoted = totalVotes >= totalPlayers;

  // Calculate vote counts per theme
  const voteCounts = {};
  themes?.forEach((theme) => {
    voteCounts[theme.id] = 0;
  });
  Object.values(votes || {}).forEach((themeId) => {
    if (voteCounts[themeId] !== undefined) {
      voteCounts[themeId]++;
    }
  });

  const handleVote = async () => {
    if (!selectedTheme || hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(selectedTheme);
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setIsVoting(false);
    }
  };

  // Redraw random number
  const handleRedraw = async () => {
    if (isChanging) return;
    setIsChanging(true);
    try {
      await onChangeTheme(null); // null = random
      setSelectedTheme(null);
    } catch (err) {
      console.error('Error redrawing:', err);
    } finally {
      setIsChanging(false);
    }
  };

  // Pick specific number
  const handlePickNumber = async () => {
    if (isChanging || !customNumber) return;
    const num = parseInt(customNumber, 10);
    if (num < 1 || num > 100) return;

    setIsChanging(true);
    try {
      await onChangeTheme(num);
      setCustomNumber('');
      setSelectedTheme(null);
      setShowAdminPanel(false);
    } catch (err) {
      console.error('Error picking number:', err);
    } finally {
      setIsChanging(false);
    }
  };

  // Force start game
  const handleForceStart = async (themeId = null) => {
    console.log('Force start clicked, themeId:', themeId);
    if (isStarting) {
      console.log('Already starting, ignoring');
      return;
    }
    setIsStarting(true);
    try {
      console.log('Calling onForceStart...');
      await onForceStart(themeId);
      console.log('onForceStart completed');
    } catch (err) {
      console.error('Error force starting:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // Back to lobby
  const handleBackToLobby = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await onBackToLobby();
    } catch (err) {
      console.error('Error going back to lobby:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        {/* Drawn number badge */}
        {drawnNumber && (
          <div className="mb-3">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/30 text-primary-light text-sm font-semibold">
              Número sorteado: <span className="text-xl">{drawnNumber}</span>
            </span>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gradient mb-2">Escolha o Tema</h2>
        <p className="text-white/60 text-sm">
          {hasVoted
            ? `Aguardando outros jogadores... (${totalVotes}/${totalPlayers})`
            : 'Vote no tema que você quer jogar!'}
        </p>
      </motion.div>

      {/* Admin Controls */}
      {isHost && onChangeTheme && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mb-4"
        >
          {!showAdminPanel ? (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full text-xs text-white/40 hover:text-white/60 py-2 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Opções do Admin
            </button>
          ) : (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="glass rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/60">ADMIN</span>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="text-white/40 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Redraw button */}
              <Button
                onClick={handleRedraw}
                variant="secondary"
                size="sm"
                className="w-full"
                loading={isChanging}
              >
                🎲 Sortear outro número
              </Button>

              {/* Pick specific number */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  placeholder="1-100"
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={handlePickNumber}
                  variant="secondary"
                  size="sm"
                  disabled={!customNumber || parseInt(customNumber) < 1 || parseInt(customNumber) > 100}
                  loading={isChanging}
                >
                  Ir
                </Button>
              </div>

              <p className="text-xs text-white/30 text-center mb-3">
                Mudar o número limpa todos os votos
              </p>

              {/* Divider */}
              <div className="border-t border-white/10 pt-3">
                <Button
                  onClick={() => handleForceStart(selectedTheme)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                  loading={isStarting}
                >
                  🚀 Começar Jogo Agora
                </Button>
                <p className="text-xs text-white/30 text-center mt-2">
                  {selectedTheme
                    ? `Usar tema #${selectedTheme}`
                    : totalVotes > 0
                      ? 'Usar tema mais votado'
                      : 'Usar tema aleatório'}
                </p>
              </div>

              {/* Back to lobby */}
              {onBackToLobby && (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <Button
                    onClick={handleBackToLobby}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    loading={isResetting}
                  >
                    ↩️ Voltar ao Lobby
                  </Button>
                  <p className="text-xs text-white/30 text-center mt-2">
                    Cancela a votação e volta à sala
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Theme options */}
      <div className="w-full space-y-3 mb-4">
        <AnimatePresence>
          {themes?.map((theme, index) => {
            const isSelected = selectedTheme === theme.id;
            const voteCount = voteCounts[theme.id] || 0;
            const votePercentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !hasVoted && setSelectedTheme(theme.id)}
                disabled={hasVoted}
                className={`w-full p-3 rounded-xl text-left transition-all relative overflow-hidden ${
                  hasVoted
                    ? 'cursor-default'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  isSelected
                    ? 'glass-strong border-2 border-primary'
                    : 'glass border border-white/10'
                }`}
              >
                {/* Vote progress bar */}
                {totalVotes > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${votePercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-primary/20"
                  />
                )}

                <div className="relative z-10">
                  {/* Theme number and votes */}
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/30 text-primary-light">
                      #{theme.id}
                    </span>
                    {totalVotes > 0 && (
                      <span className="text-xs font-semibold text-white/80">
                        {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
                      </span>
                    )}
                  </div>

                  {/* Theme title */}
                  <h3 className="font-semibold text-white text-sm mb-1">{theme.title}</h3>

                  {/* Scale */}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>1 = {theme.min}</span>
                    <span>→</span>
                    <span>100 = {theme.max}</span>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && !hasVoted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Button
            onClick={handleVote}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedTheme}
            loading={isVoting}
          >
            Confirmar Voto
          </Button>
        </motion.div>
      )}

      {/* Waiting indicator with countdown */}
      {hasVoted && !allVoted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          {localCountdown !== null && localCountdown > 0 ? (
            <>
              <motion.div
                key="countdown"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border-2 border-primary"
              >
                <span className="text-2xl font-bold text-primary">{localCountdown}</span>
              </motion.div>
              <p className="text-primary text-sm font-medium">Maioria votou! Iniciando em {localCountdown}s...</p>
            </>
          ) : (
            <>
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
              <p className="text-white/40 text-sm">Aguardando votos... ({totalVotes}/{totalPlayers})</p>
            </>
          )}
        </motion.div>
      )}

      {/* Host controls when waiting */}
      {isHost && hasVoted && !allVoted && onForceStart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 w-full"
        >
          <Button
            onClick={() => handleForceStart(selectedTheme)}
            variant="primary"
            size="lg"
            className="w-full"
            loading={isStarting}
          >
            🚀 Começar Jogo Agora
          </Button>
          <p className="text-xs text-white/40 text-center mt-2">
            {selectedTheme
              ? `Usar tema #${selectedTheme}`
              : totalVotes > 0
                ? 'Usar tema mais votado'
                : 'Usar tema aleatório'}
          </p>
        </motion.div>
      )}

      {/* Host skip option (before voting) */}
      {isHost && !hasVoted && !allVoted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Button onClick={onSkipVoting} variant="secondary" size="sm">
            Pular votação (aleatório)
          </Button>
        </motion.div>
      )}

      {/* Players who voted */}
      {totalVotes > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <p className="text-white/40 text-xs">
            {players
              ?.filter((p) => votes?.[p.id])
              .map((p) => p.name)
              .join(', ') || 'Nenhum voto ainda'}{' '}
            {totalVotes > 0 && 'votou'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
