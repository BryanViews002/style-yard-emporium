import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Cart badge with bounce animation
 */
export const CartBadge = ({ count }: { count: number }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 15,
        }}
        className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
};

/**
 * Cart item with slide animation
 */
export const CartItem = ({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3 }}
      layout // Smooth layout changes
    >
      {children}
    </motion.div>
  );
};

/**
 * Add to cart success notification
 */
export const AddToCartNotification = ({
  show,
  productName,
}: {
  show: boolean;
  productName: string;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-w-sm"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="bg-green-500 rounded-full p-2"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <div>
              <p className="font-semibold text-sm">Added to cart!</p>
              <p className="text-xs text-gray-600">{productName}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Quantity change animation
 */
export const QuantityButton = ({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        willChange: 'transform',
      }}
    >
      {children}
    </motion.button>
  );
};
