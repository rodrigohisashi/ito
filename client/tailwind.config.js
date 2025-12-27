/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Casino/Luxo Base Colors
        dark: {
          DEFAULT: '#0d0d0d',  // Rich Black
          100: '#121218',       // Onyx
          200: '#1c1c24',       // Charcoal
          300: '#252530',       // Jet
        },
        // Gold Accents
        gold: {
          DEFAULT: '#d4af37',   // Champagne Gold
          dark: '#c9a227',      // Antique Gold
          light: '#e6c75a',     // Pale Gold
          rose: '#b76e79',      // Rose Gold
        },
        // Supporting Colors
        burgundy: '#4a1c2e',    // Deep Burgundy
        emerald: '#0a3d2e',     // Emerald Depth
        ivory: '#f5f5f0',       // Ivory White
        // Legacy support (mapped to new palette)
        primary: {
          DEFAULT: '#d4af37',
          dark: '#c9a227',
          light: '#e6c75a',
        },
        secondary: {
          DEFAULT: '#b76e79',
          dark: '#9d5a66',
          light: '#c98791',
        },
        accent: {
          DEFAULT: '#4a1c2e',
          dark: '#3a1624',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) rotate(25deg)' },
          '50%, 100%': { transform: 'translateX(100%) rotate(25deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f5e6a3 50%, #d4af37 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #c9a227 100%)',
        'gradient-card': 'linear-gradient(145deg, #1c1c24 0%, #252530 50%, #1c1c24 100%)',
        'gradient-luxury': 'radial-gradient(ellipse 150% 100% at 50% 0%, #1c1c24 0%, #121218 40%, #0d0d0d 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
        'gold-lg': '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.3)',
        'inner-gold': 'inset 0 1px 0 rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
