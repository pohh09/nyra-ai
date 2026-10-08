'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

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

    const lockTimer = setTimeout(() => {
      setHasFormed(true);
    }, 400);

    const textTimer = setTimeout(() => {
      setShowBrandText(true);
    }, 1000);

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
        <div className="relative p-6 flex items-center justify-center overflow-visible w-[250px] xs:w-[290px] sm:w-[340px] md:w-[380px] lg:w-[410px] h-[250px] xs:h-[290px] sm:h-[340px] md:h-[380px] lg:h-[410px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1], // Smooth premium entrance
            }}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)]"
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
