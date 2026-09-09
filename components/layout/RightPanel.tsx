'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
}

export default function RightPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'w-full sm:w-[420px] md:w-[460px] lg:w-[490px]',
}: RightPanelProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="sm:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Floating Curved Window Right Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.6, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '100%', opacity: 0.6, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className={`
              fixed sm:relative inset-0 sm:inset-y-0 sm:left-auto right-0 z-50 sm:z-20
              ${widthClass} max-w-[100vw]
              h-full sm:h-[calc(100%-16px)] md:h-[calc(100%-20px)]
              sm:my-2 sm:mr-2 sm:ml-2 md:my-2.5 md:mr-2.5 md:ml-3
              rounded-none sm:rounded-[24px] md:rounded-[28px]
              overflow-hidden flex flex-col
              bg-[#faf8fd]/98 sm:bg-white/95 dark:bg-[#120c26]/98 dark:sm:bg-[#160f30]/98
              border-l sm:border border-purple-200/80 dark:border-purple-500/25
              shadow-[0_12px_45px_rgba(139,92,246,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(168,85,247,0.1)]
              text-zinc-900 dark:text-white shrink-0 select-none pointer-events-auto
              backdrop-blur-2xl
            `}
          >
            {/* Minimal Clean Header */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-purple-100 dark:border-purple-400/15 bg-transparent shrink-0">
              <div className="min-w-0 pr-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11.5px] text-purple-900/60 dark:text-purple-300/70 mt-0.5 truncate font-normal">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Clean Close Button */}
              <button
                onClick={onClose}
                className="h-7 w-7 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white hover:bg-purple-500/10 dark:hover:bg-white/[0.08] transition cursor-pointer active:scale-95 shrink-0"
                title="Close panel (Esc)"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Panel Content Body */}
            <div className="relative z-10 flex-1 overflow-hidden flex flex-col p-3.5 sm:p-4 select-text">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
