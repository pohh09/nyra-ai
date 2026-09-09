'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Bot,
  Code2,
  Cpu,
  Globe,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Layers,
  Volume2,
  Mic,
  FileText,
  Search,
} from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport3DRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);

  // 3D Scene Elements Refs
  const gridFloorRef = useRef<HTMLDivElement>(null);
  const gridCeilingRef = useRef<HTMLDivElement>(null);
  const starParticlesRef = useRef<HTMLDivElement>(null);
  const ignitionCoreRef = useRef<HTMLDivElement>(null);
  const shockwaveRingsRef = useRef<HTMLDivElement>(null);
  const hudReticleRef = useRef<HTMLDivElement>(null);
  const telemetryNodesRef = useRef<HTMLDivElement>(null);

  // Scene 2+ Refs
  const textLine1Ref = useRef<HTMLHeadingElement>(null);
  const textLine2Ref = useRef<HTMLHeadingElement>(null);
  const fragmentsGroupRef = useRef<HTMLDivElement>(null);
  const nyraHeroCardRef = useRef<HTMLDivElement>(null);
  const energyCoreRef = useRef<HTMLDivElement>(null);
  const expandingAuraRef = useRef<HTMLDivElement>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [hasSkipped, setHasSkipped] = useState(false);

  // Precomputed 3D Particle Starfield
  const particles = useMemo(() => [
    { size: 2, left: 12, top: 18, z: -300, color: '#c084fc', opacity: 0.6 },
    { size: 3, left: 24, top: 72, z: -600, color: '#38bdf8', opacity: 0.8 },
    { size: 1.5, left: 35, top: 28, z: -150, color: '#e879f9', opacity: 0.5 },
    { size: 2.5, left: 48, top: 82, z: -450, color: '#a855f7', opacity: 0.7 },
    { size: 2, left: 62, top: 22, z: -350, color: '#38bdf8', opacity: 0.6 },
    { size: 3, left: 78, top: 68, z: -700, color: '#c084fc', opacity: 0.85 },
    { size: 1.5, left: 88, top: 34, z: -200, color: '#e879f9', opacity: 0.6 },
    { size: 2, left: 18, top: 45, z: -500, color: '#a855f7', opacity: 0.7 },
    { size: 2.5, left: 82, top: 15, z: -400, color: '#38bdf8', opacity: 0.65 },
    { size: 3, left: 52, top: 12, z: -650, color: '#c084fc', opacity: 0.75 },
    { size: 1.5, left: 68, top: 85, z: -250, color: '#a855f7', opacity: 0.5 },
    { size: 2, left: 30, top: 58, z: -550, color: '#e879f9', opacity: 0.7 },
  ], []);

  // Mouse Parallax on Desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current) return;
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(cameraRef.current, {
        rotationY: xNorm * 3.5,
        rotationX: -yNorm * 2.5,
        duration: 0.8,
        ease: 'power1.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        scale: 1.05,
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
            duration: 0.45,
            ease: 'power2.inOut',
            onComplete: () => {
              onCompleteRef.current();
            },
          });
        },
      });

      masterTimeline.current = tl;

      // ==========================================
      // INITIAL 3D CAMERA & DEPTH LAYERING SETUP
      // ==========================================
      gsap.set(skipBtnRef.current, { opacity: 0, y: -10 });
      gsap.set(cameraRef.current, {
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
      });

      // Scene 1: Background Grids, Particles, Core & HUD Initial States
      gsap.set(gridFloorRef.current, { opacity: 0, scale: 0.7 });
      gsap.set(gridCeilingRef.current, { opacity: 0, scale: 0.7 });
      gsap.set(starParticlesRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(ignitionCoreRef.current, { opacity: 0, scale: 0.05, filter: 'blur(10px)' });
      gsap.set('.scene1-flare-bar', { scaleX: 0, opacity: 0 });
      gsap.set('.scene1-ring', { scale: 0.1, opacity: 0 });
      gsap.set(hudReticleRef.current, { opacity: 0, scale: 0.5, z: -550 });
      gsap.set('.scene1-node', { opacity: 0, scale: 0.7, y: 15 });

      // Scene 2: 3D Flying Typography
      gsap.set(textLine1Ref.current, {
        z: -600,
        scale: 0.45,
        opacity: 0,
        y: -30,
        filter: 'blur(16px)',
      });
      gsap.set(textLine2Ref.current, {
        z: -700,
        scale: 0.4,
        x: 80,
        y: 40,
        opacity: 0,
        filter: 'blur(18px)',
      });

      // Scene 3: Floating UI Fragments Initial Positions (in depth)
      gsap.set('.frag-chat', {
        x: 350,
        y: 220,
        z: -450,
        rotationY: 28,
        rotationX: -14,
        opacity: 0,
        scale: 0.7,
      });
      gsap.set('.frag-code', {
        x: -360,
        y: -180,
        z: -500,
        rotationY: -26,
        rotationX: 12,
        opacity: 0,
        scale: 0.7,
      });
      gsap.set('.frag-voice', {
        x: -320,
        y: 180,
        z: -350,
        rotationY: 22,
        rotationX: -10,
        opacity: 0,
        scale: 0.75,
      });
      gsap.set('.frag-metrics', {
        x: 320,
        y: -190,
        z: -400,
        rotationY: -22,
        rotationX: 10,
        opacity: 0,
        scale: 0.75,
      });
      gsap.set('.frag-prompt', {
        x: 0,
        y: 260,
        z: -600,
        rotationX: 30,
        opacity: 0,
        scale: 0.65,
      });

      // Scene 5 & 6: Nyra Hero Glass Card
      gsap.set(nyraHeroCardRef.current, {
        opacity: 0,
        scale: 0.75,
        rotationY: -28,
        rotationX: 10,
        z: -350,
      });

      // Scene 7 & 8: Energy Core & Expansion
      gsap.set(energyCoreRef.current, { opacity: 0, scale: 0.1, y: 0 });
      gsap.set(expandingAuraRef.current, { opacity: 0, scale: 0.1 });

      // Reveal Skip Button early
      tl.to(skipBtnRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.1);

      // =========================================================================
      // SCENE 1: REDESIGNED QUANTUM SPACE & SINGULARITY IGNITION (~0.0s - 2.0s)
      // =========================================================================
      // 1. Grid planes & starfield materialize
      tl.to(
        [gridFloorRef.current, gridCeilingRef.current],
        {
          opacity: 0.85,
          scale: 1,
          duration: 1.3,
          ease: 'power2.out',
        },
        0.05
      );

      tl.to(
        starParticlesRef.current,
        {
          opacity: 0.9,
          scale: 1,
          duration: 1.2,
          ease: 'power1.out',
        },
        0.05
      );

      // 2. Singularity core ignites with anamorphic flare
      tl.to(
        ignitionCoreRef.current,
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'back.out(2)',
        },
        0.15
      );

      tl.to(
        '.scene1-flare-bar',
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
        },
        0.2
      );

      // 3. Shockwave rings pulse outward through depth
      tl.fromTo(
        '.scene1-ring',
        { scale: 0.1, opacity: 0.9, z: -700 },
        {
          scale: 3.2,
          opacity: 0,
          z: 150,
          stagger: 0.14,
          duration: 1.3,
          ease: 'power2.out',
        },
        0.2
      );

      // 4. Futuristic HUD Reticle & Boot Telemetry Lock-In
      tl.to(
        hudReticleRef.current,
        {
          opacity: 1,
          scale: 1,
          z: -420,
          duration: 0.85,
          ease: 'back.out(1.4)',
        },
        0.25
      );

      // 5. Floating Telemetry Matrix tags appear
      tl.to(
        '.scene1-node',
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
        },
        0.35
      );

      // 6. Smooth forward camera dolly
      tl.to(
        cameraRef.current,
        {
          z: 85,
          duration: 2.2,
          ease: 'power1.inOut',
        },
        0.1
      );

      // 7. Scene 1 dissolves as camera pushes through toward Scene 2
      tl.to(
        [ignitionCoreRef.current, '.scene1-flare-bar'],
        {
          scale: 2.5,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 0.65,
          ease: 'power2.in',
        },
        1.4
      );

      tl.to(
        hudReticleRef.current,
        {
          scale: 1.5,
          z: 200,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.6,
          ease: 'power2.in',
        },
        1.45
      );

      tl.to(
        '.scene1-node',
        {
          opacity: 0,
          z: '+=180',
          stagger: 0.04,
          filter: 'blur(8px)',
          duration: 0.45,
          ease: 'power2.in',
        },
        1.4
      );

      // ==========================================
      // SCENE 2: 3D PROJECT STATEMENT THROUGH DEPTH (~0.8s - 4.2s)
      // "From interface to intelligence — I build experiences that feel alive."
      // ==========================================
      tl.to(
        textLine1Ref.current,
        {
          z: 0,
          scale: 1,
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'back.out(1.2)',
        },
        0.75
      );

      tl.to(
        textLine2Ref.current,
        {
          z: 0,
          scale: 1,
          x: 0,
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'back.out(1.3)',
        },
        1.2
      );

      // Camera accelerates past text, text moves into forward viewer space and dissolves
      tl.to(
        textLine1Ref.current,
        {
          z: 320,
          scale: 1.35,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 0.85,
          ease: 'power2.in',
        },
        3.2
      );

      tl.to(
        textLine2Ref.current,
        {
          z: 380,
          scale: 1.45,
          opacity: 0,
          filter: 'blur(16px)',
          duration: 0.85,
          ease: 'power2.in',
        },
        3.35
      );

      // ==========================================
      // SCENE 3: SHOW WORK THROUGH 5 FLOATING UI FRAGMENTS (~3.4s - 7.6s)
      // Connected spring arrivals from different 3D angles
      // ==========================================
      // Fragment 1: AI Chat (from bottom right)
      tl.to(
        '.frag-chat',
        {
          x: 280,
          y: 80,
          z: -60,
          rotationY: -12,
          rotationX: 6,
          scale: 0.95,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
        },
        3.5
      );

      // Fragment 2: Code Editor (from upper left)
      tl.to(
        '.frag-code',
        {
          x: -280,
          y: -100,
          z: -80,
          rotationY: 14,
          rotationX: -6,
          scale: 0.92,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
        },
        3.75
      );

      // Fragment 3: Voice Interface (from left depth plane)
      tl.to(
        '.frag-voice',
        {
          x: -260,
          y: 130,
          z: 20,
          rotationY: 10,
          rotationX: -4,
          scale: 0.9,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        },
        4.0
      );

      // Fragment 4: System Metrics (from right depth plane)
      tl.to(
        '.frag-metrics',
        {
          x: 260,
          y: -120,
          z: -40,
          rotationY: -10,
          rotationX: 4,
          scale: 0.9,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        },
        4.2
      );

      // Fragment 5: Prompt Library (from bottom floor)
      tl.to(
        '.frag-prompt',
        {
          x: 0,
          y: 190,
          z: -120,
          rotationX: 12,
          scale: 0.88,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        },
        4.45
      );

      // ==========================================
      // SCENE 4: 3D UI FRAGMENTS ORBIT & CAMERA DRIFT (~5.2s - 8.2s)
      // Slow, luxurious orbit around the floating product ecosystem
      // ==========================================
      tl.to(
        cameraRef.current,
        {
          rotationY: 8,
          rotationX: -4,
          z: 140,
          duration: 2.8,
          ease: 'sine.inOut',
        },
        5.0
      );

      // Parallax floating of fragments
      tl.to(
        '.frag-chat',
        {
          y: '-=15',
          x: '+=10',
          rotationY: -8,
          duration: 1.6,
          ease: 'sine.inOut',
          yoyo: true,
        },
        5.2
      );

      tl.to(
        '.frag-code',
        {
          y: '+=12',
          x: '-=8',
          rotationY: 10,
          duration: 1.6,
          ease: 'sine.inOut',
          yoyo: true,
        },
        5.3
      );

      // ==========================================
      // SCENE 5 & 6: NYRA TAKES CENTER STAGE & 3D GLASS FLIP REVEAL (~7.6s - 10.8s)
      // Fragments converge and recede backward; Nyra emerges and rotates into place
      // ==========================================
      tl.to(
        ['.frag-chat', '.frag-code', '.frag-voice', '.frag-metrics', '.frag-prompt'],
        {
          z: -500,
          scale: 0.65,
          opacity: 0,
          stagger: 0.06,
          filter: 'blur(10px)',
          duration: 0.9,
          ease: 'power2.in',
        },
        7.6
      );

      tl.to(
        cameraRef.current,
        {
          rotationY: 0,
          rotationX: 0,
          z: 40,
          duration: 1.2,
          ease: 'power3.out',
        },
        7.8
      );

      // 3D Glass Panel Flip of Nyra Hero Card
      tl.to(
        nyraHeroCardRef.current,
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          duration: 1.15,
          ease: 'power3.out',
        },
        8.0
      );

      // Light Sweep Reflection across Nyra Glass
      tl.fromTo(
        '.nyra-glass-sweep',
        { x: '-120%', opacity: 0 },
        { x: '220%', opacity: 0.85, duration: 0.95, ease: 'power2.inOut' },
        8.9
      );

      // ==========================================
      // SCENE 7 & 8: CORE POINT OF LIGHT & CIRCLE EXPANSION (~10.4s - 13.6s)
      // Energy core ignites at bottom of Nyra card, collapses card, and expands outward
      // ==========================================
      tl.to(
        energyCoreRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        10.4
      );

      // Nyra card condenses into core point
      tl.to(
        nyraHeroCardRef.current,
        {
          scale: 0.2,
          z: -200,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.75,
          ease: 'power3.in',
        },
        10.9
      );

      // Energy core rises toward top navbar position
      tl.to(
        energyCoreRef.current,
        {
          y: '-68vh',
          scale: 1.8,
          duration: 0.95,
          ease: 'power3.inOut',
        },
        11.2
      );

      // Expanding Aura sweeps across the viewport
      tl.to(
        expandingAuraRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
        },
        12.0
      );

      tl.to(
        expandingAuraRef.current,
        {
          scale: 45,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        12.3
      );

      tl.to(
        energyCoreRef.current,
        {
          scale: 4,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        },
        12.3
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040a] text-white overflow-hidden select-none pointer-events-auto"
      style={{ willChange: 'opacity, transform' }}
    >
      {/* 3D PERSPECTIVE VIEWPORT */}
      <div
        ref={viewport3DRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: '1600px',
          perspectiveOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D CAMERA RIG */}
        <div
          ref={cameraRef}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {/* =========================================================
              SCENE 1: REDESIGNED QUANTUM SPACE & SINGULARITY IGNITION
          ========================================================= */}
          {/* Floating 3D Star/Particle Field */}
          <div
            ref={starParticlesRef}
            className="absolute inset-0 pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
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

          {/* Deep 3D Laser Grid Floor */}
          <div
            ref={gridFloorRef}
            className="absolute -bottom-[320px] w-[2600px] h-[1500px] pointer-events-none opacity-0"
            style={{
              transform: 'rotateX(75deg) translateZ(-160px)',
              backgroundImage:
                'linear-gradient(to right, rgba(168,85,247,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.18) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 85%)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-600/10 to-transparent" />
          </div>

          {/* Deep 3D Laser Grid Ceiling */}
          <div
            ref={gridCeilingRef}
            className="absolute -top-[320px] w-[2600px] h-[1500px] pointer-events-none opacity-0"
            style={{
              transform: 'rotateX(-75deg) translateZ(-160px)',
              backgroundImage:
                'linear-gradient(to right, rgba(147,51,234,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(147,51,234,0.14) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 85%)',
            }}
          />

          {/* Atmospheric Nebula Spheres in Depth */}
          <div
            className="absolute h-[600px] w-[850px] rounded-full bg-purple-700/15 blur-[160px] pointer-events-none"
            style={{ transform: 'translateZ(-500px)' }}
          />
          <div
            className="absolute h-[450px] w-[700px] rounded-full bg-violet-600/12 blur-[150px] pointer-events-none"
            style={{ transform: 'translateZ(-300px) translateY(60px)' }}
          />
          <div
            className="absolute h-[350px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"
            style={{ transform: 'translateZ(-400px) translateX(-200px)' }}
          />

          {/* Singularity Ignition Core & Anamorphic Lens Flare Beam */}
          <div
            ref={ignitionCoreRef}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{ transform: 'translateZ(-750px)', transformStyle: 'preserve-3d' }}
          >
            <div className="relative flex items-center justify-center">
              {/* Central Glowing Quantum Singularity */}
              <div className="h-7 w-7 rounded-full bg-white shadow-[0_0_50px_#c084fc,0_0_100px_#9333ea,0_0_150px_#7c3aed]" />
              <div className="absolute h-20 w-20 rounded-full bg-purple-400/25 animate-ping" />

              {/* Anamorphic Lens Flare Horizontal Rays */}
              <div className="scene1-flare-bar absolute h-[2px] w-[950px] bg-gradient-to-r from-transparent via-cyan-300 via-white via-purple-300 to-transparent shadow-[0_0_24px_#a855f7]" />
              <div className="scene1-flare-bar absolute h-[8px] w-[550px] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[3px]" />
              <div className="scene1-flare-bar absolute h-[140px] w-[2px] bg-gradient-to-b from-transparent via-white to-transparent" />
            </div>
          </div>

          {/* Expanding 3D Shockwave Rings */}
          <div
            ref={shockwaveRingsRef}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="scene1-ring absolute h-[200px] w-[200px] rounded-full border-2 border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.8)]" />
            <div className="scene1-ring absolute h-[340px] w-[340px] rounded-full border border-cyan-400/70 shadow-[0_0_50px_rgba(34,211,238,0.5)]" />
            <div className="scene1-ring absolute h-[520px] w-[520px] rounded-full border border-purple-300/40 border-dashed" />
          </div>

          {/* Futuristic HUD Reticle & Calibration Lock-In */}
          <div
            ref={hudReticleRef}
            className="absolute flex flex-col items-center justify-center pointer-events-none text-center"
            style={{ transform: 'translateZ(-450px)', transformStyle: 'preserve-3d' }}
          >
            {/* Circular HUD Compass & Reticle */}
            <div className="relative flex items-center justify-center w-[220px] h-[220px]">
              <div className="absolute inset-0 rounded-full border border-purple-400/35 border-dashed animate-[spin_24s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-cyan-400/30 animate-[spin_16s_linear_infinite_reverse]" />
              <div className="absolute h-full w-[1px] bg-purple-400/25" />
              <div className="absolute w-full h-[1px] bg-purple-400/25" />
              <div className="absolute h-2 w-2 rounded-full bg-purple-300/80 shadow-[0_0_10px_#d8b4fe]" />

              {/* Corner crosshair brackets */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-purple-400" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-purple-400" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-purple-400" />
            </div>

            {/* HUD Boot Sequence Labels */}
            <div className="mt-4 font-mono text-[11px] tracking-[0.2em] text-purple-200/90 flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/35 backdrop-blur-md shadow-lg shadow-purple-950/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10.5px] uppercase font-bold text-white tracking-widest">
                  INITIALIZING NEURAL FABRIC
                </span>
              </div>
              <span className="text-[9.5px] text-purple-300/70 font-mono">
                SYS_CORE // MATRIX_CALIBRATION_v4.0
              </span>
            </div>
          </div>

          {/* Floating 3D Telemetry Nodes */}
          <div
            ref={telemetryNodesRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="scene1-node absolute -translate-x-[360px] -translate-y-[140px] px-3.5 py-1.5 rounded-xl border border-purple-400/30 bg-purple-950/50 backdrop-blur-md font-mono text-[10px] text-purple-200 shadow-xl"
              style={{ transform: 'translateZ(-280px) rotateY(18deg)' }}
            >
              <span className="text-purple-400 mr-1.5">◆</span>LATENCY: 12ms
            </div>
            <div
              className="scene1-node absolute translate-x-[380px] -translate-y-[100px] px-3.5 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-950/50 backdrop-blur-md font-mono text-[10px] text-cyan-200 shadow-xl"
              style={{ transform: 'translateZ(-320px) rotateY(-20deg)' }}
            >
              <span className="text-cyan-400 mr-1.5">⚡</span>TENSOR_ENGINE: READY
            </div>
            <div
              className="scene1-node absolute -translate-x-[320px] translate-y-[180px] px-3.5 py-1.5 rounded-xl border border-purple-400/25 bg-black/60 backdrop-blur-md font-mono text-[10px] text-slate-300 shadow-xl"
              style={{ transform: 'translateZ(-220px) rotateY(15deg)' }}
            >
              <span className="text-emerald-400 mr-1.5">●</span>NODES: 2,048 CLUSTERS
            </div>
            <div
              className="scene1-node absolute translate-x-[340px] translate-y-[170px] px-3.5 py-1.5 rounded-xl border border-purple-400/25 bg-black/60 backdrop-blur-md font-mono text-[10px] text-slate-300 shadow-xl"
              style={{ transform: 'translateZ(-240px) rotateY(-16deg)' }}
            >
              <span className="text-purple-300 mr-1.5">❖</span>REASONING: MULTIMODAL
            </div>
          </div>

          {/* =========================================================
              SCENE 2: 3D PROJECT STATEMENT (Moving through Depth)
          ========================================================= */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h1
              ref={textLine1Ref}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-sans drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              From interface to <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">intelligence</span>
            </h1>

            <h2
              ref={textLine2Ref}
              className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-slate-300 font-sans"
              style={{ transformStyle: 'preserve-3d' }}
            >
              I build digital experiences that <span className="text-purple-300 italic">feel alive.</span>
            </h2>
          </div>

          {/* =========================================================
              SCENE 3 & 4: 5 FLOATING 3D UI FRAGMENTS
          ========================================================= */}
          <div
            ref={fragmentsGroupRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Fragment 1: AI Chat Window */}
            <div
              className="frag-chat absolute w-[310px] sm:w-[360px] rounded-2xl border border-purple-500/40 bg-[#0d091a]/90 p-4 shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-950/90 border border-purple-500/40 text-purple-300">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Nyra AI Chat</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">● Streaming</span>
              </div>
              <div className="mt-3 space-y-2 text-[11px]">
                <div className="rounded-xl bg-purple-600/90 p-2 text-white max-w-[85%] ml-auto shadow-sm">
                  Explain React 19 Server Actions & memoization
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-slate-200 space-y-1">
                  <p className="text-[10px] text-slate-400">Server actions execute with edge streaming:</p>
                  <div className="rounded bg-black/80 p-1.5 font-mono text-[9px] text-purple-300 border border-purple-400/20">
                    {`'use server';\nexport async function updateState() {...}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Fragment 2: Code Editor */}
            <div
              className="frag-code absolute w-[300px] sm:w-[340px] rounded-2xl border border-purple-500/40 bg-[#0c0817]/90 p-4 shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-mono text-slate-300">useWorkflow.ts</span>
                </div>
                <span className="text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/30">
                  TypeScript 5.5
                </span>
              </div>
              <pre className="mt-2.5 font-mono text-[10px] text-slate-300 leading-relaxed bg-black/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-purple-400">export function</span>{' '}
                <span className="text-purple-300">useStream</span>() {'{\n'}
                {'  '}
                <span className="text-violet-400">const</span> [tokens] ={' '}
                <span className="text-amber-300">useState</span>([]);{'\n'}
                {'  '}<span className="text-emerald-400">return</span> {'{ tokens, isLive: true };\n'}
                {'}'}
              </pre>
            </div>

            {/* Fragment 3: Voice Interaction Mode */}
            <div
              className="frag-voice absolute w-[260px] sm:w-[290px] rounded-2xl border border-purple-500/40 bg-[#0e091d]/90 p-3.5 shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Live Voice</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">00:18</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 h-8">
                {[30, 70, 95, 55, 80, 100, 65, 40, 85, 50].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 to-fuchsia-400 animate-pulse"
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-300">
                "Analyzing document structure..."
              </p>
            </div>

            {/* Fragment 4: System Metrics */}
            <div
              className="frag-metrics absolute w-[270px] sm:w-[300px] rounded-2xl border border-purple-500/30 bg-[#090614]/90 p-3.5 shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Engine Performance</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">99.8%</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                  <span className="text-slate-500">Inference</span>
                  <p className="font-bold text-purple-300 font-mono">14ms TTFT</p>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                  <span className="text-slate-500">Model</span>
                  <p className="font-bold text-white font-mono">Llama 3.3 70B</p>
                </div>
              </div>
            </div>

            {/* Fragment 5: Prompt Library */}
            <div
              className="frag-prompt absolute w-[290px] sm:w-[320px] rounded-2xl border border-purple-700/60 bg-[#080512]/90 p-3.5 shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Prompt Template</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Dev • 01</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-200 font-medium">
                Refactor architecture to streaming edge runtime with zero cold starts.
              </p>
            </div>
          </div>

          {/* =========================================================
              SCENE 5 & 6: NYRA HERO 3D GLASS PANEL FLIP REVEAL
          ========================================================= */}
          <div
            ref={nyraHeroCardRef}
            className="absolute w-[90%] max-w-[580px] rounded-3xl border-2 border-purple-400/50 bg-[#0d091c]/95 p-6 sm:p-8 shadow-[0_0_90px_rgba(168,85,247,0.35)] backdrop-blur-2xl overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Glass Sweep Sheen */}
            <div className="nyra-glass-sweep absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent skew-x-12 pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-400 text-white shadow-lg shadow-purple-500/40 border border-purple-300/40">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Nyra AI</h3>
                  <span className="text-[11px] text-purple-400 font-mono tracking-wider">
                    INTELLIGENT WORKSPACE • v4.0
                  </span>
                </div>
              </div>
              <span className="rounded-full border border-emerald-800/60 bg-emerald-950/80 px-3 py-1 text-xs font-mono text-emerald-400">
                Ready
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  "Nyra is the AI workspace I designed and built — unifying fast model inference, live web search, deep PDF document parsing, and vision reasoning into a physical interface."
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  ⚡ Groq Llama 3.3
                </span>
                <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  🌐 Tavily Search
                </span>
                <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  📄 PDF.js
                </span>
                <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  🖼️ Gemini Vision
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              SCENE 7 & 8: ENERGY CORE & EXPANDING AURA REVEAL
          ========================================================= */}
          <div
            ref={energyCoreRef}
            className="absolute bottom-16 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-r from-purple-300 via-violet-200 to-fuchsia-400 shadow-[0_0_35px_rgba(168,85,247,1)] pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          />

          <div
            ref={expandingAuraRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full border-2 border-purple-400 bg-gradient-to-br from-purple-900/60 via-violet-900/40 to-black shadow-[0_0_120px_rgba(168,85,247,0.9)] pointer-events-none"
          />
        </div>
      </div>

      {/* TOP RIGHT UNOBTRUSIVE SKIP BUTTON */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-[120]">
        <button
          ref={skipBtnRef}
          onClick={handleSkip}
          className="group flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-[#0d091a]/80 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md hover:border-purple-400/50 hover:bg-[#160f2e] hover:text-white transition-all shadow-lg shadow-black/60 cursor-pointer"
          aria-label="Skip introduction"
        >
          <span>Skip intro</span>
          <ArrowRight className="h-3.5 w-3.5 text-purple-400 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
