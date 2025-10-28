import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Optimized animated card component for product cards
 * Uses GPU-accelerated transforms for smooth performance
 */
export const AnimatedCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.6, 0.05, 0.01, 0.9], // Custom easing for luxury feel
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className={className}
      style={{
        willChange: 'transform', // Optimize for animation
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Product card with hover effects
 */
export const AnimatedProductCard = ({ children, className = '' }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      style={{
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Image zoom on hover (optimized)
 */
export const AnimatedImage = ({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) => {
  return (
    <div className="overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        className={className}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.4, ease: 'easeOut' },
        }}
        style={{
          willChange: 'transform',
        }}
        loading="lazy"
      />
    </div>
  );
};
