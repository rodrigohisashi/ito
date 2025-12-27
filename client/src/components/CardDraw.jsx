import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CardDraw({ targetNumber, playerName, onComplete, duration = 1500 }) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [phase, setPhase] = useState('dealing'); // dealing, spinning, revealed
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (targetNumber === null || targetNumber === undefined) return;

    // Phase 1: Card flies in
    setPhase('dealing');
    setShowCard(true);

    // Phase 2: Start spinning numbers after card lands
    const spinDelay = setTimeout(() => {
      setPhase('spinning');

      let frameCount = 0;
      const totalFrames = 30;

      const interval = setInterval(() => {
        frameCount++;

        if (frameCount < totalFrames - 5) {
          // Random numbers
          setCurrentNumber(Math.floor(Math.random() * 101));
        } else if (frameCount < totalFrames) {
          // Approach target
          setCurrentNumber(prev => {
            const diff = targetNumber - prev;
            return prev + Math.ceil(diff / 2);
          });
        } else {
          // Final number
          clearInterval(interval);
          setCurrentNumber(targetNumber);
          setPhase('revealed');

          // Complete after reveal
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
      }, duration / totalFrames / 2);

      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(spinDelay);
  }, [targetNumber, duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/60 text-lg mb-6"
      >
        {phase === 'revealed' ? 'Sua carta!' : 'Recebendo carta...'}
      </motion.p>

      {/* Card animation */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ scale: 0, rotate: -180, y: -200 }}
            animate={{
              scale: 1,
              rotate: 0,
              y: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.4
            }}
            className="relative"
          >
            {/* Card */}
            <motion.div
              className="relative w-[85vw] max-w-[320px] h-[55vh] max-h-[460px] rounded-3xl overflow-hidden shadow-2xl"
              animate={{
                boxShadow: phase === 'revealed'
                  ? '0 0 60px rgba(139, 92, 246, 0.6)'
                  : '0 0 30px rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                animate={{
                  opacity: phase === 'spinning' ? [0.1, 0.3, 0.1] : 0.2,
                }}
                transition={{
                  duration: 0.2,
                  repeat: phase === 'spinning' ? Infinity : 0,
                }}
              />

              {/* Border */}
              <div className="absolute inset-0 border-2 border-white/10 rounded-3xl" />

              {/* Corner decorations */}
              <span className="absolute top-4 left-4 text-sm font-bold text-white/40">ITO</span>
              <span className="absolute bottom-4 right-4 text-sm font-bold text-white/40 rotate-180">ITO</span>

              {/* Number display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentNumber}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -20 }}
                    transition={{ duration: phase === 'spinning' ? 0.05 : 0.3 }}
                    className={`text-7xl font-black ${
                      phase === 'revealed' ? 'text-gradient' : 'text-white'
                    }`}
                  >
                    {phase === 'dealing' ? '?' : currentNumber}
                  </motion.span>
                </AnimatePresence>

                {/* Glow effect for revealed */}
                {phase === 'revealed' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center blur-2xl pointer-events-none"
                  >
                    <span className="text-7xl font-black text-primary">{targetNumber}</span>
                  </motion.div>
                )}

                {/* Player name */}
                {playerName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-white/50 text-sm"
                  >
                    {playerName}
                  </motion.p>
                )}
              </div>

              {/* Small numbers in corners */}
              {phase !== 'dealing' && (
                <>
                  <span className="absolute top-4 right-4 text-lg font-bold text-white/30">
                    {currentNumber}
                  </span>
                  <span className="absolute bottom-4 left-4 text-lg font-bold text-white/30 rotate-180">
                    {currentNumber}
                  </span>
                </>
              )}
            </motion.div>

            {/* Sparkles for revealed */}
            {phase === 'revealed' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos(i * 60 * Math.PI / 180) * 100,
                      y: Math.sin(i * 60 * Math.PI / 180) * 100,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.05,
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      {phase === 'revealed' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-white/40 text-sm"
        >
          Não mostre para ninguém!
        </motion.p>
      )}
    </div>
  );
}
