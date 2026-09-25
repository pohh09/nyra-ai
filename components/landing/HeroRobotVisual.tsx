'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Sparkles,
  Globe,
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function HeroRobotVisual() {
  const router = useRouter();
  const robotContainerRef = useRef<HTMLDivElement>(null);

  // Mouse & Eye Tracking State
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [mood, setMood] = useState<'neutral' | 'curious' | 'thinking' | 'happy'>('neutral');

  // Spring physics for buttery-smooth head & gaze motion
  const headRotateX = useMotionValue(0);
  const headRotateY = useMotionValue(0);
  const smoothHeadX = useSpring(headRotateX, { stiffness: 150, damping: 22 });
  const smoothHeadY = useSpring(headRotateY, { stiffness: 150, damping: 22 });

  const eyeOffsetX = useMotionValue(0);
  const eyeOffsetY = useMotionValue(0);
  const smoothEyeX = useSpring(eyeOffsetX, { stiffness: 240, damping: 18 });
  const smoothEyeY = useSpring(eyeOffsetY, { stiffness: 240, damping: 18 });

  // Floating Body Position Tracking
  const bodyShiftX = useMotionValue(0);
  const bodyShiftY = useMotionValue(0);
  const smoothBodyX = useSpring(bodyShiftX, { stiffness: 90, damping: 25 });
  const smoothBodyY = useSpring(bodyShiftY, { stiffness: 90, damping: 25 });

  // Arm Motion Springs
  const leftArmRotate = useMotionValue(0);
  const rightArmRotate = useMotionValue(0);
  const smoothLeftArm = useSpring(leftArmRotate, { stiffness: 120, damping: 20 });
  const smoothRightArm = useSpring(rightArmRotate, { stiffness: 120, damping: 20 });

  // Periodic Natural Blinking (every 3.5 - 6 seconds)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);
      const nextDelay = 3400 + Math.random() * 2800;
      blinkTimer = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimer = setTimeout(triggerBlink, 2800);
    return () => clearTimeout(blinkTimer);
  }, []);

  // Periodic Autonomous "Thinking" Pulse (every 10 - 13 seconds)
  useEffect(() => {
    const thinkInterval = setInterval(() => {
      if (!isHovered && !isSpeaking) {
        setIsThinking(true);
        setMood('thinking');
        setTimeout(() => {
          setIsThinking(false);
          setMood('neutral');
        }, 2800);
      }
    }, 11500);

    return () => clearInterval(thinkInterval);
  }, [isHovered, isSpeaking]);

  // Global Mouse Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotContainerRef.current) return;
      const rect = robotContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Clamped normalized coordinates [-1 to 1]
      const normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth / 2)));
      const normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight / 2)));

      // 3D Head rotation angles
      headRotateY.set(normX * 16); // yaw
      headRotateX.set(-normY * 12); // pitch

      // Eye Pupil offsets inside visor (in pixels)
      eyeOffsetX.set(normX * 16);
      eyeOffsetY.set(normY * 11);

      // Subtle body & arms follow
      bodyShiftX.set(normX * 8);
      bodyShiftY.set(normY * 6);
      leftArmRotate.set(-normX * 9);
      rightArmRotate.set(-normX * 9);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [headRotateX, headRotateY, eyeOffsetX, eyeOffsetY, bodyShiftX, bodyShiftY, leftArmRotate, rightArmRotate]);

  // Click Interaction: Speak to the user
  const handleRobotClick = () => {
    const quotes = [
      'Ready to build and think with you.',
      'Neural workspace synced & primed.',
      'Ask me anything in the studio.',
      'Streaming at sub-15ms speed.',
      'In-browser PDF RAG is active.',
      'Continuous memory state online.',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechText(randomQuote);
    setIsSpeaking(true);
    setMood('happy');

    setTimeout(() => {
      setIsSpeaking(false);
      setMood('neutral');
    }, 4200);
  };

  return (
    <div
      ref={robotContainerRef}
      className="relative w-full max-w-[340px] xs:max-w-[440px] sm:max-w-[560px] lg:max-w-[680px] xl:max-w-[740px] mx-auto min-h-[420px] xs:min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex items-center justify-center select-none overflow-visible"
      style={{ perspective: 1200 }}
    >
      {/* =========================================================
          AMBIENT VOLUMETRIC ATMOSPHERE
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Core Soft Ambient Violet Sphere */}
        <div className="h-[280px] xs:h-[360px] sm:h-[460px] lg:h-[540px] w-[280px] xs:w-[360px] sm:w-[460px] lg:w-[540px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/22 via-[#7C3AED]/14 to-[#38BDF8]/12 blur-[70px] sm:blur-[120px]" />
      </div>

      {/* =========================================================
          SPEECH / TELEMETRY BUBBLE ON INTERACTION
      ========================================================= */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute -top-3 sm:-top-8 z-40 px-3 sm:px-4.5 py-1.5 sm:py-2.5 rounded-2xl bg-[#1E0F38]/95 border border-purple-300/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:border-purple-200 transition-colors max-w-[95%] sm:max-w-[90%]"
            onClick={() => router.push('/chat-ui')}
          >
            <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-white shadow-inner">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide truncate">
              {speechText}
            </span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-300 shrink-0" />
            {/* Bubble arrow pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1E0F38]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          MAIN INTERACTIVE ROBOT COMPANION ENTITY (ENLARGED)
      ========================================================= */}
      <motion.div
        style={{
          x: smoothBodyX,
          y: smoothBodyY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-20 flex flex-col items-center cursor-pointer group"
        onMouseEnter={() => {
          setIsHovered(true);
          setMood('curious');
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setMood(isThinking ? 'thinking' : 'neutral');
        }}
        onClick={handleRobotClick}
      >
        {/* Continuous Autonomous Floating / Breathing */}
        <motion.div
          animate={{
            y: [-9, 9, -9],
            rotateZ: [-0.5, 0.5, -0.5],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex flex-col items-center scale-[0.84] xs:scale-95 sm:scale-110 lg:scale-120"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* =========================================================
              1. ROBOT HEAD ASSEMBLY (3D Ceramic Chassis + Glass Visor)
          ========================================================= */}
          <motion.div
            style={{
              rotateX: smoothHeadX,
              rotateY: smoothHeadY,
              transformStyle: 'preserve-3d',
            }}
            className="relative z-30 transition-transform duration-75"
          >
            {/* HEAD SVG CHASSIS & VISOR */}
            <svg
              width="260"
              height="200"
              viewBox="0 0 260 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] w-[240px] xs:w-[275px] sm:w-[305px] md:w-[330px] h-auto"
            >
              <defs>
                {/* 3D Pearlescent White Ceramic Helmet Gradient */}
                <radialGradient id="helmetCeramic3D" cx="45%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#F5F0FC" />
                  <stop offset="70%" stopColor="#D5C7EE" />
                  <stop offset="92%" stopColor="#9C87C9" />
                  <stop offset="100%" stopColor="#6C539D" />
                </radialGradient>

                {/* Specular Highlight along Top Crest */}
                <linearGradient id="crestHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Deep Curved Obsidian Visor Glass */}
                <linearGradient id="visorObsidianGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0B0418" />
                  <stop offset="40%" stopColor="#15082E" />
                  <stop offset="85%" stopColor="#220D47" />
                  <stop offset="100%" stopColor="#2D125A" />
                </linearGradient>

                {/* Curved Multi-layer Glass Glare */}
                <linearGradient id="visorGlassGlare" x1="0%" y1="0%" x2="100%" y2="60%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#C4B5FD" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Ear Pod Rim Glowing Accent */}
                <linearGradient id="earPodGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>

                {/* Torso Ceramic Shell */}
                <radialGradient id="torsoCeramic3D" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#F5F0FC" />
                  <stop offset="75%" stopColor="#DDD2F2" />
                  <stop offset="100%" stopColor="#9B84C8" />
                </radialGradient>

                {/* Core Reactor Glow */}
                <radialGradient id="reactorCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#38BDF8" />
                  <stop offset="60%" stopColor="#818CF8" />
                  <stop offset="85%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* EAR POD (LEFT) with Glowing Ring */}
              <circle cx="28" cy="100" r="22" fill="url(#helmetCeramic3D)" stroke="#9C87C9" strokeWidth="1.5" />
              <circle cx="28" cy="100" r="16" fill="#1A0C33" />
              <circle cx="28" cy="100" r="12" stroke="url(#earPodGlow)" strokeWidth="2.5" fill="none" />
              <circle cx="28" cy="100" r="6" fill="#A855F7" className="animate-pulse" />

              {/* EAR POD (RIGHT) with Glowing Ring */}
              <circle cx="232" cy="100" r="22" fill="url(#helmetCeramic3D)" stroke="#9C87C9" strokeWidth="1.5" />
              <circle cx="232" cy="100" r="16" fill="#1A0C33" />
              <circle cx="232" cy="100" r="12" stroke="url(#earPodGlow)" strokeWidth="2.5" fill="none" />
              <circle cx="232" cy="100" r="6" fill="#A855F7" className="animate-pulse" />

              {/* MAIN CERAMIC HELMET SHELL */}
              <path
                d="M42 96 C42 44 80 14 130 14 C180 14 218 44 218 96 C218 140 184 172 130 172 C76 172 42 140 42 96 Z"
                fill="url(#helmetCeramic3D)"
                stroke="#E9D8FD"
                strokeWidth="2.5"
              />

              {/* TOP HELMET CREST (AERODYNAMIC RIDGE) */}
              <path
                d="M106 16 C118 13 142 13 154 16 L150 48 C140 46 120 46 110 48 Z"
                fill="#805AD5"
                stroke="#D6BCFA"
                strokeWidth="1.5"
              />
              <path
                d="M112 18 C120 15 140 15 148 18 L145 42 C138 40 122 40 115 42 Z"
                fill="url(#crestHighlight)"
              />

              {/* OBSIDIAN VISOR RECESS HOUSING */}
              <path
                d="M58 96 C58 60 88 42 130 42 C172 42 202 60 202 96 C202 132 172 152 130 152 C88 152 58 132 58 96 Z"
                fill="#0A0314"
                stroke="#3B1D6E"
                strokeWidth="2"
              />

              {/* DEEP OBSIDIAN VISOR GLASS */}
              <path
                d="M62 96 C62 64 90 46 130 46 C170 46 198 64 198 96 C198 128 170 148 130 148 C90 148 62 128 62 96 Z"
                fill="url(#visorObsidianGrad)"
              />

              {/* VISOR CURVED GLASS GLARE REFLECTION */}
              <path
                d="M66 90 C70 68 96 52 130 52 C158 52 182 62 192 78 C176 68 148 62 124 64 C94 66 74 78 66 90 Z"
                fill="url(#visorGlassGlare)"
              />

              {/* BOTTOM VISOR RIM ACCENT GLOW */}
              <path
                d="M80 140 C100 146 160 146 180 140"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>

            {/* =========================================================
                CYBERNETIC DYNAMIC DIGITAL EYES (INSIDE VISOR)
            ========================================================= */}
            <motion.div
              style={{
                x: smoothEyeX,
                y: smoothEyeY,
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="flex items-center gap-7 sm:gap-8 mt-[-10px]">
                {/* LEFT EYE */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scaleY: isBlinking ? 0.05 : 1,
                      scaleX: isHovered ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full transition-all duration-300 ${mood === 'thinking'
                        ? 'w-6 h-6 rounded-md bg-cyan-400 shadow-[0_0_20px_#38bdf8,0_0_40px_#0284c7]'
                        : mood === 'happy'
                          ? 'w-7 h-4 rounded-t-full bg-[#E9D5FF] shadow-[0_0_20px_#c084fc,0_0_40px_#9333ea]'
                          : 'w-6 h-7 rounded-[12px] bg-gradient-to-b from-[#FFFFFF] via-[#DDD6FE] to-[#A78BFA] shadow-[0_0_18px_#c4b5fd,0_0_36px_#8b5cf6]'
                      }`}
                  >
                    {/* Glowing Iris Core */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#C084FC] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF]" />
                    </div>
                    {/* Pupil Light Glimmer */}
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                </div>

                {/* RIGHT EYE */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scaleY: isBlinking ? 0.05 : 1,
                      scaleX: isHovered ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full transition-all duration-300 ${mood === 'thinking'
                        ? 'w-6 h-6 rounded-md bg-cyan-400 shadow-[0_0_20px_#38bdf8,0_0_40px_#0284c7]'
                        : mood === 'happy'
                          ? 'w-7 h-4 rounded-t-full bg-[#E9D5FF] shadow-[0_0_20px_#c084fc,0_0_40px_#9333ea]'
                          : 'w-6 h-7 rounded-[12px] bg-gradient-to-b from-[#FFFFFF] via-[#DDD6FE] to-[#A78BFA] shadow-[0_0_18px_#c4b5fd,0_0_36px_#8b5cf6]'
                      }`}
                  >
                    {/* Glowing Iris Core */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#C084FC] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF]" />
                    </div>
                    {/* Pupil Light Glimmer */}
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* =========================================================
              2. NECK ARTICULATION RING
          ========================================================= */}
          <div className="relative -mt-3 z-20 flex flex-col items-center">
            <div className="w-[84px] h-[16px] rounded-full bg-[#1A0A33] border border-[#5B21B6] flex items-center justify-center">
              <div className="w-[60px] h-[4px] rounded-full bg-[#8B5CF6]/60 animate-pulse" />
            </div>
          </div>

          {/* =========================================================
              3. TORSO CERAMIC CHASSIS + QUANTUM REACTOR CORE
          ========================================================= */}
          <div className="relative -mt-2 z-10 flex flex-col items-center">
            {/* TORSO SVG CHASSIS */}
            <svg
              width="210"
              height="150"
              viewBox="0 0 210 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] w-[190px] xs:w-[220px] sm:w-[245px] h-auto"
            >
              {/* Ceramic Torso Armor Shell */}
              <path
                d="M40 10 C70 8 140 8 170 10 C182 30 190 70 180 110 C170 140 140 148 105 148 C70 148 40 140 30 110 C20 70 28 30 40 10 Z"
                fill="url(#torsoCeramic3D)"
                stroke="#E9D8FD"
                strokeWidth="2"
              />

              {/* Chest Plate Inset Panel */}
              <path
                d="M62 26 C82 24 128 24 148 26 C156 46 158 80 148 105 C136 122 118 126 105 126 C92 126 74 122 62 105 C52 80 54 46 62 26 Z"
                fill="#15082E"
                stroke="#4C1D95"
                strokeWidth="1.5"
              />

              {/* Carbon Texture Accent Lines */}
              <line x1="72" y1="36" x2="138" y2="36" stroke="#581C87" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="78" y1="44" x2="132" y2="44" stroke="#581C87" strokeWidth="1" strokeDasharray="3 3" />

              {/* Quantum Reactor Core Outer Ring */}
              <circle cx="105" cy="74" r="26" fill="#0D031F" stroke="#7C3AED" strokeWidth="2" />
              <circle cx="105" cy="74" r="22" stroke="#C084FC" strokeWidth="1" strokeDasharray="4 2" />

              {/* Glowing Reactor Energy Sphere */}
              <circle cx="105" cy="74" r="17" fill="url(#reactorCoreGlow)" />
              <circle cx="105" cy="74" r="8" fill="#FFFFFF" className="animate-pulse" />

              {/* Nyra Emblem Logo on Chest */}
              <path
                d="M101 68 L105 60 L109 68 L117 72 L109 76 L105 84 L101 76 L93 72 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </svg>

            {/* Glowing Core Pulse Overlay */}
            <motion.div
              animate={{
                scale: isThinking ? [1, 1.35, 1] : [1, 1.15, 1],
                opacity: isThinking ? [0.8, 1, 0.8] : [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[60px] xs:top-[68px] sm:top-[74px] w-10 h-10 rounded-full bg-cyan-400/30 blur-md pointer-events-none"
            />
          </div>

          {/* LEFT ARTICULATED ARM (CERAMIC) */}
          <motion.div
            style={{
              rotateZ: smoothLeftArm,
              transformOrigin: 'top right',
            }}
            className="absolute left-[-22px] sm:left-[-34px] top-[95px] sm:top-[125px] z-20 pointer-events-none"
          >
            <svg width="52" height="60" viewBox="0 0 48 56" fill="none" className="w-[36px] xs:w-[42px] sm:w-[52px] h-auto drop-shadow-md">
              <rect x="10" y="6" width="28" height="22" rx="11" fill="url(#torsoCeramic3D)" stroke="#F3E8FF" strokeWidth="1.5" />
              <rect x="14" y="26" width="20" height="6" rx="3" fill="#3C2169" />
              <rect x="13" y="32" width="6" height="15" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="21" y="32" width="6" height="18" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="29" y="32" width="6" height="16" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <circle cx="24" cy="20" r="3" fill="#8B5CF6" />
            </svg>
          </motion.div>

          {/* RIGHT ARTICULATED ARM (CERAMIC) */}
          <motion.div
            style={{
              rotateZ: smoothRightArm,
              transformOrigin: 'top left',
            }}
            className="absolute right-[-22px] sm:right-[-34px] top-[95px] sm:top-[125px] z-20 pointer-events-none"
          >
            <svg width="52" height="60" viewBox="0 0 48 56" fill="none" className="w-[36px] xs:w-[42px] sm:w-[52px] h-auto drop-shadow-md">
              <rect x="10" y="6" width="28" height="22" rx="11" fill="url(#torsoCeramic3D)" stroke="#F3E8FF" strokeWidth="1.5" />
              <rect x="14" y="26" width="20" height="6" rx="3" fill="#3C2169" />
              <rect x="13" y="32" width="6" height="15" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="21" y="32" width="6" height="18" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="29" y="32" width="6" height="16" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <circle cx="24" cy="20" r="3" fill="#8B5CF6" />
            </svg>
          </motion.div>

          {/* =========================================================
              4. ANTI-GRAVITY LEVITATION ENERGY BEAM
          ========================================================= */}
          <div className="relative -mt-2 flex flex-col items-center">
            {/* Vertical Soft Light Cone */}
            <div className="w-[70px] xs:w-[80px] sm:w-[110px] h-[28px] xs:h-[34px] sm:h-[46px] bg-gradient-to-b from-purple-400/40 via-violet-500/15 to-transparent blur-[8px] rounded-b-full" />

            {/* Ground Reflection Ellipse */}
            <motion.div
              animate={{
                scale: isHovered ? [1, 1.2, 1] : [0.9, 1.1, 0.9],
                opacity: isHovered ? 0.8 : 0.5,
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[150px] xs:w-[180px] sm:w-[260px] h-[12px] sm:h-[18px] mt-[-6px] rounded-[100%] bg-gradient-to-r from-transparent via-[#C4B5FD]/60 to-transparent blur-[8px]"
            />
          </div>

          {/* =========================================================
              5. LIVE COMPANION STATUS INDICATOR PILL
          ========================================================= */}
          <motion.div
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-2.5 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/[0.08] border border-purple-300/30 backdrop-blur-xl shadow-lg transition-all group-hover:border-purple-200 group-hover:bg-white/[0.12]"
          >
            <span className={`flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full ${isThinking ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-[#10B981] shadow-[0_0_8px_#34d399]'} animate-pulse`} />
            <span className="font-mono text-[9.5px] sm:text-[11px] font-semibold text-purple-200">
              {isThinking ? 'Nyra Thinking...' : 'Nyra Companion • Interactive'}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =========================================================
          4 ANIMATED FLOATING TELEMETRY CARDS AROUND ROBOT
      ========================================================= */}

      {/* 1. TOP-LEFT: Inference Speed */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          x: [-2, 2, -2],
        }}
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
        whileHover={{ scale: 1.06 }}
        className="absolute top-1 left-1 xs:top-0 xs:left-0 sm:top-4 sm:left-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[145px] xs:max-w-[170px] sm:max-w-[205px] transition-transform cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/35 text-purple-200 shadow-inner">
            <Zap className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white truncate">850 Tok/s</span>
            </div>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-purple-200/80 font-mono block truncate">
              Groq LPU Speed
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. TOP-RIGHT: Reasoning & Intelligence */}
      <motion.div
        animate={{
          y: [6, -6, 6],
          x: [2, -2, 2],
        }}
        transition={{
          duration: 5.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
        whileHover={{ scale: 1.06 }}
        className="absolute top-1 right-1 xs:top-2 xs:right-0 sm:top-6 sm:right-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[145px] xs:max-w-[170px] sm:max-w-[205px] transition-transform cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/35 text-fuchsia-200 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-fuchsia-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white truncate">99.4% Accuracy</span>
            </div>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-purple-200/80 font-mono block truncate">
              Llama 3.3 & Qwen
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. BOTTOM-LEFT: Live Web Search */}
      <motion.div
        animate={{
          y: [7, -7, 7],
          x: [-3, 3, -3],
        }}
        transition={{
          duration: 6.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        }}
        whileHover={{ scale: 1.06 }}
        className="absolute bottom-4 left-1 xs:bottom-6 xs:left-0 sm:bottom-12 sm:left-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[145px] xs:max-w-[180px] sm:max-w-[215px] transition-transform hidden xs:block cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 shadow-inner">
            <Globe className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white block truncate">Live Web Search</span>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-purple-200/80 font-mono truncate block">
              Tavily Context RAG
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4. BOTTOM-RIGHT: Multimodal Document & Privacy */}
      <motion.div
        animate={{
          y: [-7, 7, -7],
          x: [3, -3, 3],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.1,
        }}
        whileHover={{ scale: 1.06 }}
        className="absolute bottom-4 right-1 xs:bottom-4 xs:right-0 sm:bottom-10 sm:right-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-2.5 xs:p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[145px] xs:max-w-[180px] sm:max-w-[215px] transition-transform hidden xs:block cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/documents')}
      >
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="flex h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-400/35 text-violet-200 shadow-inner">
            <FileText className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-violet-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-white block truncate">PDF.js & Vision</span>
            <span className="text-[8.5px] xs:text-[9px] sm:text-[10px] text-purple-200/80 font-mono truncate block">
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
