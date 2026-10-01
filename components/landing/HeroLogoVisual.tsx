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

    // Step 1 -> 2: Left V & Right V travel from -100vw and +100vw (1000ms)
    // Step 2: Logo lock-in moment at exactly t = 1000ms
    const assembleTimer = setTimeout(() => {
      setHasAssembled(true);
    }, 1000);

    // Step 3: Hold for 400ms (t = 1400ms), then trigger hero content and telemetry cards
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
      {/* =========================================================
          PRIMARY FLOATING ANIMATED NYRA LOGO
      ========================================================= */}
      <div className="relative z-20 flex flex-col items-center justify-center overflow-visible bg-transparent cursor-default">
        {/* Continuous Smooth Ambient Floating Oscillation */}
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
          {/* Logo Container Box */}
          <div className="relative w-[280px] xs:w-[340px] sm:w-[440px] md:w-[490px] lg:w-[550px] xl:w-[610px] h-[280px] xs:h-[340px] sm:h-[440px] md:h-[490px] lg:h-[550px] xl:h-[610px] flex items-center justify-center overflow-visible bg-transparent">
            {/* =========================================================
                PIECE 1: LEFT V ELEMENT (Inverted V Ribbon)
                Starts completely offscreen to the LEFT (-100vw)
                Flies in over 1000ms to exact final position (x: 0)
            ========================================================= */}
            <motion.div
              initial={prefersReducedMotion ? false : { x: '-100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1], // Polished physical decelerating easing
              }}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              style={{ willChange: 'transform' }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                overflow="visible"
                style={{ overflow: 'visible' }}
                className="w-full h-full drop-shadow-[0_28px_56px_rgba(0,0,0,0.65)] filter"
              >
                <defs>
                  {/* Volumetric Chromatic Gradient for Ribbon A (Left Inverted V) */}
                  <linearGradient id="heroRibbonA" x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor="#FFA0D2" />
                    <stop offset="18%" stopColor="#FF54A7" />
                    <stop offset="42%" stopColor="#E52A83" />
                    <stop offset="68%" stopColor="#B31372" />
                    <stop offset="85%" stopColor="#801456" />
                    <stop offset="100%" stopColor="#581C87" />
                  </linearGradient>

                  {/* Razor-Sharp Specular Glass Edge Highlight */}
                  <linearGradient id="heroGlassSheenA" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* Inner Filament Grad */}
                  <linearGradient id="heroFilamentGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  </linearGradient>

                  {/* Secondary Soft Highlight Reflection */}
                  <linearGradient id="heroSoftSheenA" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Main Volumetric Ribbon Body */}
                <path
                  d="M 104 392 L 104 168 C 104 125 138 93 182 106 C 216 115 243 147 269 186 L 346 304 C 371 342 394 371 408 387 C 416 397 406 413 394 413 L 312 413 C 285 413 261 398 245 374 L 179 275 L 179 392 C 179 405 168 416 155 416 L 128 416 C 115 416 104 405 104 392 Z"
                  fill="url(#heroRibbonA)"
                  stroke="#FF94CC"
                  strokeWidth="2.5"
                />

                {/* Inner Luminous Energy Filament Line */}
                <path
                  d="M 142 388 L 142 172 C 142 144 158 126 182 132 C 202 138 222 160 244 190 L 324 308 C 342 334 358 358 372 374"
                  stroke="url(#heroFilamentGradA)"
                  strokeWidth="1.8"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />

                {/* Outer Glass Bevel Highlight Rim */}
                <path
                  d="M 108 380 L 108 172 C 108 135 138 106 178 116 C 206 123 232 152 258 190 L 336 308 C 358 342 382 372 396 388"
                  stroke="url(#heroGlassSheenA)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Inner Chamfer Refraction Rim */}
                <path
                  d="M 175 388 L 175 272 L 243 372 C 258 394 280 408 304 408 L 388 408"
                  stroke="url(#heroSoftSheenA)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>

            {/* =========================================================
                PIECE 2: RIGHT V ELEMENT (Upright V Ribbon)
                Starts completely offscreen to the RIGHT (+100vw)
                Flies in over 1000ms to exact final position (x: 0)
            ========================================================= */}
            <motion.div
              initial={prefersReducedMotion ? false : { x: '100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1], // Symmetrical entrance easing
              }}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              style={{ willChange: 'transform' }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                overflow="visible"
                style={{ overflow: 'visible' }}
                className="w-full h-full drop-shadow-[0_28px_56px_rgba(0,0,0,0.65)] filter"
              >
                <defs>
                  {/* Volumetric Chromatic Gradient for Ribbon B (Right Upright V) */}
                  <linearGradient id="heroRibbonB" x1="90%" y1="0%" x2="10%" y2="100%">
                    <stop offset="0%" stopColor="#E9D5FF" />
                    <stop offset="20%" stopColor="#C084FC" />
                    <stop offset="45%" stopColor="#9333EA" />
                    <stop offset="70%" stopColor="#6366F1" />
                    <stop offset="88%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>

                  {/* Razor-Sharp Specular Glass Edge Highlight */}
                  <linearGradient id="heroGlassSheenB" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* Inner Filament Grad */}
                  <linearGradient id="heroFilamentGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  </linearGradient>

                  {/* Secondary Soft Highlight Reflection */}
                  <linearGradient id="heroSoftSheenB" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Main Volumetric Ribbon Body */}
                <path
                  d="M 408 120 L 408 344 C 408 387 374 419 330 406 C 296 397 269 365 243 326 L 166 208 C 141 170 118 141 104 125 C 96 115 106 99 118 99 L 200 99 C 227 99 251 114 267 138 L 333 237 L 333 120 C 333 107 344 96 357 96 L 384 96 C 397 96 408 107 408 120 Z"
                  fill="url(#heroRibbonB)"
                  stroke="#A5B4FC"
                  strokeWidth="2.5"
                />

                {/* Inner Luminous Energy Filament Line */}
                <path
                  d="M 370 124 L 370 340 C 370 368 354 386 330 380 C 310 374 290 352 268 322 L 188 204 C 170 178 154 154 140 138"
                  stroke="url(#heroFilamentGradB)"
                  strokeWidth="1.8"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />

                {/* Outer Glass Bevel Highlight Rim */}
                <path
                  d="M 404 132 L 404 340 C 404 376 376 404 336 394 C 308 387 282 358 256 320 L 178 202 C 156 168 132 138 118 122"
                  stroke="url(#heroGlassSheenB)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />

                {/* Inner Chamfer Refraction Rim */}
                <path
                  d="M 337 124 L 337 240 L 269 140 C 254 118 232 104 208 104 L 124 104"
                  stroke="url(#heroSoftSheenB)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>

            {/* =========================================================
                CENTRAL FACETED QUANTUM PRISM SYNAPSE & STARFLARE
                Locks into place at t = 1000ms when both V pieces meet
            ========================================================= */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={hasAssembled ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                overflow="visible"
                style={{ overflow: 'visible' }}
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="synapseNorth" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
                  </linearGradient>

                  <linearGradient id="synapseEast" x1="100%" y1="50%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
                  </linearGradient>

                  <linearGradient id="synapseSouth" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#E52A83" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                  </linearGradient>

                  <linearGradient id="synapseWest" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#E52A83" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Diamond Facet 1: North */}
                <path d="M 256 204 L 296 256 L 256 256 Z" fill="url(#synapseNorth)" />

                {/* Diamond Facet 2: East */}
                <path d="M 296 256 L 256 308 L 256 256 Z" fill="url(#synapseEast)" />

                {/* Diamond Facet 3: South */}
                <path d="M 256 308 L 216 256 L 256 256 Z" fill="url(#synapseSouth)" />

                {/* Diamond Facet 4: West */}
                <path d="M 216 256 L 256 204 L 256 256 Z" fill="url(#synapseWest)" />

                {/* Diamond Outer Chamfer Border */}
                <path
                  d="M 256 204 L 296 256 L 256 308 L 216 256 Z"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="drop-shadow-[0_0_12px_#FFFFFF]"
                />

                {/* Cross-Facet Dividers */}
                <line x1="256" y1="204" x2="256" y2="308" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
                <line x1="216" y1="256" x2="296" y2="256" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

                {/* Glowing Core Synapse Node */}
                <circle
                  cx="256"
                  cy="256"
                  r="7"
                  fill="#38BDF8"
                  className="animate-pulse shadow-lg"
                />

                {/* 4-Point Micro Starflare */}
                <path
                  d="M 256 242 Q 256 256 270 256 Q 256 256 256 270 Q 256 256 242 256 Q 256 256 256 242 Z"
                  fill="#FFFFFF"
                  opacity="0.95"
                  className="animate-spin"
                  style={{ transformOrigin: '256px 256px', animationDuration: '8s' }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* =========================================================
          4 FLOATING TELEMETRY VALUE CARDS AROUND LOGO
          Fade in at t = 1400ms after logo finishes assembly
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

      {/* 2. TOP-RIGHT: Multi-Model Reasoning */}
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

      {/* 3. BOTTOM-LEFT: Live Web Search */}
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

      {/* 4. BOTTOM-RIGHT: Multimodal Document & Privacy */}
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
