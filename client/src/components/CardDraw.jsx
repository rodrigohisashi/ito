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
        className="text-gold/60 text-lg mb-6 font-display"
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
              className="relative w-[85vw] max-w-[320px] h-[55vh] max-h-[460px] rounded-3xl overflow-hidden"
              animate={{
                boxShadow: phase === 'revealed'
                  ? '0 0 60px rgba(212, 175, 55, 0.5), 0 25px 50px rgba(0, 0, 0, 0.5)'
                  : '0 0 30px rgba(212, 175, 55, 0.2), 0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-dark-200 via-dark-300 to-dark-200" />

              {/* Art Deco pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="carddraw-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="#d4af37" strokeWidth="0.5" />
                      <circle cx="30" cy="30" r="3" fill="none" stroke="#d4af37" strokeWidth="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#carddraw-pattern)" />
                </svg>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent"
                animate={{
                  opacity: phase === 'spinning' ? [0.1, 0.3, 0.1] : 0.2,
                }}
                transition={{
                  duration: 0.2,
                  repeat: phase === 'spinning' ? Infinity : 0,
                }}
              />

              {/* Gold borders */}
              <div className="absolute inset-3 border border-gold/20 rounded-2xl" />
              <div className="absolute inset-5 border border-gold/10 rounded-xl" />

              {/* Corner decorations */}
              <span className="absolute top-4 left-4 text-sm font-display font-bold text-gold/40">ITO</span>
              <span className="absolute bottom-4 right-4 text-sm font-display font-bold text-gold/40 rotate-180">ITO</span>

              {/* Corner ornaments */}
              <div className="absolute top-4 right-4 text-gold/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2L14 7H19L15 10L17 15L12 12L7 15L9 10L5 7H10L12 2Z" />
                </svg>
              </div>
              <div className="absolute bottom-4 left-4 text-gold/30 rotate-180">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2L14 7H19L15 10L17 15L12 12L7 15L9 10L5 7H10L12 2Z" />
                </svg>
              </div>

              {/* Number display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentNumber}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -20 }}
                    transition={{ duration: phase === 'spinning' ? 0.05 : 0.3 }}
                    className={`text-7xl font-display font-black ${
                      phase === 'revealed' ? 'text-gradient' : 'text-ivory'
                    }`}
                  >
                    {phase === 'dealing' ? '?' : currentNumber}
                  </motion.span>
                </AnimatePresence>

                {/* Gold glow effect for revealed */}
                {phase === 'revealed' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center blur-3xl pointer-events-none"
                  >
                    <span className="text-7xl font-display font-black text-gold">{targetNumber}</span>
                  </motion.div>
                )}

                {/* Player name */}
                {playerName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-gold/50 text-sm"
                  >
                    {playerName}
                  </motion.p>
                )}
              </div>

              {/* Small numbers in corners */}
              {phase !== 'dealing' && (
                <>
                  <span className="absolute top-12 left-6 text-lg font-display font-bold text-gold/30">
                    {currentNumber}
                  </span>
                  <span className="absolute bottom-12 right-6 text-lg font-display font-bold text-gold/30 rotate-180">
                    {currentNumber}
                  </span>
                </>
              )}
            </motion.div>

            {/* Gold sparkles for revealed */}
            {phase === 'revealed' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gold rounded-full"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos(i * 45 * Math.PI / 180) * 120,
                      y: Math.sin(i * 45 * Math.PI / 180) * 120,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.05,
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
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
          className="mt-6 text-gold/40 text-sm"
        >
          Nao mostre para ninguem!
        </motion.p>
      )}
    </div>
  );
}
