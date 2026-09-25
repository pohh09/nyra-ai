'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';

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
  widthClass = 'w-full md:w-[460px] lg:w-[490px]',
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
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Full-screen Slide-Over Drawer on Mobile / Curved Floating Panel on Desktop (md+) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={`
              fixed md:relative
              inset-0 md:inset-y-0 md:left-auto md:right-0
              z-[101] md:z-20
              w-full ${widthClass}
              h-[100dvh] md:h-[calc(100%-20px)]
              md:my-2.5 md:mr-2.5 md:ml-3
              rounded-none md:rounded-[28px]
              overflow-hidden flex flex-col
              bg-[#FFFFFF] dark:bg-[#0e091d] md:dark:bg-[#120c24]/98
              border-0 md:border md:border-[#E8E4EF] dark:md:border-white/10
              shadow-none md:shadow-[0_20px_60px_rgba(0,0,0,0.9)]
              text-zinc-900 dark:text-white shrink-0 select-none pointer-events-auto
              backdrop-blur-2xl
            `}
          >
            {/* Native-Feeling Clean Header */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#E8E4EF] dark:border-white/10 bg-transparent shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Mobile Back / Close Button */}
                <button
                  onClick={onClose}
                  className="md:hidden flex h-9 w-9 -ml-1 rounded-xl items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-95 cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden md:flex h-8 w-8 rounded-xl items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition cursor-pointer active:scale-95 shrink-0"
                title="Close panel (Esc)"
                aria-label="Close panel"
              >
                <X size={17} />
              </button>
            </div>

            {/* Panel Content Body */}
            <div className="relative z-10 flex-1 overflow-hidden flex flex-col p-3.5 sm:p-4 md:p-5 select-text">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
