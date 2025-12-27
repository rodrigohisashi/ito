import { motion } from 'framer-motion';

export default function Card({
  number,
  playerName,
  revealed = false,
  size = 'lg',
  onClick,
  disabled = false,
  isYourCard = false,
}) {
  const sizes = {
    sm: 'w-20 h-28 text-2xl',
    md: 'w-28 h-40 text-4xl',
    lg: 'w-40 h-56 text-5xl',
    xl: 'w-56 h-80 text-7xl',
    full: 'w-[85vw] max-w-[320px] h-[55vh] max-h-[460px] text-8xl',
  };

  const nameSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    full: 'text-lg',
  };

  const logoSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    full: 'text-6xl',
  };

  return (
    <motion.div
      className={`relative ${sizes[size]} select-none ${onClick && !disabled ? 'cursor-pointer' : ''}`}
      style={{ perspective: '1200px' }}
      whileTap={onClick && !disabled ? { scale: 0.97 } : {}}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front - Number (face up) */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Dark elegant background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
          </div>

          {/* Inner border */}
          <div className="absolute inset-3 border border-white/10 rounded-2xl" />
          <div className="absolute inset-4 border border-white/5 rounded-xl" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

          {/* Corner ornaments */}
          <div className="absolute top-4 left-4 text-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" />
            </svg>
          </div>
          <div className="absolute top-4 right-4 text-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 text-white/20 rotate-180">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 text-white/20 rotate-180">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" />
            </svg>
          </div>

          {/* Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <span className="font-black text-gradient drop-shadow-lg">{number}</span>
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl opacity-30">
                <span className="font-black text-primary">{number}</span>
              </div>
            </div>
          </div>

          {/* Small numbers in corners */}
          <span className="absolute top-12 left-6 text-lg font-bold text-white/20">{number}</span>
          <span className="absolute bottom-12 right-6 text-lg font-bold text-white/20 rotate-180">{number}</span>

          {/* Player name at bottom */}
          {playerName && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10">
                <span className={`${nameSizes[size]} font-medium text-white/40 tracking-wide`}>{playerName}</span>
              </div>
            </div>
          )}

          {/* ITO branding */}
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <span className="text-xs font-bold text-white/10 tracking-[0.3em]">ITO</span>
          </div>
        </div>

        {/* Back - Player name (face down) */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900" />

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/20 via-transparent to-cyan-400/20"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Geometric pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diamonds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diamonds)" />
            </svg>
          </div>

          {/* Inner decorative border */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-2xl" />
          <div className="absolute inset-6 border border-white/10 rounded-xl" />

          {/* Corner flourishes */}
          <div className="absolute top-6 left-6 w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-white/40 to-transparent" />
            <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-white/30" />
          </div>
          <div className="absolute top-6 right-6 w-12 h-12">
            <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-white/40 to-transparent" />
            <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-white/40 to-transparent" />
            <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-white/30" />
          </div>
          <div className="absolute bottom-6 left-6 w-12 h-12">
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/40 to-transparent" />
            <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-white/40 to-transparent" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-white/30" />
          </div>
          <div className="absolute bottom-6 right-6 w-12 h-12">
            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-white/40 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-white/40 to-transparent" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/30" />
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Decorative circle behind logo */}
            <div className="absolute w-32 h-32 rounded-full border border-white/10" />
            <div className="absolute w-40 h-40 rounded-full border border-white/5" />

            {/* ITO Logo */}
            <motion.div
              className="relative z-10"
              animate={!revealed ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className={`${logoSizes[size]} font-black text-white drop-shadow-lg tracking-wider`}>
                ITO
              </span>
              <div className="absolute inset-0 blur-2xl opacity-40">
                <span className={`${logoSizes[size]} font-black text-white`}>ITO</span>
              </div>
            </motion.div>

            {/* Decorative line */}
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-4 mb-4" />

            {/* Player name with elegant styling */}
            {playerName && (
              <div className="relative">
                {/* Decorative elements around name */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-white/30" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-white/30" />

                <div className="px-6 py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
                  <span className={`${nameSizes[size]} font-semibold text-white tracking-wider`}>
                    {playerName}
                  </span>
                </div>
              </div>
            )}

            {/* Hint for your card */}
            {isYourCard && !revealed && (
              <motion.div
                className="absolute bottom-12 flex flex-col items-center"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-5 h-5 text-white/50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs text-white/50 font-medium tracking-wide">
                  Toque para espiar
                </span>
              </motion.div>
            )}
          </div>

          {/* Shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}
