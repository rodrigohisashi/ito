import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NumberDraw({ targetNumber, onComplete, duration = 3000 }) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [phase, setPhase] = useState('spinning'); // spinning, slowing, revealed

  useEffect(() => {
    if (targetNumber === null || targetNumber === undefined) return;

    let frameCount = 0;
    const totalFrames = 60; // ~60 frames for the animation
    const slowdownStart = totalFrames * 0.6; // Start slowing at 60%

    setIsSpinning(true);
    setPhase('spinning');

    const interval = setInterval(() => {
      frameCount++;

      // Calculate speed based on phase
      let speed;
      if (frameCount < slowdownStart) {
        // Fast spinning phase
        speed = 1;
        setPhase('spinning');
      } else {
        // Slowing down phase
        const progress = (frameCount - slowdownStart) / (totalFrames - slowdownStart);
        speed = Math.max(0.1, 1 - progress * 0.9);
        setPhase('slowing');
      }

      // Only update number based on speed (slower = less frequent updates)
      if (Math.random() < speed) {
        if (frameCount >= totalFrames - 5) {
          // Last few frames: approach target
          const diff = targetNumber - currentNumber;
          setCurrentNumber(prev => {
            const step = Math.ceil(Math.abs(targetNumber - prev) / 3);
            if (prev < targetNumber) return Math.min(prev + step, targetNumber);
            if (prev > targetNumber) return Math.max(prev - step, targetNumber);
            return targetNumber;
          });
        } else {
          // Random number during spin
          setCurrentNumber(Math.floor(Math.random() * 101));
        }
      }

      // End animation
      if (frameCount >= totalFrames) {
        clearInterval(interval);
        setCurrentNumber(targetNumber);
        setIsSpinning(false);
        setPhase('revealed');

        // Call onComplete after a brief pause
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, duration / totalFrames);

    return () => clearInterval(interval);
  }, [targetNumber, duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/60 text-lg mb-4"
      >
        {phase === 'revealed' ? 'Número sorteado!' : 'Sorteando número...'}
      </motion.p>

      {/* Number display */}
      <motion.div
        className="relative"
        animate={{
          scale: phase === 'revealed' ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 blur-3xl rounded-full transition-opacity duration-500 ${
            phase === 'revealed' ? 'opacity-60' : 'opacity-30'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
          }}
        />

        {/* Number box */}
        <motion.div
          className={`relative glass-strong rounded-3xl w-48 h-48 flex items-center justify-center ${
            phase === 'revealed' ? 'card-shadow' : ''
          }`}
          animate={{
            boxShadow: isSpinning
              ? [
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                  '0 0 40px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                ]
              : '0 0 40px rgba(139, 92, 246, 0.5)',
          }}
          transition={{
            duration: 0.3,
            repeat: isSpinning ? Infinity : 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentNumber}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: isSpinning ? 0.05 : 0.3 }}
              className={`text-7xl font-bold ${
                phase === 'revealed' ? 'text-gradient' : 'text-white'
              }`}
            >
              {currentNumber}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Progress indicator */}
      {isSpinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Revealed celebration */}
      {phase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mt-6 text-center"
        >
          <p className="text-primary-light text-xl font-semibold">
            Tema #{currentNumber}
          </p>
        </motion.div>
      )}
    </div>
  );
}
