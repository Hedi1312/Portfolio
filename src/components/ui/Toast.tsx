'use client';

import { AnimatePresence, m } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

function ToastItem({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <m.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${
        type === 'success'
          ? 'bg-success-100 dark:bg-[#0b2e1f] border-success-300 dark:border-success-700 text-success-700 dark:text-success-300'
          : 'bg-danger-100 dark:bg-[#2e0b0b] border-danger-300 dark:border-danger-700 text-danger-700 dark:text-danger-300'
      }`}
    >
      {type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <FiX size={16} />
      </button>
    </m.div>
  );
}

// Reusable hook
export function useToast() {
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

export function ToastContainer({
  toast,
  onClose,
}: {
  toast: { type: ToastType; message: string } | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <AnimatePresence>
        {toast && <ToastItem type={toast.type} message={toast.message} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}
