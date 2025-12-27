import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseClasses =
    'font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 select-none';

  const variants = {
    primary:
      'bg-gradient-gold text-dark font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 border border-gold-light/30',
    secondary:
      'glass text-ivory hover:bg-gold/10 border-gold/20 hover:border-gold/40',
    outline:
      'border-2 border-gold text-gold hover:bg-gold/10',
    danger:
      'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    ghost:
      'text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      onClick={disabled || loading ? undefined : onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
