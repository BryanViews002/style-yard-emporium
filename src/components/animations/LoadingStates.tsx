import { motion } from 'framer-motion';

/**
 * Skeleton loader with shimmer effect
 */
export const SkeletonCard = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-gray-200 h-64 rounded-lg shimmer" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/2 shimmer" />
      </div>
    </div>
  );
};

/**
 * Product grid skeleton
 */
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

/**
 * Spinner with smooth rotation
 */
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`${sizes[size]} border-4 border-gray-200 border-t-accent rounded-full`}
    />
  );
};

/**
 * Loading overlay
 */
export const LoadingOverlay = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4"
      >
        <Spinner size="lg" />
        <p className="text-gray-600">Loading...</p>
      </motion.div>
    </motion.div>
  );
};

/**
 * Progress bar
 */
export const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full bg-accent"
      />
    </div>
  );
};
