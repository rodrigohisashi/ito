import { motion } from 'framer-motion';
import ParticleCanvas from './effects/ParticleCanvas';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 150% 100% at 50% 0%,
            #1c1c24 0%,
            #121218 40%,
            #0d0d0d 100%
          )`,
        }}
      />

      {/* Layer 2: Art Deco pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(212,175,55,0.06)' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(212,175,55,0.04)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 3: Floating gold orb - top right */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Layer 3b: Floating rose gold orb - bottom left */}
      <motion.div
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(183,110,121,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Layer 3c: Floating burgundy orb - center */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,28,46,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Layer 4: Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Layer 5: Gold particles */}
      <ParticleCanvas particleCount={45} />

      {/* Layer 6: Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 0 L100 0 L0 100 Z"
            fill="none"
            stroke="rgba(212,175,55,0.3)"
            strokeWidth="0.5"
          />
          <path
            d="M0 0 L60 0 L0 60 Z"
            fill="none"
            stroke="rgba(212,175,55,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 0 L100 0 L0 100 Z"
            fill="none"
            stroke="rgba(212,175,55,0.3)"
            strokeWidth="0.5"
          />
          <path
            d="M0 0 L60 0 L0 60 Z"
            fill="none"
            stroke="rgba(212,175,55,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </div>
  );
}
