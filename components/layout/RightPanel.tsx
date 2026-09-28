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
  widthClass = 'w-full md:w-[380px] lg:w-[400px] xl:w-[420px]',
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
              h-[100dvh] md:h-[calc(100%-16px)]
              md:my-2 md:mr-2 md:ml-0
              rounded-none md:rounded-2xl lg:rounded-[24px]
              overflow-hidden flex flex-col
              bg-white dark:bg-[#0E0514] md:dark:bg-[#12081C]
              border-0 md:border md:border-[#E8E4EF] dark:md:border-white/[0.08]
              shadow-none md:shadow-[0_12px_36px_rgba(38,24,39,0.06)] dark:md:shadow-[0_20px_50px_rgba(0,0,0,0.7)]
              text-[#261827] dark:text-zinc-100 shrink-0 select-none pointer-events-auto
              backdrop-blur-xl
            `}
          >
            {/* Native-Feeling Clean Header */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#E8E4EF] dark:border-white/[0.08] bg-transparent shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Mobile Back / Close Button */}
                <button
                  onClick={onClose}
                  className="md:hidden flex h-9 w-9 -ml-1 rounded-xl items-center justify-center text-[#261827] dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-95 cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#261827] dark:text-white tracking-tight leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[11.5px] text-[#6E6072] dark:text-zinc-400 mt-0.5 truncate font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden md:flex h-8 w-8 rounded-xl items-center justify-center text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition cursor-pointer active:scale-95 shrink-0"
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

