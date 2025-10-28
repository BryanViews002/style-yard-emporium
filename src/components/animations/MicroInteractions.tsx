import { motion } from 'framer-motion';
import { ReactNode, InputHTMLAttributes } from 'react';

/**
 * Animated checkbox
 */
export const AnimatedCheckbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          animate={{
            backgroundColor: checked ? '#D4AF37' : '#E5E7EB',
            borderColor: checked ? '#D4AF37' : '#D1D5DB',
          }}
          className="w-5 h-5 border-2 rounded flex items-center justify-center"
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.div>
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};

/**
 * Animated input with focus effect
 */
export const AnimatedInput = ({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </motion.label>
      )}
      <motion.input
        whileFocus={{
          scale: 1.01,
          boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
        }}
        transition={{ duration: 0.2 }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Toast notification
 */
export const Toast = ({
  show,
  message,
  type = 'success',
  onClose,
}: {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-4 left-1/2 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

/**
 * Dropdown menu animation
 */
export const DropdownMenu = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      style={{
        transformOrigin: 'top',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Ripple effect button
 */
export const RippleButton = ({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.span
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-white rounded-full"
      />
      {children}
    </motion.button>
  );
};
