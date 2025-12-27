import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function ReconnectingOverlay() {
  const { isReconnecting, connected, room, votingState, gameState } = useGame();

  // Only show overlay if:
  // 1. Actively reconnecting, OR
  // 2. Disconnected AND we have an active session
  const hasActiveSession = room || votingState || gameState;
  const showOverlay = isReconnecting || (!connected && hasActiveSession);

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center">
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
            <p className="text-white font-medium">
              {isReconnecting ? 'Reconectando...' : 'Conectando ao servidor...'}
            </p>
            <p className="text-white/50 text-sm mt-2">
              Aguarde um momento
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
