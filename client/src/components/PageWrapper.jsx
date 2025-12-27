import { motion } from 'framer-motion';
import { pageTransitions } from '../utils/transitions';

export default function PageWrapper({
  children,
  variant = 'fadeSlide',
  className = '',
}) {
  const transition = pageTransitions[variant] || pageTransitions.fadeSlide;

  return (
    <motion.div
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
      className={`flex-1 flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}
