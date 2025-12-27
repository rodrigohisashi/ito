// Page transition configurations for Framer Motion

export const pageTransitions = {
  // Default elegant fade + slide
  fadeSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },

  // Luxury reveal with subtle blur (for game screens)
  luxuryReveal: {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(4px)' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },

  // Card deal entrance (for card reveals)
  cardDeal: {
    initial: { opacity: 0, rotateY: 45, z: -100 },
    animate: { opacity: 1, rotateY: 0, z: 0 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { type: 'spring', damping: 20, stiffness: 100 },
  },

  // Simple fade (for overlays)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Slide from right (for entering rooms)
  slideRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },

  // Scale up (for modals/popups)
  scaleUp: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

// Stagger children animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};
