'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface HeroLogoVisualProps {
  onAssembled?: () => void;
}

export default function HeroLogoVisual({ onAssembled }: HeroLogoVisualProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [hasAssembled, setHasAssembled] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(Boolean(reduced));

    if (reduced) {
      setHasAssembled(true);
      setShowTelemetry(true);
      onAssembled?.();
      return;
    }

    const assembleTimer = setTimeout(() => {
      setHasAssembled(true);
    }, 400);

    const heroContentTimer = setTimeout(() => {
      setShowTelemetry(true);
      onAssembled?.();
    }, 1000);

    return () => {
      clearTimeout(assembleTimer);
      clearTimeout(heroContentTimer);
    };
  }, [onAssembled]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[420px] xs:max-w-[520px] sm:max-w-[660px] lg:max-w-[780px] xl:max-w-[880px] mx-auto min-h-[480px] xs:min-h-[540px] sm:min-h-[620px] lg:min-h-[700px] flex items-center justify-center select-none overflow-visible bg-transparent pointer-events-auto"
    >
      {/* =========================================================
          PRIMARY FLOATING ANIMATED NYRA LOGO
      ========================================================= */}
      <div className="relative z-20 flex flex-col items-center justify-center overflow-visible bg-transparent cursor-default">
        <div className="relative flex flex-col items-center justify-center overflow-visible bg-transparent">
          {/* =========================================================
              AMBIENT VOLUMETRIC COLOR GLOW (Scene Lighting)
          ========================================================= */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-0">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.7 }}
              animate={hasAssembled ? { opacity: 0.45, scale: 1.1 } : { opacity: 0.15, scale: 0.85 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] rounded-full bg-gradient-to-tr from-[#E52A83]/30 via-[#9333EA]/25 to-[#06B6D4]/20 blur-[100px] lg:blur-[130px]"
            />
          </div>

          {/* Logo Container Box */}
          <div className="relative w-[280px] xs:w-[340px] sm:w-[440px] md:w-[490px] lg:w-[550px] xl:w-[610px] h-[280px] xs:h-[340px] sm:h-[440px] md:h-[490px] lg:h-[550px] xl:h-[610px] flex items-center justify-center overflow-visible bg-transparent">
            
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1], // Smooth premium entrance
              }}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible drop-shadow-[0_28px_56px_rgba(0,0,0,0.65)]"
              style={{ willChange: 'transform' }}
            >
              <Image 
                src="/nyra-icon.svg"
                alt="Nyra AI Logo"
                fill
                priority
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================================
          4 FLOATING TELEMETRY VALUE CARDS AROUND LOGO
          Fade in at t = 1000ms after logo finishes assembly
      ========================================================= */}

      {/* 1. TOP-LEFT: Fast Inference Speed */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [-6, 6, -6],
              x: prefersReducedMotion ? 0 : [-2, 2, -2],
            }
            : { opacity: 0, scale: 0.85, y: 12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.1 },
          scale: { duration: 0.5, delay: 0.1 },
          y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 },
          x: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute -top-1 left-0 xs:top-0 sm:top-2 sm:-left-6 z-30 rounded-2xl border border-pink-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[145px] xs:max-w-[170px] sm:max-w-[210px] transition-all cursor-pointer hover:border-amber-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
          <div className="flex h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400/90 truncate">Inference</p>
            <p className="text-xs xs:text-sm sm:text-base font-bold text-white truncate drop-shadow-md">0.4s TTS</p>
          </div>
        </div>
      </motion.div>

      {/* 2. TOP-RIGHT: Cognitive Architecture */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: -12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [4, -4, 4],
              x: prefersReducedMotion ? 0 : [-3, 3, -3],
            }
            : { opacity: 0, scale: 0.85, y: -12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.25 },
          scale: { duration: 0.5, delay: 0.25 },
          y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
          x: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute top-8 right-2 xs:top-12 xs:-right-2 sm:top-24 sm:-right-10 z-30 rounded-2xl border border-cyan-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[155px] xs:max-w-[185px] sm:max-w-[230px] transition-all cursor-pointer hover:border-cyan-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
          <div className="flex h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-400/90 truncate">Reasoning</p>
            <p className="text-xs xs:text-sm sm:text-base font-bold text-white truncate drop-shadow-md">Multi-Agent</p>
          </div>
        </div>
      </motion.div>

      {/* 3. BOTTOM-LEFT: Vector Memory */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, x: -12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [5, -5, 5],
              x: prefersReducedMotion ? 0 : [2, -2, 2],
            }
            : { opacity: 0, scale: 0.85, x: -12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.4 },
          scale: { duration: 0.5, delay: 0.4 },
          y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          x: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute bottom-8 left-2 xs:bottom-12 xs:-left-2 sm:bottom-20 sm:-left-8 z-30 rounded-2xl border border-fuchsia-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[150px] xs:max-w-[180px] sm:max-w-[220px] transition-all cursor-pointer hover:border-fuchsia-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
          <div className="flex h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-fuchsia-400/20 shadow-[0_0_12px_rgba(232,121,249,0.3)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fuchsia-400 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4">
              <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10L11 14L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-fuchsia-400/90 truncate">Memory</p>
            <p className="text-xs xs:text-sm sm:text-base font-bold text-white truncate drop-shadow-md">10M+ Tokens</p>
          </div>
        </div>
      </motion.div>

      {/* 4. BOTTOM-RIGHT: Universal Code Gen */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, x: 12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [-4, 4, -4],
              x: prefersReducedMotion ? 0 : [3, -3, 3],
            }
            : { opacity: 0, scale: 0.85, x: 12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.55 },
          scale: { duration: 0.5, delay: 0.55 },
          y: { duration: 5.7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
          x: { duration: 5.7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute -bottom-2 right-1 xs:bottom-0 sm:bottom-2 sm:-right-4 z-30 rounded-2xl border border-emerald-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[145px] xs:max-w-[170px] sm:max-w-[210px] transition-all cursor-pointer hover:border-emerald-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
          <div className="flex h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.3)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4">
              <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400/90 truncate">Synthesis</p>
            <p className="text-xs xs:text-sm sm:text-base font-bold text-white truncate drop-shadow-md">O1 Ready</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
