'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Sparkles,
  Globe,
  FileText,
} from 'lucide-react';

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
    }, 1000);

    const heroContentTimer = setTimeout(() => {
      setShowTelemetry(true);
      onAssembled?.();
    }, 1400);

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
      <div className="relative z-20 flex flex-col items-center justify-center overflow-visible bg-transparent cursor-default">
        <motion.div
          animate={
            prefersReducedMotion || !hasAssembled
              ? {}
              : {
                y: [-8, 8, -8],
              }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex flex-col items-center justify-center overflow-visible bg-transparent"
        >
          <div className="relative w-[300px] xs:w-[360px] sm:w-[460px] md:w-[510px] lg:w-[560px] xl:w-[620px] h-[300px] xs:h-[360px] sm:h-[460px] md:h-[510px] lg:h-[560px] xl:h-[620px] flex items-center justify-center overflow-visible bg-transparent">
            {/* Ambient Radial Backlight Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-pink-600/25 via-purple-600/30 to-cyan-500/25 blur-3xl opacity-85 animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute w-[60%] h-[60%] rounded-full bg-cyan-500/20 blur-2xl" />
            </div>

            {/* Glowing Celestial Orbital Rings from Benchmark */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88 }}
              animate={hasAssembled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="heroOrbitGradA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity="0.85" />
                    <stop offset="45%" stopColor="#A855F7" stopOpacity="0.35" />
                    <stop offset="80%" stopColor="#38BDF8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#06B6DA" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="heroOrbitGradB" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#06B6DA" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
                  </linearGradient>

                  <radialGradient id="nodeFlareA" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#06B6DA" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#06B6DA" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="nodeFlareB" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#EC4899" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <g transform="rotate(-20 300 300)">
                  <ellipse
                    cx="300"
                    cy="300"
                    rx="265"
                    ry="84"
                    fill="none"
                    stroke="url(#heroOrbitGradA)"
                    strokeWidth="1.8"
                    className="opacity-80"
                  />
                  <circle cx="560" cy="300" r="10" fill="url(#nodeFlareA)" />
                  <circle cx="560" cy="300" r="3.5" fill="#FFFFFF" />
                  <circle cx="40" cy="290" r="3" fill="#EC4899" />
                </g>

                <g transform="rotate(24 300 300)">
                  <ellipse
                    cx="300"
                    cy="300"
                    rx="280"
                    ry="92"
                    fill="none"
                    stroke="url(#heroOrbitGradB)"
                    strokeWidth="1.4"
                    strokeDasharray="4 6"
                    className="opacity-70"
                  />
                  <circle cx="28" cy="300" r="8" fill="url(#nodeFlareB)" />
                  <circle cx="28" cy="300" r="3" fill="#FFFFFF" />
                  <circle cx="572" cy="310" r="3" fill="#06B6DA" />
                </g>
              </svg>
            </motion.div>

            {/* Master 3D Nyra Logo Render */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 16 }}
              animate={hasAssembled ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-[78%] h-[78%] flex items-center justify-center select-none pointer-events-none"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/herologo.png"
                  alt="Nyra AI 3D Master Brand Logo"
                  className="w-full h-full object-contain drop-shadow-[0_28px_60px_rgba(236,72,153,0.3)] filter pointer-events-none select-none transition-transform"
                />

                {/* Sparkling Central Diamond Flare */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={hasAssembled ? { scale: [0, 1.25, 1], opacity: [0, 1, 0.95] } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full bg-cyan-300/35 blur-md animate-pulse" />
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M 24 6 Q 24 24 42 24 Q 24 24 24 42 Q 24 24 6 24 Q 24 24 24 6 Z"
                        fill="#FFFFFF"
                        className="drop-shadow-[0_0_12px_rgba(6,182,218,0.95)]"
                      />
                      <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div className="absolute -bottom-8 w-[60%] h-8 bg-gradient-to-t from-pink-500/10 via-purple-600/15 to-transparent blur-xl rounded-full pointer-events-none" />
          </div>
        </motion.div>
      </div>


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
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 shadow-inner">
            <Zap className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white truncate">Fast Inference</span>
            </div>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-pink-200/80 font-mono block truncate">
              Groq LPU Powered
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [6, -6, 6],
              x: prefersReducedMotion ? 0 : [2, -2, 2],
            }
            : { opacity: 0, scale: 0.85, y: 12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.25 },
          scale: { duration: 0.5, delay: 0.25 },
          y: { duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
          x: { duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute -top-1 right-0 xs:top-0 sm:top-2 sm:-right-6 z-30 rounded-2xl border border-pink-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[145px] xs:max-w-[170px] sm:max-w-[210px] transition-all cursor-pointer hover:border-violet-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 border border-pink-400/35 text-pink-200 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-pink-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white truncate">Multi-Model AI</span>
            </div>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-pink-200/80 font-mono block truncate">
              Llama 3.3 & Gemini
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [7, -7, 7],
              x: prefersReducedMotion ? 0 : [-3, 3, -3],
            }
            : { opacity: 0, scale: 0.85, y: 12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.35 },
          scale: { duration: 0.5, delay: 0.35 },
          y: { duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          x: { duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute bottom-2 left-0 xs:bottom-4 sm:bottom-6 sm:-left-6 z-30 rounded-2xl border border-pink-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[145px] xs:max-w-[180px] sm:max-w-[220px] transition-all hidden xs:block cursor-pointer hover:border-cyan-400/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 shadow-inner">
            <Globe className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white block truncate">Live Web Search</span>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-pink-200/80 font-mono truncate block">
              Tavily Verified Data
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
        animate={
          showTelemetry
            ? {
              opacity: 1,
              scale: 1,
              y: prefersReducedMotion ? 0 : [-7, 7, -7],
              x: prefersReducedMotion ? 0 : [3, -3, 3],
            }
            : { opacity: 0, scale: 0.85, y: 12 }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.45 },
          scale: { duration: 0.5, delay: 0.45 },
          y: { duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1.1 },
          x: { duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1.1 },
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="absolute bottom-2 right-0 xs:bottom-4 sm:bottom-6 sm:-right-6 z-30 rounded-2xl border border-pink-500/25 bg-[#140622]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[145px] xs:max-w-[180px] sm:max-w-[220px] transition-all hidden xs:block cursor-pointer hover:border-pink-400/50"
        onClick={() => router.push('/documents')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-400/35 text-violet-200 shadow-inner">
            <FileText className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-violet-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white block truncate">PDF Document RAG</span>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-pink-200/80 font-mono truncate block">
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
