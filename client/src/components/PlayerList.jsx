import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerList({ players, showStatus = false, showCards = false, isHost = false, onKick = null }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="popLayout">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-3 mb-2 flex items-center justify-between border-gold/10 hover:border-gold/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar with gold gradient */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-dark font-bold shadow-gold ${
                  player.disconnected ? 'opacity-50' : ''
                }`}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <span className={`font-medium text-ivory flex items-center gap-2 ${player.disconnected ? 'opacity-50' : ''}`}>
                  {player.name}
                  {player.isYou && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full border border-gold/30">
                      Voce
                    </span>
                  )}
                  {player.disconnected && (
                    <span className="text-xs bg-gold-rose/20 text-gold-rose px-2 py-0.5 rounded-full border border-gold-rose/30">
                      Offline
                    </span>
                  )}
                </span>
                {player.isHost && (
                  <span className="text-xs text-gold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Host
                  </span>
                )}
              </div>
            </div>

            {/* Status, Card, or Kick button */}
            <div className="flex items-center gap-2">
              {showCards && player.card !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-14 glass rounded-lg flex items-center justify-center border border-gold/20"
                >
                  <span className="font-display font-bold text-gradient">{player.card}</span>
                </motion.div>
              )}

              {showStatus && (
                <div
                  className={`w-3 h-3 rounded-full ${
                    player.revealed ? 'bg-emerald shadow-[0_0_8px_rgba(10,61,46,0.6)]' : 'bg-gold animate-pulse shadow-gold'
                  }`}
                />
              )}

              {/* Kick button - only for host and not for yourself or other hosts */}
              {isHost && onKick && !player.isYou && !player.isHost && (
                <button
                  onClick={() => onKick(player.playerId, player.name)}
                  className="p-2 text-gold-rose/60 hover:text-gold-rose hover:bg-gold-rose/10 rounded-lg transition-colors"
                  title={`Remover ${player.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
