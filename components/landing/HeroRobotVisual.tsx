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
      className="relative w-full max-w-[420px] xs:max-w-[480px] sm:max-w-[580px] lg:max-w-[680px] xl:max-w-[740px] mx-auto min-h-[460px] xs:min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* =========================================================
          AMBIENT VOLUMETRIC ATMOSPHERE
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Core Soft Ambient Violet Sphere */}
        <div className="h-[340px] xs:h-[400px] sm:h-[480px] lg:h-[540px] w-[340px] xs:w-[400px] sm:w-[480px] lg:w-[540px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/22 via-[#7C3AED]/14 to-[#38BDF8]/12 blur-[90px] sm:blur-[120px]" />
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
            className="absolute -top-4 sm:-top-8 z-40 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl bg-[#1E0F38]/95 border border-purple-300/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:border-purple-200 transition-colors max-w-[90%]"
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
          className="relative flex flex-col items-center scale-95 xs:scale-100 sm:scale-110 lg:scale-120"
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

                {/* Ear Pod Metallic Titanium Gradient */}
                <linearGradient id="earPodTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#E4DAF5" />
                  <stop offset="65%" stopColor="#8A6EC7" />
                  <stop offset="100%" stopColor="#4A2F82" />
                </linearGradient>
              </defs>

              {/* LEFT EAR SENSOR POD */}
              <g>
                <rect x="8" y="70" width="18" height="50" rx="9" fill="url(#earPodTitanium)" stroke="#E9D5FF" strokeWidth="1.2" />
                <rect x="12" y="86" width="10" height="18" rx="5" fill="#1B0C36" />
                <circle cx="17" cy="95" r="3.5" fill={isThinking ? '#38BDF8' : '#C084FC'} className={isThinking ? 'animate-pulse' : ''} />
              </g>

              {/* RIGHT EAR SENSOR POD */}
              <g>
                <rect x="234" y="70" width="18" height="50" rx="9" fill="url(#earPodTitanium)" stroke="#E9D5FF" strokeWidth="1.2" />
                <rect x="238" y="86" width="10" height="18" rx="5" fill="#1B0C36" />
                <circle cx="243" cy="95" r="3.5" fill={isThinking ? '#38BDF8' : '#C084FC'} className={isThinking ? 'animate-pulse' : ''} />
              </g>

              {/* MAIN HELMET CHASSIS (Smooth rounded futuristic contour) */}
              <path
                d="M36 92 C36 40 76 16 130 16 C184 16 224 40 224 92 C224 144 186 168 130 168 C74 168 36 144 36 92 Z"
                fill="url(#helmetCeramic3D)"
                stroke="#FAF5FF"
                strokeWidth="1.8"
              />

              {/* Top Specular Rim Glare */}
              <path
                d="M56 60 C80 28 115 22 130 22 C145 22 180 28 204 60 C175 35 145 30 130 30 C115 30 85 35 56 60 Z"
                fill="url(#crestHighlight)"
              />

              {/* TOP NEURAL INDICATOR JEWEL */}
              <rect
                x="120"
                y="22"
                width="20"
                height="6"
                rx="3"
                fill={isThinking ? '#38BDF8' : isHovered ? '#E879F9' : '#A78BFA'}
                className="transition-colors duration-300"
              />

              {/* INNER RECESSED OBSIDIAN VISOR WITH BEVEL RIM */}
              <path
                d="M52 88 C52 52 82 40 130 40 C178 40 208 52 208 88 C208 122 178 142 130 142 C82 142 52 122 52 88 Z"
                fill="url(#visorObsidianGrad)"
                stroke="#4C1D95"
                strokeWidth="1.8"
              />

              {/* Visor Inner Ambient Glow Rim */}
              <path
                d="M56 88 C56 56 85 44 130 44 C175 44 204 56 204 88 C204 118 175 138 130 138 C85 138 56 118 56 88 Z"
                stroke="#8B5CF6"
                strokeWidth="1"
                strokeOpacity="0.45"
                fill="none"
              />

              {/* VISOR SURFACE CURVED GLASS GLARE */}
              <path
                d="M56 84 C56 58 84 46 130 46 C165 46 188 54 200 68 C175 56 145 54 115 56 C82 58 64 72 56 84 Z"
                fill="url(#visorGlassGlare)"
              />
            </svg>

            {/* =========================================================
                DYNAMIC LED MATRIX EYES (Interactive Gaze inside Visor)
            ========================================================= */}
            <motion.div
              style={{
                x: smoothEyeX,
                y: smoothEyeY,
              }}
              className="absolute top-[34%] left-[28%] w-[44%] h-[30%] flex items-center justify-between px-3 pointer-events-none"
            >
              {/* LEFT EYE */}
              <div className="relative flex items-center justify-center">
                {isBlinking ? (
                  <div className="w-7 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
                ) : isThinking ? (
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    className="w-7 h-7 rounded-full border-2 border-cyan-300 border-t-transparent shadow-[0_0_14px_#38bdf8]"
                  />
                ) : mood === 'curious' || mood === 'happy' ? (
                  <div className="w-8 h-4.5 rounded-t-full border-t-[3.5px] border-l-2 border-r-2 border-purple-100 bg-gradient-to-b from-cyan-300 to-purple-400 shadow-[0_0_14px_#c084fc]" />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] via-[#818CF8] to-[#38BDF8] p-[2.5px] shadow-[0_0_16px_rgba(168,85,247,0.9)]">
                      <div className="w-full h-full rounded-full bg-[#0E0522] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-300 to-white shadow-[0_0_8px_#67e8f9]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT EYE */}
              <div className="relative flex items-center justify-center">
                {isBlinking ? (
                  <div className="w-7 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
                ) : isThinking ? (
                  <motion.div
                    animate={{ rotate: -360, scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    className="w-7 h-7 rounded-full border-2 border-cyan-300 border-t-transparent shadow-[0_0_14px_#38bdf8]"
                  />
                ) : mood === 'curious' || mood === 'happy' ? (
                  <div className="w-8 h-4.5 rounded-t-full border-t-[3.5px] border-l-2 border-r-2 border-purple-100 bg-gradient-to-b from-cyan-300 to-purple-400 shadow-[0_0_14px_#c084fc]" />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] via-[#818CF8] to-[#38BDF8] p-[2.5px] shadow-[0_0_16px_rgba(168,85,247,0.9)]">
                      <div className="w-full h-full rounded-full bg-[#0E0522] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-300 to-white shadow-[0_0_8px_#67e8f9]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* =========================================================
              2. SLEEK HUMANOID ROBOT TORSO & CHEST REACTOR
          ========================================================= */}
          <div className="relative -mt-6 z-20 flex flex-col items-center">
            {/* Torso SVG Armor */}
            <svg
              width="210"
              height="150"
              viewBox="0 0 210 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] w-[200px] xs:w-[230px] sm:w-[260px] md:w-[285px] h-auto"
            >
              <defs>
                <radialGradient id="torsoCeramic3D" cx="50%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#F3EEFB" />
                  <stop offset="75%" stopColor="#CEBFEA" />
                  <stop offset="100%" stopColor="#876EB8" />
                </radialGradient>

                <linearGradient id="neckBallJoint" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1A0C33" />
                  <stop offset="50%" stopColor="#432677" />
                  <stop offset="100%" stopColor="#1A0C33" />
                </linearGradient>

                <linearGradient id="shoulderJoint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DDD4F2" />
                  <stop offset="70%" stopColor="#7E60B8" />
                  <stop offset="100%" stopColor="#3C2169" />
                </linearGradient>
              </defs>

              {/* ARTICULATED TITANIUM NECK JOINT */}
              <rect x="88" y="2" width="34" height="16" rx="6" fill="url(#neckBallJoint)" stroke="#6D28D9" strokeWidth="1.2" />

              {/* LEFT SHOULDER SOCKET */}
              <circle cx="34" cy="42" r="16" fill="url(#shoulderJoint)" stroke="#E9D5FF" strokeWidth="1.2" />

              {/* RIGHT SHOULDER SOCKET */}
              <circle cx="176" cy="42" r="16" fill="url(#shoulderJoint)" stroke="#E9D5FF" strokeWidth="1.2" />

              {/* MAIN CHEST ARMOR PLATING */}
              <path
                d="M56 16 C76 12 134 12 154 16 C176 34 182 82 160 114 C144 132 105 138 105 138 C105 138 66 132 50 114 C28 82 34 34 56 16 Z"
                fill="url(#torsoCeramic3D)"
                stroke="#FAF5FF"
                strokeWidth="1.8"
              />

              {/* AERODYNAMIC CHEST SEAM DETAILS */}
              <path d="M68 46 L88 62" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
              <path d="M142 46 L122 62" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />

              {/* WAIST CONTOUR */}
              <path d="M80 116 C95 124 115 124 130 116" stroke="#7C3AED" strokeWidth="1.8" strokeOpacity="0.5" />
            </svg>

            {/* NEURAL CORE CHEST REACTOR */}
            <div className="absolute top-[36%] left-1/2 -translate-x-1/2 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isThinking ? [1, 1.32, 1] : isHovered ? [1, 1.2, 1] : [1, 1.08, 1],
                  boxShadow: isThinking
                    ? ['0 0 12px #38bdf8', '0 0 28px #818cf8', '0 0 12px #38bdf8']
                    : ['0 0 10px #a855f7', '0 0 20px #c084fc', '0 0 10px #a855f7'],
                }}
                transition={{ duration: isThinking ? 0.9 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#38BDF8] p-[2.5px] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#14062B] flex items-center justify-center">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* =========================================================
              3. ARTICULATED FLOATING ROBOTIC ARMS & HANDS
          ========================================================= */}
          {/* Left Arm & Hand */}
          <motion.div
            style={{ rotate: smoothLeftArm }}
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[-26px] sm:left-[-34px] top-[110px] sm:top-[125px] z-20 pointer-events-none"
          >
            <svg width="52" height="60" viewBox="0 0 48 56" fill="none" className="w-[42px] sm:w-[52px] h-auto drop-shadow-md">
              <rect x="10" y="6" width="28" height="22" rx="11" fill="url(#torsoCeramic3D)" stroke="#F3E8FF" strokeWidth="1.5" />
              <rect x="14" y="26" width="20" height="6" rx="3" fill="#3C2169" />
              <rect x="13" y="32" width="6" height="16" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="21" y="32" width="6" height="18" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <rect x="29" y="32" width="6" height="15" rx="3" fill="#E9D5FF" stroke="#A78BFA" strokeWidth="0.8" />
              <circle cx="24" cy="20" r="3" fill="#8B5CF6" />
            </svg>
          </motion.div>

          {/* Right Arm & Hand */}
          <motion.div
            style={{ rotate: smoothRightArm }}
            animate={{
              y: [4, -4, 4],
            }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute right-[-26px] sm:right-[-34px] top-[110px] sm:top-[125px] z-20 pointer-events-none"
          >
            <svg width="52" height="60" viewBox="0 0 48 56" fill="none" className="w-[42px] sm:w-[52px] h-auto drop-shadow-md">
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
            <div className="w-[80px] sm:w-[110px] h-[34px] sm:h-[46px] bg-gradient-to-b from-purple-400/40 via-violet-500/15 to-transparent blur-[8px] rounded-b-full" />

            {/* Ground Reflection Ellipse */}
            <motion.div
              animate={{
                scale: isHovered ? [1, 1.2, 1] : [0.9, 1.1, 0.9],
                opacity: isHovered ? 0.8 : 0.5,
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[180px] sm:w-[260px] h-[14px] sm:h-[18px] mt-[-6px] rounded-[100%] bg-gradient-to-r from-transparent via-[#C4B5FD]/60 to-transparent blur-[8px]"
            />
          </div>

          {/* =========================================================
              5. LIVE COMPANION STATUS INDICATOR PILL
          ========================================================= */}
          <motion.div
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.08] border border-purple-300/30 backdrop-blur-xl shadow-lg transition-all group-hover:border-purple-200 group-hover:bg-white/[0.12]"
          >
            <span className={`flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full ${isThinking ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-[#10B981] shadow-[0_0_8px_#34d399]'} animate-pulse`} />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-purple-200">
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
        className="absolute top-0 left-[-8px] sm:top-4 sm:left-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[170px] sm:max-w-[205px] transition-transform cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/35 text-purple-200 shadow-inner">
            <Zap className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold text-white">850 Tok/sec</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-purple-200/80 font-mono block">
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
        className="absolute top-2 right-[-8px] sm:top-6 sm:right-0 z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[170px] sm:max-w-[205px] transition-transform cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/35 text-fuchsia-200 shadow-inner">
            <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-fuchsia-300" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-white">99.4% Accuracy</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-purple-200/80 font-mono block">
              Llama 3.3 & Qwen 2.5
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
        className="absolute bottom-6 left-[-10px] sm:bottom-12 sm:left-[-6px] z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[180px] sm:max-w-[215px] transition-transform hidden xs:block cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/chat-ui')}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 shadow-inner">
            <Globe className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-cyan-300" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">Live Web Search</span>
            <span className="text-[9px] sm:text-[10px] text-purple-200/80 font-mono">
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
        className="absolute bottom-4 right-[-10px] sm:bottom-10 sm:right-[-6px] z-30 rounded-2xl border border-purple-300/25 bg-[#170A2E]/90 p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-w-[180px] sm:max-w-[215px] transition-transform hidden xs:block cursor-pointer hover:border-purple-300/50"
        onClick={() => router.push('/documents')}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-400/35 text-violet-200 shadow-inner">
            <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-violet-300" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">PDF.js & Vision</span>
            <span className="text-[9px] sm:text-[10px] text-purple-200/80 font-mono">
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
