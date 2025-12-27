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
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Dark elegant background */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-200 via-dark-300 to-dark-200" />

          {/* Subtle leather texture pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23d4af37'/%3E%3C/svg%3E")`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Gold inner borders */}
          <div className="absolute inset-3 border border-gold/20 rounded-2xl" />
          <div className="absolute inset-5 border border-gold/10 rounded-xl" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />

          {/* Art Deco corner ornaments */}
          <div className="absolute top-4 left-4 text-gold/30">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2L16 8H22L17 12L19 18L14 14L9 18L11 12L6 8H12L14 2Z" />
              <circle cx="14" cy="14" r="3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
          <div className="absolute top-4 right-4 text-gold/30">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2L16 8H22L17 12L19 18L14 14L9 18L11 12L6 8H12L14 2Z" />
              <circle cx="14" cy="14" r="3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 text-gold/30 rotate-180">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2L16 8H22L17 12L19 18L14 14L9 18L11 12L6 8H12L14 2Z" />
              <circle cx="14" cy="14" r="3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 text-gold/30 rotate-180">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2L16 8H22L17 12L19 18L14 14L9 18L11 12L6 8H12L14 2Z" />
              <circle cx="14" cy="14" r="3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>

          {/* Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <span className="font-display font-black text-gradient drop-shadow-lg">{number}</span>
              {/* Gold glow effect */}
              <div className="absolute inset-0 blur-3xl opacity-40">
                <span className="font-display font-black text-gold">{number}</span>
              </div>
            </div>
          </div>

          {/* Small numbers in corners */}
          <span className="absolute top-12 left-6 text-lg font-display font-bold text-gold/30">{number}</span>
          <span className="absolute bottom-12 right-6 text-lg font-display font-bold text-gold/30 rotate-180">{number}</span>

          {/* Player name at bottom */}
          {playerName && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <div className="px-4 py-1 bg-gold/10 rounded-full border border-gold/20">
                <span className={`${nameSizes[size]} font-medium text-gold/60 tracking-wide`}>{playerName}</span>
              </div>
            </div>
          )}

          {/* ITO branding */}
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <span className="text-xs font-display font-bold text-gold/20 tracking-[0.3em]">ITO</span>
          </div>
        </div>

        {/* Back - Player name (face down) */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.2), 0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Rich dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-200 via-burgundy/30 to-dark-200" />

          {/* Animated gold shimmer overlay */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(212,175,55,0.3) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 200%'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Art Deco geometric pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="artdeco" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="#d4af37" strokeWidth="0.5" />
                  <circle cx="30" cy="30" r="4" fill="none" stroke="#d4af37" strokeWidth="0.3" />
                  <circle cx="30" cy="30" r="8" fill="none" stroke="#d4af37" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#artdeco)" />
            </svg>
          </div>

          {/* Gold decorative borders */}
          <div className="absolute inset-3 border-2 border-gold/30 rounded-2xl" />
          <div className="absolute inset-5 border border-gold/15 rounded-xl" />

          {/* Elegant corner flourishes */}
          <div className="absolute top-5 left-5 w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold/50 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-gold/50 to-transparent" />
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-gold/40" />
          </div>
          <div className="absolute top-5 right-5 w-16 h-16">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-gold/50 to-transparent" />
            <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-gold/50 to-transparent" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-gold/40" />
          </div>
          <div className="absolute bottom-5 left-5 w-16 h-16">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold/50 to-transparent" />
            <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-gold/50 to-transparent" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-gold/40" />
          </div>
          <div className="absolute bottom-5 right-5 w-16 h-16">
            <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-gold/50 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-gold/50 to-transparent" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-gold/40" />
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Decorative circles behind logo */}
            <div className="absolute w-28 h-28 rounded-full border border-gold/15" />
            <div className="absolute w-36 h-36 rounded-full border border-gold/10" />
            <div className="absolute w-44 h-44 rounded-full border border-gold/5" />

            {/* ITO Logo */}
            <motion.div
              className="relative z-10"
              animate={!revealed ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className={`${logoSizes[size]} font-display font-black text-gradient drop-shadow-lg tracking-wider`}>
                ITO
              </span>
              <div className="absolute inset-0 blur-2xl opacity-50">
                <span className={`${logoSizes[size]} font-display font-black text-gold`}>ITO</span>
              </div>
            </motion.div>

            {/* Decorative gold line */}
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-4 mb-4" />

            {/* Player name with elegant styling */}
            {playerName && (
              <div className="relative">
                {/* Decorative diamond elements */}
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-gold/40" />
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-gold/40" />

                <div className="px-6 py-2 bg-dark/60 backdrop-blur-sm rounded-lg border border-gold/30 shadow-lg">
                  <span className={`${nameSizes[size]} font-semibold text-gold tracking-wider`}>
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
                <svg className="w-5 h-5 text-gold/60 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs text-gold/60 font-medium tracking-wide">
                  Toque para espiar
                </span>
              </motion.div>
            )}
          </div>

          {/* Top shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}
