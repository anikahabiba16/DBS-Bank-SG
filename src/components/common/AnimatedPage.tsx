import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

/**
 * Wraps each routed page with a smooth fade+slide transition.
 * Uses the route pathname as the animation key so every navigation triggers the animation.
 */

interface AnimatedPageProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
