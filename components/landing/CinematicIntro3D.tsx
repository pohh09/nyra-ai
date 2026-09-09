'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Sparkles,
  Zap,
  MessageSquare,
  FileText,
  Globe,
  Code2,
  Database,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';

interface CinematicIntro3DProps {
  onComplete: () => void;
}

export default function CinematicIntro3D({ onComplete }: CinematicIntro3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const robotEyesRef = useRef<SVGGElement>(null);
  const chestCoreRef = useRef<SVGCircleElement>(null);
  const earSensorsRef = useRef<SVGGElement>(null);
  const brandGroupRef = useRef<HTMLDivElement>(null);
  const energyPulseRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const flareBeamRef = useRef<HTMLDivElement>(null);
  const orbitRingsRef = useRef<HTMLDivElement>(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);

  const [hasSkipped, setHasSkipped] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Floating Micro-particles Data (restrained & subtle)
  const particles = useMemo(
    () => [
      { size: 2, left: 14, top: 18, z: -180, color: '#C4B5FD', opacity: 0.5 },
      { size: 3, left: 24, top: 74, z: -320, color: '#818CF8', opacity: 0.6 },
      { size: 1.5, left: 38, top: 28, z: -120, color: '#E9D5FF', opacity: 0.4 },
      { size: 2.5, left: 62, top: 16, z: -260, color: '#38BDF8', opacity: 0.55 },
      { size: 3, left: 78, top: 70, z: -380, color: '#C084FC', opacity: 0.6 },
      { size: 1.5, left: 86, top: 34, z: -190, color: '#E9D5FF', opacity: 0.45 },
      { size: 2, left: 18, top: 52, z: -240, color: '#A78BFA', opacity: 0.5 },
      { size: 2.5, left: 54, top: 82, z: -300, color: '#38BDF8', opacity: 0.5 },
      { size: 2, left: 82, top: 18, z: -220, color: '#C4B5FD', opacity: 0.4 },
      { size: 1.5, left: 45, top: 65, z: -160, color: '#38BDF8', opacity: 0.5 },
    ],
    []
  );

  // Skip handler with smooth exit transition
  const handleSkip = () => {
    if (hasSkipped) return;
    setHasSkipped(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nyra_intro_seen', 'true');
    }
    if (masterTimeline.current) {
      masterTimeline.current.kill();
    }
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.04,
        filter: 'blur(6px)',
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          onCompleteRef.current();
        },
      });
    } else {
      onCompleteRef.current();
    }
  };

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mouse Parallax on Desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current) return;
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(cameraRef.current, {
        rotationY: xNorm * 3.5,
        rotationX: -yNorm * 2.5,
        duration: 0.7,
        ease: 'power1.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP 3D Cinematic Animation Orchestration (~3.6s total)
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

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('nyra_intro_seen', 'true');
          }
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
              onCompleteRef.current();
            },
          });
        },
      });

      masterTimeline.current = tl;

      // ==========================================
      // INITIAL 3D SETUP & STAGING
      // ==========================================
      gsap.set(skipBtnRef.current, { opacity: 0, y: -8 });
      gsap.set(cameraRef.current, { z: -80, rotationX: 0, rotationY: 0 });

      // Robot initial state
      gsap.set(robotRef.current, {
        opacity: 0,
        y: 25,
        z: -140,
        scale: 0.88,
        rotationX: 8,
      });

      // Eyes in dormant sleep state
      gsap.set(robotEyesRef.current, {
        scaleY: 0.08,
        scaleX: 0.5,
        opacity: 0.35,
        transformOrigin: '50% 50%',
      });

      // Accents dormant
      gsap.set([chestCoreRef.current, earSensorsRef.current], { opacity: 0.3 });
      gsap.set(energyPulseRef.current, { scale: 0.2, opacity: 0 });
      gsap.set(flareBeamRef.current, { scaleX: 0, opacity: 0 });
      gsap.set(orbitRingsRef.current, { opacity: 0, scale: 0.7, rotationZ: 0 });

      // 5 3D Capability Cards Initial States (positioned with generous space around robot)
      gsap.set('.card-chat', {
        x: -480,
        y: -170,
        z: -350,
        rotationY: 22,
        rotationX: -8,
        opacity: 0,
        scale: 0.72,
      });
      gsap.set('.card-docs', {
        x: 480,
        y: -160,
        z: -330,
        rotationY: -22,
        rotationX: -6,
        opacity: 0,
        scale: 0.72,
      });
      gsap.set('.card-web', {
        x: -450,
        y: 150,
        z: -270,
        rotationY: 18,
        rotationX: 8,
        opacity: 0,
        scale: 0.72,
      });
      gsap.set('.card-code', {
        x: 460,
        y: 145,
        z: -280,
        rotationY: -18,
        rotationX: 8,
        opacity: 0,
        scale: 0.72,
      });
      gsap.set('.card-memory', {
        x: 0,
        y: -250,
        z: -370,
        rotationX: 14,
        opacity: 0,
        scale: 0.7,
      });

      // Brand text initial state
      gsap.set(brandGroupRef.current, {
        opacity: 0,
        y: 18,
        scale: 0.94,
        filter: 'blur(8px)',
      });

      // Reveal Skip button
      tl.to(skipBtnRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.1);

      // ==========================================
      // ACT 1: 3D CAPABILITY MODULES MATERIALIZE (0.2s - 1.1s)
      // Communicating: AI Chat, Docs, Web Search, Code, Memory
      // ==========================================
      tl.to(
        orbitRingsRef.current,
        {
          opacity: 0.7,
          scale: 1,
          duration: 1.2,
          ease: 'power2.out',
        },
        0.15
      );

      // Chat Stream Module arrives (generous left-top clearance)
      tl.to(
        '.card-chat',
        {
          x: -385,
          y: -125,
          z: -50,
          rotationY: 15,
          rotationX: -4,
          opacity: 1,
          scale: 0.92,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.25
      );

      // PDF & Docs Module arrives (generous right-top clearance)
      tl.to(
        '.card-docs',
        {
          x: 385,
          y: -115,
          z: -40,
          rotationY: -15,
          rotationX: -4,
          opacity: 1,
          scale: 0.92,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.35
      );

      // Real-Time Web Search Module arrives (generous left-bottom clearance)
      tl.to(
        '.card-web',
        {
          x: -360,
          y: 115,
          z: 15,
          rotationY: 12,
          rotationX: 6,
          opacity: 1,
          scale: 0.9,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.45
      );

      // Code Generation Studio Module arrives (generous right-bottom clearance)
      tl.to(
        '.card-code',
        {
          x: 365,
          y: 110,
          z: 10,
          rotationY: -12,
          rotationX: 6,
          opacity: 1,
          scale: 0.9,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.55
      );

      // AI Memory & Workflows Module arrives (sitting comfortably above crest)
      tl.to(
        '.card-memory',
        {
          x: 0,
          y: -210,
          z: -100,
          rotationX: 8,
          opacity: 1,
          scale: 0.88,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.65
      );

      // ==========================================
      // ACT 2: NYRA ROBOT COMPANION AWAKENING (0.7s - 1.6s)
      // Robot emerges at center of the orbiting capabilities
      // ==========================================
      tl.to(
        robotRef.current,
        {
          opacity: 1,
          y: 0,
          z: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.85,
          ease: 'power3.out',
        },
        0.7
      );

      // Camera smoothly dollies forward in 3D
      tl.to(
        cameraRef.current,
        {
          z: 60,
          duration: 2.8,
          ease: 'power1.inOut',
        },
        0.5
      );

      // Power-On: Eyes illuminate and expand
      tl.to(
        robotEyesRef.current,
        {
          scaleY: 1,
          scaleX: 1,
          opacity: 1,
          duration: 0.45,
          ease: 'back.out(2.2)',
        },
        0.95
      );

      // Power Core & Ear sensors light up
      tl.to(
        [chestCoreRef.current, earSensorsRef.current],
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        1.0
      );

      // Radial energy wave connects robot with surrounding capability cards
      tl.fromTo(
        energyPulseRef.current,
        { scale: 0.2, opacity: 0.9 },
        {
          scale: 2.8,
          opacity: 0,
          duration: 1.1,
          ease: 'power2.out',
        },
        1.0
      );

      // Visor subtle flare beam
      tl.to(
        flareBeamRef.current,
        {
          scaleX: 1,
          opacity: 0.8,
          duration: 0.4,
          ease: 'power3.out',
        },
        1.05
      );
      tl.to(
        flareBeamRef.current,
        {
          opacity: 0,
          scaleX: 1.4,
          duration: 0.45,
          ease: 'power2.in',
        },
        1.45
      );

      // ==========================================
      // ACT 3: UNIFIED BRAND & WORKSPACE REVEAL (1.6s - 2.8s)
      // "NYRA AI" typography resolves with status beacon
      // ==========================================
      tl.to(
        brandGroupRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
        },
        1.5
      );

      // Subtle orbital parallax float of capability cards
      tl.to(
        ['.card-chat', '.card-web'],
        {
          x: '-=12',
          y: '+=8',
          rotationY: '+=3',
          duration: 1.4,
          ease: 'sine.inOut',
          yoyo: true,
        },
        1.6
      );
      tl.to(
        ['.card-docs', '.card-code'],
        {
          x: '+=12',
          y: '-=8',
          rotationY: '-=3',
          duration: 1.4,
          ease: 'sine.inOut',
          yoyo: true,
        },
        1.6
      );

      // ==========================================
      // ACT 4: SEAMLESS CONVERGENCE & HERO HANDOFF (2.9s - 3.5s)
      // Smooth optical zoom & handoff to the landing page
      // ==========================================
      tl.to(
        ['.card-chat', '.card-docs', '.card-web', '.card-code', '.card-memory'],
        {
          z: -350,
          scale: 0.7,
          opacity: 0,
          stagger: 0.04,
          filter: 'blur(8px)',
          duration: 0.6,
          ease: 'power2.in',
        },
        2.9
      );

      tl.to(
        [robotRef.current, brandGroupRef.current, orbitRingsRef.current],
        {
          opacity: 0.85,
          scale: 1.04,
          duration: 0.45,
          ease: 'power2.in',
        },
        3.0
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070210] text-white overflow-hidden select-none pointer-events-auto"
      style={{ willChange: 'opacity, transform' }}
    >
      {/* 3D PERSPECTIVE VIEWPORT */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D CAMERA RIG */}
        <div
          ref={cameraRef}
          className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {/* =========================================================
              DEEP VIOLET VOLUMETRIC ATMOSPHERE & 3D MATRIX GRID
          ========================================================= */}
          {/* Ambient Deep Violet Center Glow */}
          <div
            className="absolute h-[560px] w-[560px] sm:h-[720px] sm:w-[720px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/22 via-[#6D28D9]/16 to-[#38BDF8]/10 blur-[110px] sm:blur-[150px] pointer-events-none"
            style={{ transform: 'translateZ(-300px)' }}
          />

          {/* Floor Horizon Reflection */}
          <div
            className="absolute -bottom-36 w-[1000px] h-[380px] rounded-full bg-[#3B1768]/20 blur-[100px] pointer-events-none"
            style={{ transform: 'rotateX(80deg) translateZ(-120px)' }}
          />

          {/* Floating Starlight & Micro-particles */}
          <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            {particles.map((p, idx) => (
              <div
                key={idx}
                className="absolute rounded-full"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  transform: `translateZ(${p.z}px)`,
                  boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>

          {/* Orbit Telemetry Tracks (scaled to encompass wider card orbit) */}
          <div
            ref={orbitRingsRef}
            className="absolute flex items-center justify-center pointer-events-none opacity-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute h-[520px] w-[520px] sm:h-[680px] sm:w-[680px] rounded-full border border-purple-400/20 border-dashed animate-[spin_40s_linear_infinite]" />
            <div className="absolute h-[740px] w-[740px] sm:h-[940px] sm:w-[940px] rounded-full border border-cyan-400/15 animate-[spin_55s_linear_infinite_reverse]" />
          </div>

          {/* Radial Energy Pulse Wave */}
          <div
            ref={energyPulseRef}
            className="absolute h-64 w-64 sm:h-80 sm:w-80 rounded-full border-2 border-purple-400/60 bg-gradient-to-r from-purple-600/20 to-cyan-400/20 shadow-[0_0_70px_rgba(168,85,247,0.45)] pointer-events-none"
            style={{ transform: 'translateZ(-70px)' }}
          />

          {/* =========================================================
              5 FLOATING 3D CAPABILITY CARDS (TELLING NYRA'S PRODUCT STORY)
          ========================================================= */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex" style={{ transformStyle: 'preserve-3d' }}>
            {/* 1. Contextual AI Chat & Inference Stream */}
            <div
              className="card-chat absolute w-[240px] lg:w-[260px] rounded-2xl border border-purple-400/35 bg-[#120826]/90 p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-purple-400/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-950/80 border border-purple-400/40 text-purple-300">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">AI Reasoning</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  850 tok/s
                </span>
              </div>
              <p className="mt-2 text-[10.5px] text-[#D4CBE5]/85 leading-snug">
                Streaming intelligence with multi-turn context retention.
              </p>
            </div>

            {/* 2. PDF & Document Knowledge RAG */}
            <div
              className="card-docs absolute w-[240px] lg:w-[260px] rounded-2xl border border-amber-400/35 bg-[#140b22]/90 p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-amber-400/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-400/40 text-amber-300">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Document RAG</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300">PDF.js Engine</span>
              </div>
              <p className="mt-2 text-[10.5px] text-[#D4CBE5]/85 leading-snug">
                Deep document analysis with instant chapter summaries.
              </p>
            </div>

            {/* 3. Real-Time Web Search & Source Citations */}
            <div
              className="card-web absolute w-[230px] lg:w-[250px] rounded-2xl border border-cyan-400/35 bg-[#0e0c24]/90 p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-cyan-400/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Live Web Data</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">Tavily Search</span>
              </div>
              <p className="mt-2 text-[10.5px] text-[#D4CBE5]/85 leading-snug">
                Internet retrieval with verified source citations.
              </p>
            </div>

            {/* 4. Code Generation Studio */}
            <div
              className="card-code absolute w-[230px] lg:w-[250px] rounded-2xl border border-emerald-400/35 bg-[#0c1022]/90 p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-400/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                    <Code2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Code Studio</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300">TS 5.5 Edge</span>
              </div>
              <p className="mt-2 text-[10.5px] text-[#D4CBE5]/85 leading-snug">
                Syntax-highlighted code editing and instant refactoring.
              </p>
            </div>

            {/* 5. Continuous AI Memory */}
            <div
              className="card-memory absolute w-[240px] rounded-2xl border border-purple-400/30 bg-[#16092d]/90 p-3 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-purple-300" />
                  <span className="text-xs font-bold text-white tracking-tight">Continuous Memory</span>
                </div>
                <span className="text-[9.5px] font-mono text-purple-300">Unified Graph</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              CENTRAL NYRA AI COMPANION ROBOT (INTELLIGENCE ENTITY)
          ========================================================= */}
          <div
            ref={robotRef}
            className="relative flex flex-col items-center drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] z-20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Robot Head Assembly SVG */}
            <div className="relative">
              <svg
                width="220"
                height="175"
                viewBox="0 0 260 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[180px] xs:w-[210px] sm:w-[240px] h-auto"
              >
                <defs>
                  {/* Pearlescent White Ceramic Helmet Gradient */}
                  <radialGradient id="storyHelmetCeramic" cx="45%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#F5F0FC" />
                    <stop offset="70%" stopColor="#D5C7EE" />
                    <stop offset="92%" stopColor="#9C87C9" />
                    <stop offset="100%" stopColor="#6C539D" />
                  </radialGradient>

                  {/* Specular Highlight along Top Crest */}
                  <linearGradient id="storyCrestHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* Obsidian Visor Glass */}
                  <linearGradient id="storyVisorObsidian" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0B0418" />
                    <stop offset="40%" stopColor="#15082E" />
                    <stop offset="85%" stopColor="#220D47" />
                    <stop offset="100%" stopColor="#2D125A" />
                  </linearGradient>

                  {/* Glass Glare */}
                  <linearGradient id="storyVisorGlare" x1="0%" y1="0%" x2="100%" y2="60%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.12" />
                    <stop offset="70%" stopColor="#C4B5FD" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* Ear Pod Metallic Titanium */}
                  <linearGradient id="storyEarPodTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#E4DAF5" />
                    <stop offset="65%" stopColor="#8A6EC7" />
                    <stop offset="100%" stopColor="#4A2F82" />
                  </linearGradient>

                  {/* Eye Glowing Cyan-Lavender Gradient */}
                  <linearGradient id="storyEyeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#67E8F9" />
                    <stop offset="45%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>

                {/* EAR SENSORS */}
                <g ref={earSensorsRef}>
                  <rect x="8" y="70" width="18" height="50" rx="9" fill="url(#storyEarPodTitanium)" stroke="#E9D5FF" strokeWidth="1.2" />
                  <rect x="12" y="86" width="10" height="18" rx="5" fill="#1B0C36" />
                  <circle cx="17" cy="95" r="3.5" fill="#38BDF8" />

                  <rect x="234" y="70" width="18" height="50" rx="9" fill="url(#storyEarPodTitanium)" stroke="#E9D5FF" strokeWidth="1.2" />
                  <rect x="238" y="86" width="10" height="18" rx="5" fill="#1B0C36" />
                  <circle cx="243" cy="95" r="3.5" fill="#38BDF8" />
                </g>

                {/* MAIN HELMET CHASSIS */}
                <path
                  d="M36 92 C36 40 76 16 130 16 C184 16 224 40 224 92 C224 144 186 168 130 168 C74 168 36 144 36 92 Z"
                  fill="url(#storyHelmetCeramic)"
                  stroke="#FAF5FF"
                  strokeWidth="1.8"
                />

                {/* Top Specular Rim Glare */}
                <path
                  d="M56 60 C80 28 115 22 130 22 C145 22 180 28 204 60 C175 35 145 30 130 30 C115 30 85 35 56 60 Z"
                  fill="url(#storyCrestHighlight)"
                />

                {/* TOP NEURAL INDICATOR JEWEL */}
                <rect x="120" y="8" width="20" height="10" rx="5" fill="#38BDF8" opacity="0.85" />

                {/* CURVED OBSIDIAN VISOR */}
                <path
                  d="M54 94 C54 56 86 42 130 42 C174 42 206 56 206 94 C206 132 176 148 130 148 C84 148 54 132 54 94 Z"
                  fill="url(#storyVisorObsidian)"
                  stroke="#4C1D95"
                  strokeWidth="1.5"
                />

                {/* Visor Glare Reflection */}
                <path
                  d="M60 90 C60 62 88 48 130 48 C158 48 182 54 196 68 C176 56 150 52 130 52 C92 52 68 66 60 90 Z"
                  fill="url(#storyVisorGlare)"
                />

                {/* ROBOT EYES (ACTIVATING WITH GSAP) */}
                <g ref={robotEyesRef}>
                  {/* Left Eye */}
                  <g transform="translate(86, 82)">
                    <rect x="0" y="0" width="28" height="24" rx="12" fill="url(#storyEyeGlowGrad)" />
                    <circle cx="10" cy="8" r="4.5" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="18" cy="14" r="2.5" fill="#FFFFFF" opacity="0.6" />
                  </g>

                  {/* Right Eye */}
                  <g transform="translate(146, 82)">
                    <rect x="0" y="0" width="28" height="24" rx="12" fill="url(#storyEyeGlowGrad)" />
                    <circle cx="10" cy="8" r="4.5" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="18" cy="14" r="2.5" fill="#FFFFFF" opacity="0.6" />
                  </g>
                </g>
              </svg>

              {/* Horizontal Anamorphic Visor Flare Beam */}
              <div
                ref={flareBeamRef}
                className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[260px] bg-gradient-to-r from-transparent via-cyan-300 via-white to-transparent shadow-[0_0_15px_#38bdf8] pointer-events-none"
              />
            </div>

            {/* Robot Collar & Torso Peak */}
            <div className="relative -mt-2 z-10 flex flex-col items-center">
              <div className="h-3.5 w-18 rounded-full bg-gradient-to-r from-[#2E1065] via-[#4C1D95] to-[#2E1065] border border-purple-400/40 shadow-inner" />
              <div className="relative -mt-1 h-12 w-28 rounded-t-3xl bg-gradient-to-b from-[#FAF5FF] via-[#E9D5FF] to-[#C4B5FD] border border-white/80 shadow-md flex items-center justify-center">
                {/* Chest Power Core */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <circle
                    ref={chestCoreRef}
                    cx="12"
                    cy="12"
                    r="5.5"
                    fill="#38BDF8"
                    stroke="#E0E7FF"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_8px_#38bdf8]"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* =========================================================
              UNIFIED BRANDING & WORKSPACE REVEAL
          ========================================================= */}
          <div
            ref={brandGroupRef}
            className="mt-6 sm:mt-8 flex flex-col items-center text-center space-y-2 pointer-events-none z-30"
            style={{ transform: 'translateZ(30px)' }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-violet-300 drop-shadow-[0_0_30px_rgba(196,181,253,0.4)]">
              NYRA AI
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-300/35 backdrop-blur-md shadow-lg shadow-purple-950/50 text-[11px] font-mono tracking-widest text-purple-200 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Unified Intelligent Workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP RIGHT UNOBTRUSIVE SKIP BUTTON */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-[120]">
        <button
          ref={skipBtnRef}
          onClick={handleSkip}
          className="group flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-[#120726]/80 px-4 py-1.5 text-xs font-medium text-purple-200 backdrop-blur-md hover:border-purple-300/60 hover:bg-[#1f0b3d] hover:text-white transition-all shadow-lg shadow-black/50 cursor-pointer"
          aria-label="Skip introduction"
        >
          <span>Skip Intro</span>
          <ArrowRight className="h-3.5 w-3.5 text-purple-300 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
