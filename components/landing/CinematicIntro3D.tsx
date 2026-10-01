'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CinematicIntro3DProps {
  onComplete: () => void;
}

export default function CinematicIntro3D({ onComplete }: CinematicIntro3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [hasFormed, setHasFormed] = useState(false);
  const [showBrandText, setShowBrandText] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Skip handler with smooth fade exit
  const handleSkip = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nyra_intro_seen', 'true');
    }
    setIsExiting(true);

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.03,
        filter: 'blur(8px)',
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          onCompleteRef.current();
        },
      });
    } else {
      onCompleteRef.current();
    }
  }, []);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Main Intro Animation Sequence (~2.6s total)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nyra_intro_seen', 'true');
      }
      onCompleteRef.current();
      return;
    }

    // Step 1 -> 2: Left V & Right V glide in from -100vw and +100vw (1000ms)
    // Step 2: Logo lock-in moment at t = 1000ms
    const lockTimer = setTimeout(() => {
      setHasFormed(true);
    }, 1000);

    // Step 3: Brand text & subtitle appear at t = 1200ms
    const textTimer = setTimeout(() => {
      setShowBrandText(true);
    }, 1200);

    // Step 4: Scene 2 Transition — Smooth fade into landing page at t = 2200ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.025,
          filter: 'blur(6px)',
          duration: 0.65,
          ease: 'power2.inOut',
          onComplete: () => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('nyra_intro_seen', 'true');
            }
            onCompleteRef.current();
          },
        });
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('nyra_intro_seen', 'true');
        }
        onCompleteRef.current();
      }
    }, 2200);

    return () => {
      clearTimeout(lockTimer);
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030006] text-white select-none overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* =========================================================
          AMBIENT VOLUMETRIC COLOR GLOW (Scene Lighting)
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={hasFormed ? { opacity: 0.45, scale: 1.1 } : { opacity: 0.15, scale: 0.85 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-[500px] sm:w-[650px] lg:w-[800px] h-[500px] sm:h-[650px] lg:h-[800px] rounded-full bg-gradient-to-tr from-[#E52A83]/30 via-[#9333EA]/25 to-[#06B6D4]/20 blur-[130px]"
        />
      </div>

      {/* =========================================================
          TOP-RIGHT SKIP INTRO PILL
      ========================================================= */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-xl text-xs font-mono text-[#D4C5E2] hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <span>Skip Intro</span>
          <span className="text-[10px] text-white/40 hidden sm:inline">[Esc]</span>
          <ArrowRight className="h-3 w-3 text-pink-300" />
        </button>
      </div>

      {/* =========================================================
          SCENE 1: ANIMATED NYRA LOGO OPENING CENTERPIECE
      ========================================================= */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Vector Nyra Neural Logo */}
        <div className="relative p-6 flex items-center justify-center overflow-visible">
          <svg
            width="512"
            height="512"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            overflow="visible"
            style={{ overflow: 'visible' }}
            className="w-[200px] xs:w-[240px] sm:w-[290px] md:w-[330px] lg:w-[360px] h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] filter"
          >
            <defs>
              {/* Volumetric Ribbon A Gradient (Left Inverted V) */}
              <linearGradient id="introRibbonA" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#FFA0D2" />
                <stop offset="20%" stopColor="#FF54A7" />
                <stop offset="45%" stopColor="#E52A83" />
                <stop offset="70%" stopColor="#B31372" />
                <stop offset="100%" stopColor="#6B21A8" />
              </linearGradient>

              {/* Volumetric Ribbon B Gradient (Right Upright V) */}
              <linearGradient id="introRibbonB" x1="90%" y1="0%" x2="10%" y2="100%">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="20%" stopColor="#C084FC" />
                <stop offset="45%" stopColor="#9333EA" />
                <stop offset="70%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>

              {/* Specular Razor-Sharp Glass Highlight */}
              <linearGradient id="introGlassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Inner Core Filament */}
              <linearGradient id="introFilament" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
              </linearGradient>

              {/* Synapse Prism Facets */}
              <linearGradient id="introFacetNorth" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
              </linearGradient>

              <linearGradient id="introFacetEast" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
              </linearGradient>

              <linearGradient id="introFacetSouth" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#E52A83" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
              </linearGradient>

              <linearGradient id="introFacetWest" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E52A83" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* =========================================================
                PIECE 1: LEFT V ELEMENT
                Travels smoothly from offscreen left (-100vw) to center
            ========================================================= */}
            <motion.g
              initial={{ x: '-100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <path
                d="M 104 392 L 104 168 C 104 125 138 93 182 106 C 216 115 243 147 269 186 L 346 304 C 371 342 394 371 408 387 C 416 397 406 413 394 413 L 312 413 C 285 413 261 398 245 374 L 179 275 L 179 392 C 179 405 168 416 155 416 L 128 416 C 115 416 104 405 104 392 Z"
                fill="url(#introRibbonA)"
                stroke="#FF80BF"
                strokeWidth="2.5"
              />
              <path
                d="M 142 388 L 142 172 C 142 144 158 126 182 132 C 202 138 222 160 244 190 L 324 308 C 342 334 358 358 372 374"
                stroke="url(#introFilament)"
                strokeWidth="1.8"
                strokeDasharray="6 8"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M 108 380 L 108 172 C 108 135 138 106 178 116 C 206 123 232 152 258 190 L 336 308 C 358 342 382 372 396 388"
                stroke="url(#introGlassSheen)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>

            {/* =========================================================
                PIECE 2: RIGHT V ELEMENT
                Travels smoothly from offscreen right (+100vw) to center
            ========================================================= */}
            <motion.g
              initial={{ x: '100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <path
                d="M 408 120 L 408 344 C 408 387 374 419 330 406 C 296 397 269 365 243 326 L 166 208 C 141 170 118 141 104 125 C 96 115 106 99 118 99 L 200 99 C 227 99 251 114 267 138 L 333 237 L 333 120 C 333 107 344 96 357 96 L 384 96 C 397 96 408 107 408 120 Z"
                fill="url(#introRibbonB)"
                stroke="#93C5FD"
                strokeWidth="2.5"
              />
              <path
                d="M 370 124 L 370 340 C 370 368 354 386 330 380 C 310 374 290 352 268 322 L 188 204 C 170 178 154 154 140 138"
                stroke="url(#introFilament)"
                strokeWidth="1.8"
                strokeDasharray="6 8"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M 404 132 L 404 340 C 404 376 376 404 336 394 C 308 387 282 358 256 320 L 178 202 C 156 168 132 138 118 122"
                stroke="url(#introGlassSheen)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
            </motion.g>

            {/* =========================================================
                CENTRAL QUANTUM SYNAPSE PRISM (Burst on assembly)
            ========================================================= */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={hasFormed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <path d="M 256 204 L 296 256 L 256 256 Z" fill="url(#introFacetNorth)" />
              <path d="M 296 256 L 256 308 L 256 256 Z" fill="url(#introFacetEast)" />
              <path d="M 256 308 L 216 256 L 256 256 Z" fill="url(#introFacetSouth)" />
              <path d="M 216 256 L 256 204 L 256 256 Z" fill="url(#introFacetWest)" />
              <path
                d="M 256 204 L 296 256 L 256 308 L 216 256 Z"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                className="drop-shadow-[0_0_12px_#FFFFFF]"
              />
              <circle cx="256" cy="256" r="7" fill="#38BDF8" className="animate-pulse shadow-lg" />
              <path
                d="M 256 242 Q 256 256 270 256 Q 256 256 256 270 Q 256 256 242 256 Q 256 256 256 242 Z"
                fill="#FFFFFF"
                opacity="0.95"
                className="animate-spin"
                style={{ transformOrigin: '256px 256px', animationDuration: '8s' }}
              />
            </motion.g>
          </svg>
        </div>

        {/* Brand Wordmark & Tagline Reveal */}
        <div className="mt-4 flex flex-col items-center text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={showBrandText ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-2"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent">
              NYRA AI
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={showBrandText ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="mt-1 text-xs xs:text-sm font-mono tracking-widest text-[#B5A8C9] uppercase"
          >
            Intelligence Workspace
          </motion.p>
        </div>
      </div>
    </div>
  );
}
