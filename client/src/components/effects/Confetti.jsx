import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONFETTI_COLORS = [
  '#d4af37', // Champagne Gold
  '#e6c75a', // Pale Gold
  '#b76e79', // Rose Gold
  '#f5f5f0', // Ivory
  '#c9a227', // Antique Gold
];

function ConfettiPiece({ delay, startX, startY, color, rotation, xOffset, yOffset }) {
  return (
    <motion.div
      className="absolute w-3 h-3"
      style={{
        left: startX,
        top: startY,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{
        opacity: 1,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
      }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5],
        x: xOffset,
        y: yOffset,
        rotate: rotation,
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.2, 0.8, 0.4, 1],
      }}
    />
  );
}

export default function Confetti({
  isActive,
  count = 50,
  origin = { x: '50%', y: '50%' },
  spread = 300,
  onComplete
}) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newPieces = Array(count).fill(null).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = spread * 0.5 + Math.random() * spread * 0.5;

        return {
          id: i,
          delay: Math.random() * 0.3,
          startX: origin.x,
          startY: origin.y,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          rotation: Math.random() * 720 - 360,
          xOffset: Math.cos(angle) * distance,
          yOffset: Math.sin(angle) * distance - 100, // Slight upward bias
        };
      });

      setPieces(newPieces);

      // Clear after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isActive, count, origin.x, origin.y, spread, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      <AnimatePresence>
        {pieces.map((piece) => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Burst variant - explodes from a point
export function ConfettiBurst({ isActive, origin, onComplete }) {
  return (
    <Confetti
      isActive={isActive}
      count={40}
      origin={origin}
      spread={250}
      onComplete={onComplete}
    />
  );
}

// Rain variant - falls from top
export function ConfettiRain({ isActive, onComplete }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newPieces = Array(60).fill(null).map((_, i) => ({
        id: i,
        delay: Math.random() * 1,
        startX: `${Math.random() * 100}%`,
        startY: '-5%',
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 720,
        xOffset: (Math.random() - 0.5) * 100,
        yOffset: window.innerHeight + 100,
      }));

      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-2 h-4"
            style={{
              left: piece.startX,
              top: piece.startY,
              backgroundColor: piece.color,
              borderRadius: '1px',
            }}
            initial={{ opacity: 1, y: 0, rotate: 0, x: 0 }}
            animate={{
              opacity: [1, 1, 0],
              y: piece.yOffset,
              rotate: piece.rotation,
              x: piece.xOffset,
            }}
            transition={{
              duration: 2.5,
              delay: piece.delay,
              ease: 'linear',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
