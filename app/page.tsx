'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Code2,
  Cpu,
  FileText,
  Globe,
  ImageIcon,
  Layers,
  MessageSquare,
  Mic,
  MicOff,
  PenTool,
  Search,
  Send,
  Sparkles,
  Terminal,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Database,
  Network,
  GitBranch,
  Lock,
  Github,
  Linkedin,
  Mail,
  ChevronRight,
  Play,
  Pause,
  Flame,
} from 'lucide-react';

import CinematicIntro3D from '@/components/landing/CinematicIntro3D';
import NavbarReveal from '@/components/landing/NavbarReveal';
import MobileShowcaseSection from '@/components/landing/MobileShowcaseSection';
import DesktopWorkspaceSection from '@/components/landing/DesktopWorkspaceSection';
import HeroLogoVisual from '@/components/landing/HeroLogoVisual';
import UseCasesShowcaseSection from '@/components/landing/UseCasesShowcaseSection';
import HowNyraWorksSection from '@/components/landing/HowNyraWorksSection';
import TechStackMinimal from '@/components/landing/TechStackMinimal';

const fadeUpStagger: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function HomePage() {
  const router = useRouter();

  // 3D Cinematic Intro State (controlled globally by AppStartupIntro on startup; locally only for replay)
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [isIntroComplete, setIsIntroComplete] = useState<boolean>(false);
  const [logoAssembled, setLogoAssembled] = useState<boolean>(false);
  const [isClientMounted, setIsClientMounted] = useState<boolean>(false);

  // Navbar & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);

  // Hero Depth Planes Refs
  const heroLeftPlaneRef = useRef<HTMLDivElement>(null);
  const heroRightPlaneRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCapabilitiesRef = useRef<HTMLDivElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);

  // FAQ Accordion & Category Filter State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>('all');

  // Session & Reduced Motion Initialization
  useEffect(() => {
    setIsClientMounted(true);

    // Listen for global startup intro completion
    const handleGlobalIntroDone = () => {
      setIsIntroComplete(true);
      setShowIntro(false);
    };

    window.addEventListener('nyra:intro-complete', handleGlobalIntroDone);

    // Fallback in case navigated internally where intro already completed
    const fallbackTimer = setTimeout(() => {
      setIsIntroComplete(true);
      setShowIntro(false);
    }, 2600);

    // Remove scrollbars on landing page
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('no-scrollbar');
      document.body.classList.add('no-scrollbar');
    }

    return () => {
      window.removeEventListener('nyra:intro-complete', handleGlobalIntroDone);
      clearTimeout(fallbackTimer);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('no-scrollbar');
        document.body.classList.remove('no-scrollbar');
      }
    };
  }, []);

  // Handle 3D Cinematic Intro Completion
  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
    setIsIntroComplete(true);
  }, []);

  // Replay Intro Handler (callable from footer)
  const handleReplayIntro = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsIntroComplete(false);
    setShowIntro(true);
  }, []);

  // Hero Content Arrival — Orchestrated 400ms after Nyra Logo Assembly
  useEffect(() => {
    if (!isIntroComplete || !logoAssembled) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(
        [
          heroLeftPlaneRef.current,
          heroBadgeRef.current,
          heroHeadingRef.current,
          heroDescRef.current,
          heroCapabilitiesRef.current,
          heroCtasRef.current,
        ],
        { opacity: 1, x: 0, y: 0, z: 0, scale: 1, rotateY: 0, rotateX: 0, filter: 'blur(0px)' }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(heroLeftPlaneRef.current, {
        x: -40,
        opacity: 0,
      });

      tl.to(
        heroLeftPlaneRef.current,
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        0.05
      );

      tl.fromTo(
        heroBadgeRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.15
      );

      tl.fromTo(
        heroHeadingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        0.25
      );

      tl.fromTo(
        heroDescRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        0.35
      );

      tl.fromTo(
        heroCtasRef.current,
        { scale: 0.94, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' },
        0.45
      );

      tl.fromTo(
        heroCapabilitiesRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.55
      );
    });

    return () => ctx.revert();
  }, [isIntroComplete, logoAssembled]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FAQ Data with Categories (Concise & Verified)
  const faqData = [
    {
      q: 'What is Nyra AI?',
      a: 'Nyra is an AI workspace combining multi-model chat, live web search, PDF document analysis, and actionable task management in one interface.',
      category: 'general',
      tag: 'Overview',
    },
    {
      q: 'What can I do inside Nyra?',
      a: 'You can write code, search the web with live citations, analyze multi-page PDFs, test prompts, and manage project tasks.',
      category: 'general',
      tag: 'Workflows',
    },
    {
      q: 'How does PDF analysis work?',
      a: 'PDFs are parsed locally in your browser using PDF.js for fast, private document Q&A and chapter summaries.',
      category: 'documents',
      tag: 'Documents',
    },
    {
      q: 'Can Nyra understand images?',
      a: 'Yes. Multimodal vision models analyze diagrams, screenshots, UI mockups, and charts with structured responses.',
      category: 'capabilities',
      tag: 'Vision',
    },
    {
      q: 'How does live web search work?',
      a: 'Real-time Tavily search retrieves verified web sources with clickable domain citations for up-to-date answers.',
      category: 'capabilities',
      tag: 'Web Search',
    },
    {
      q: 'Which AI models are available?',
      a: 'Nyra integrates Groq (Llama 3.3 70B, Qwen 2.5), Google Gemini 2.0/2.5, and OpenAI for code, vision, and reasoning.',
      category: 'models',
      tag: 'Models',
    },
    {
      q: 'Is Nyra free to use?',
      a: 'Yes. Nyra offers free access to chat, web search, PDF parsing, prompt library, and task boards with zero setup.',
      category: 'general',
      tag: 'Access',
    },
    {
      q: 'Is voice input supported?',
      a: 'Yes. Built-in speech recognition lets you speak prompts naturally with live audio visualizer feedback.',
      category: 'capabilities',
      tag: 'Voice',
    },
  ];

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        /* Hide scrollbars for Chrome, Safari, and Opera */
        ::-webkit-scrollbar {
          display: none;
          width: 0px;
          height: 0px;
          background: transparent;
        }

        ::selection {
          background: rgba(168, 85, 247, 0.3);
          color: #ffffff;
        }
      `}</style>

      {/* 3D CINEMATIC INTRO OVERLAY */}
      {(!isClientMounted || showIntro) && (
        isClientMounted ? (
          <CinematicIntro3D onComplete={handleIntroComplete} />
        ) : (
          <div className="fixed inset-0 z-[9999] bg-[#030006]" />
        )
      )}

      {/* MAIN CONTAINER */}
      <main
        className="relative w-full min-h-screen bg-[#050505] text-[#F5F5F7] overflow-x-hidden no-scrollbar selection:bg-[#E52A83]/30 selection:text-white transition-colors duration-300"
      >
        {/* PREMIUM AMBIENT GRADIENT & ATMOSPHERIC BACKDROP */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden overflow-x-clip z-0 select-none">
          {/* Subtle Architectural Texture Grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(229,42,131,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,42,131,0.10) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Atmospheric Glow Light Sources */}
          <div className="absolute -top-32 -left-32 w-[clamp(320px,45vw,650px)] h-[clamp(320px,45vw,650px)] rounded-full bg-[#B31372]/[0.06] blur-[160px]" />
          <div className="absolute top-[28%] -right-20 sm:-right-40 w-[clamp(360px,50vw,700px)] h-[clamp(360px,50vw,700px)] rounded-full bg-[#E52A83]/[0.05] blur-[170px]" />
          <div className="absolute top-[55%] -left-20 sm:-left-36 w-[clamp(300px,40vw,600px)] h-[clamp(300px,40vw,600px)] rounded-full bg-[#FF4FA3]/[0.03] blur-[160px]" />
          <div className="absolute top-[75%] right-0 w-[clamp(320px,45vw,650px)] h-[clamp(320px,45vw,650px)] rounded-full bg-[#B31372]/[0.05] blur-[150px]" />
        </div>

        {/* CINEMATIC FLOWING LIGHT RIBBON HERO BACKDROP (Reference Aesthetic: Near-Black + Layered Magenta/Pink Ribbons + Hot Crest Highlight) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 w-full max-w-full h-[clamp(750px,95vh,980px)] sm:h-[clamp(900px,100vh,1180px)] lg:h-[clamp(1100px,100vh,1360px)] overflow-hidden overflow-x-clip z-0 select-none">
          <svg
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            viewBox="0 0 1440 1360"
            fill="none"
            preserveAspectRatio="xMidYMin slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Layer Blur Filters for Smooth Atmospheric Glow */}
              <filter id="ribbonAtmosphereBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="38" result="blur" />
              </filter>
              <filter id="crestGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" result="blur" />
              </filter>

              {/* Master Luminous Gradient: Deep Black -> Deep Purple (#16091F) -> Dark Violet (#24103A) -> Magenta (#B31372) -> Hot Pink (#E52A83) -> Pink Glow (#FF4FA3) -> Hot Red/Pink (#F43F5E) */}
              <linearGradient id="luminousRibbonGrad" x1="5%" y1="0%" x2="95%" y2="85%">
                <stop offset="0%" stopColor="#050505" stopOpacity="0" />
                <stop offset="12%" stopColor="#16091F" stopOpacity="0.75" />
                <stop offset="28%" stopColor="#24103A" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#B31372" stopOpacity="0.92" />
                <stop offset="60%" stopColor="#E52A83" stopOpacity="0.98" />
                <stop offset="72%" stopColor="#FF4FA3" stopOpacity="1" />
                <stop offset="85%" stopColor="#F43F5E" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0" />
              </linearGradient>

              {/* Deep Outer Shadow Curve Gradient */}
              <linearGradient id="deepPurpleShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#16091F" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#24103A" stopOpacity="0.85" />
                <stop offset="85%" stopColor="#110518" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#050505" stopOpacity="1" />
              </linearGradient>

              {/* Razor-Sharp Hot Red/Pink Crest Line */}
              <linearGradient id="crestHotPinkStroke" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#B31372" stopOpacity="0" />
                <stop offset="25%" stopColor="#E52A83" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#FF4FA3" stopOpacity="1" />
                <stop offset="70%" stopColor="#F43F5E" stopOpacity="1" />
                <stop offset="90%" stopColor="#FF88B8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
              </linearGradient>

              {/* Secondary Sweeping Depth Ribbon */}
              <linearGradient id="secondaryRibbonGrad" x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor="#B31372" stopOpacity="0.18" />
                <stop offset="40%" stopColor="#E52A83" stopOpacity="0.22" />
                <stop offset="70%" stopColor="#24103A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0" />
              </linearGradient>

              {/* Hot-Spot Radial Spotlight behind center robot companion */}
              <radialGradient id="heroCenterHotSpot" cx="66%" cy="30%" r="48%">
                <stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.22" />
                <stop offset="35%" stopColor="#B31372" stopOpacity="0.14" />
                <stop offset="65%" stopColor="#16091F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Deep Void */}
            <rect width="1440" height="1360" fill="#050505" />

            {/* Ambient Hot-Spot Behind Primary Light Energy */}
            <circle cx="950" cy="400" r="500" fill="url(#heroCenterHotSpot)" />

            {/* Layer 1: Ambient Background Depth Ribbon */}
            <path
              d="M0 40 C320 280 660 340 1020 140 C1220 25 1360 65 1440 110 L1440 680 C1300 660 1120 710 920 840 C620 1040 320 960 0 740 Z"
              fill="url(#deepPurpleShadowGrad)"
            />

            {/* Layer 2: Secondary Soft Magenta Ambient Ribbon */}
            <path
              d="M-50 120 C340 380 720 420 1080 200 C1280 70 1390 110 1480 160 L1480 540 C1340 500 1160 550 960 680 C660 880 340 800 -50 560 Z"
              fill="url(#secondaryRibbonGrad)"
              filter="url(#ribbonAtmosphereBlur)"
            />

            {/* Layer 3: Primary Flowing Luminous Magenta / Hot Pink Ribbon */}
            <path
              d="M-40 90 C340 350 720 400 1060 180 C1240 55 1370 95 1480 145 L1480 340 C1360 280 1180 320 980 460 C680 660 340 580 -40 320 Z"
              fill="url(#luminousRibbonGrad)"
            />

            {/* Layer 4: Razor-Sharp Hot Red/Pink Crest Stroke (Luminous Edge of the Ribbon) */}
            <path
              d="M-40 90 C340 350 720 400 1060 180 C1240 55 1370 95 1480 145"
              stroke="url(#crestHotPinkStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#crestGlowBlur)"
            />
            <path
              d="M-40 90 C340 350 720 400 1060 180 C1240 55 1370 95 1480 145"
              stroke="url(#crestHotPinkStroke)"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Micro-Particles / Stardust in the Deep Black Void */}
            <circle cx="180" cy="160" r="1.2" fill="#FFFFFF" opacity="0.65" />
            <circle cx="340" cy="110" r="1.5" fill="#FF4FA3" opacity="0.8" />
            <circle cx="520" cy="220" r="1" fill="#FFFFFF" opacity="0.5" />
            <circle cx="680" cy="140" r="1.8" fill="#F43F5E" opacity="0.75" />
            <circle cx="820" cy="90" r="1.2" fill="#FFFFFF" opacity="0.6" />
            <circle cx="990" cy="170" r="1.6" fill="#FF88B8" opacity="0.85" />
            <circle cx="1140" cy="110" r="1" fill="#FFFFFF" opacity="0.45" />
            <circle cx="1280" cy="190" r="1.4" fill="#E52A83" opacity="0.7" />
            <circle cx="420" cy="310" r="1.2" fill="#FFFFFF" opacity="0.5" />
            <circle cx="760" cy="290" r="1.5" fill="#FF4FA3" opacity="0.6" />
            <circle cx="1060" cy="280" r="1.2" fill="#FFFFFF" opacity="0.55" />
          </svg>
        </div>

        {/* STICKY PILL NAVBAR */}
        <NavbarReveal isScrolled={isScrolled} />

        {/* HERO SECTION */}
        <section className="relative z-10 w-full min-h-[calc(100vh-60px)] flex flex-col justify-center py-12 sm:py-16 lg:py-24">
          <div
            className="w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
            style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
          >
            {/* LEFT HERO COLUMN */}
            <div
              ref={heroLeftPlaneRef}
              className="lg:col-span-6 flex flex-col items-start text-left w-full space-y-6"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Eyebrow Badge */}
              <div
                ref={heroBadgeRef}
                className="inline-flex items-center gap-2.5 rounded-full border border-pink-500/25 bg-[#16091F]/60 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl hover:border-pink-400/40 transition-colors"
              >
                <span className="flex h-2 w-2 rounded-full bg-[#E52A83] animate-pulse shadow-[0_0_8px_#FF4FA3]" />
                <span className="font-mono text-[11px] text-pink-300">Nyra AI</span>
                <span className="text-white/40">•</span>
                <span>Unified Intelligence Workspace</span>
              </div>

              {/* Product-Focused Headline */}
              <h1
                ref={heroHeadingRef}
                className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12] xs:leading-[1.08] sm:leading-[1.05] break-words"
              >
                The AI workspace for{' '}
                <span className="bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent">
                  thinking, building, and creating.
                </span>
              </h1>

              {/* Product Description */}
              <p
                ref={heroDescRef}
                className="text-sm xs:text-base sm:text-lg text-[#A7A7B0] leading-relaxed max-w-xl font-normal"
              >
                AI conversations, live web search, document analysis, and tasks unified in one focused studio.
              </p>

              {/* CTAs */}
              <div
                ref={heroCtasRef}
                className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <Link
                  href="/chat-ui"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#801456] hover:from-[#FF4FA3] hover:to-[#B31372] px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-[#E52A83]/25 hover:shadow-[#E52A83]/45 hover:scale-[1.02] transition-all cursor-pointer border border-[#FF4FA3]/30"
                >
                  <Sparkles className="h-4 w-4 text-pink-200" />
                  <span>Launch Free Studio</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#desktop-workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] hover:border-pink-400/30 px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-[#F5F5F7] backdrop-blur-xl transition-all cursor-pointer shadow-sm"
                >
                  <Terminal className="h-4 w-4 text-pink-300" />
                  <span>Interactive Demo</span>
                </a>
              </div>

              {/* Trust & Model Capability Chips */}
              <div
                ref={heroCapabilitiesRef}
                className="pt-2 flex flex-col gap-3 w-full"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#E4DCF0]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0A0512]/80 px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Groq Fast Inference</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0A0512]/80 px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <Globe className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Real-Time Web Search</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0A0512]/80 px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <FileText className="h-3.5 w-3.5 text-pink-300" />
                    <span>PDF Document Analysis</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0A0512]/80 px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    <span>100% Client-Side Privacy</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A7A7B0]">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span>No credit card required</span>
                  <span className="text-white/30">•</span>
                  <span>Instant setup</span>
                  <span className="text-white/30">•</span>
                  <span className="font-mono text-pink-300">Llama 3.3, Gemini &amp; OpenAI</span>
                </div>
              </div>
            </div>

            {/* RIGHT HERO COLUMN: 3D Animated Nyra Neural Logo & Floating Telemetry Cards */}
            <div
              ref={heroRightPlaneRef}
              className="lg:col-span-6 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <HeroLogoVisual onAssembled={() => setLogoAssembled(true)} />
            </div>
          </div>
        </section>

        {/* 3D MOBILE SHOWCASE */}
        <MobileShowcaseSection />

        {/* 3D DESKTOP WORKSPACE SHOWCASE & LIVE DEMO */}
        <DesktopWorkspaceSection />

        {/* SECTION 2: EDITORIAL USE CASES SHOWCASE (Alternating Visual Rhythm) */}
        <UseCasesShowcaseSection />

        {/* SECTION 3: HOW NYRA WORKS (Connected Workflow Timeline: ASK -> CONTEXT -> THINK -> ACT) */}
        <HowNyraWorksSection />

        {/* MINIMAL VERIFIED TECH STACK STRIP */}
        <TechStackMinimal />

        {/* REDESIGNED FAQ SECTION (Dark Obsidian & Deep Purple Accent Style) */}
        <section id="faq" className="scroll-mt-24 sm:scroll-mt-28 relative w-full bg-transparent py-16 sm:py-24 lg:py-28 overflow-hidden transition-colors">
          {/* Subtle Obsidian/Violet Ambient Light */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#B31372]/[0.05] rounded-full blur-3xl" />

          <div className="w-[94%] sm:w-[90%] max-w-5xl mx-auto px-2 sm:px-4 space-y-10 sm:space-y-12 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto flex flex-col items-center"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1 text-xs font-semibold text-pink-200 shadow-xs mb-3.5 backdrop-blur-md">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                  KNOWLEDGE & ANSWERS
                </span>
                <span className="text-pink-400/40">&bull;</span>
                <span className="text-white font-medium">Clear Explanations</span>
              </div>

              {/* Deep Violet Heading */}
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-tight">
                Frequently Asked <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 bg-clip-text text-transparent">Questions</span>
              </h2>

              {/* Muted Subtitle */}
              <p className="mt-3 text-sm sm:text-base text-[#A7A7B0] max-w-lg mx-auto leading-relaxed">
                Common questions about models, documents, privacy, and search.
              </p>

              {/* Category Filter Pills in Dark Obsidian */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {[
                  { id: 'all', label: 'All Questions' },
                  { id: 'general', label: 'General & Access' },
                  { id: 'capabilities', label: 'Features' },
                  { id: 'documents', label: 'Documents & RAG' },
                  { id: 'models', label: 'Models & Speed' },
                ].map((cat) => {
                  const isSelected = faqCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFaqCategory(cat.id)}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] text-white shadow-md shadow-pink-600/30 scale-105 border border-pink-400/40'
                          : 'bg-white/[0.04] text-[#A7A7B0] border border-white/10 hover:bg-white/[0.08] hover:text-white hover:border-pink-400/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Accordion List in Dark Obsidian */}
            <div className="space-y-3">
              {faqData
                .filter((item) => faqCategory === 'all' || item.category === faqCategory)
                .map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <motion.div
                      key={item.q}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? 'bg-[#13071E] border-pink-500/40 shadow-lg shadow-pink-950/20'
                          : 'bg-[#0A0312] border-white/10 hover:border-pink-500/25 hover:bg-[#10051A]'
                      }`}
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-sm sm:text-[15px] text-white cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span className="text-[10px] sm:text-[10.5px] font-mono px-2 sm:px-2.5 py-0.5 rounded-md bg-pink-950/50 text-pink-300 font-semibold border border-pink-500/25 shrink-0">
                            {item.tag}
                          </span>
                          <span className="leading-snug break-words">{item.q}</span>
                        </div>

                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
                            isOpen
                              ? 'bg-[#E52A83] text-white rotate-180'
                              : 'bg-white/[0.08] text-pink-300 border border-white/10'
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="px-4 sm:px-5 pb-5 pt-3 text-xs sm:text-[13.5px] text-[#A7A7B0] leading-relaxed border-t border-white/10 bg-[#0B0314]"
                          >
                            {item.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
            </div>

            {/* Enhanced "Have More Questions?" Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#160822]/90 via-[#0E0417]/90 to-[#05020A]/95 border border-pink-500/25 p-5 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {/* Subtle ambient gradient orb */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#B31372]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-[#E52A83]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                {/* Left info & text */}
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/50 border border-pink-500/30 text-pink-200 text-xs font-semibold shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-400"></span>
                    </span>
                    <span>Live 24/7 AI Assistance</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      Still have questions about Nyra?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A7A7B0] leading-relaxed">
                      Ask Nyra directly in our interactive workspace. Test RAG knowledge lookup, speed benchmarks, or custom workflows in real-time.
                    </p>
                  </div>

                  {/* Quick suggested question chips */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-pink-300">Try asking:</span>
                    {[
                      'How private are my files?',
                      'Can I bring custom API keys?',
                      'What models are supported?',
                    ].map((sample) => (
                      <Link
                        key={sample}
                        href="/chat-ui"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-pink-200 hover:text-white border border-white/10 hover:border-pink-400/40 text-[11px] font-medium transition-all shadow-2xs"
                      >
                        <Sparkles className="h-3 w-3 text-pink-400 shrink-0" />
                        <span>{sample}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-3 shrink-0 lg:border-l lg:border-white/10 lg:pl-8">
                  <Link
                    href="/chat-ui"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#800A4C] text-white hover:from-[#FF4FA3] hover:to-[#B31372] text-sm font-bold shadow-lg shadow-pink-950/50 hover:shadow-pink-700/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group border border-pink-400/30"
                  >
                    <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Ask Nyra AI Now</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <div className="flex items-center justify-center lg:justify-end gap-3 text-[11px] text-[#A7A7B0]">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-pink-400" />
                      &lt;100ms response
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-pink-400" />
                      Free &amp; private
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MINIMAL TECHNOLOGY STRIP */}
        <TechStackMinimal />

        {/* ========================================================================= */}
        {/* FULL-COVERAGE DEEP NEAR-BLACK CTA & FOOTER SECTION                        */}
        {/* ========================================================================= */}
        <section className="relative w-full bg-[#050505] text-white pt-0 pb-0 overflow-hidden">
          {/* SEAMLESS HERO-STYLE FLOWING WAVE TRANSITION */}
          <div className="relative w-full overflow-hidden leading-none select-none -mb-[1px]">
            <svg
              className="w-full h-24 sm:h-36 md:h-44 lg:h-52 xl:h-60 block align-middle"
              viewBox="0 0 1440 280"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="superchargeWaveMain" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#16091F" />
                  <stop offset="35%" stopColor="#0F0516" />
                  <stop offset="70%" stopColor="#08030C" />
                  <stop offset="100%" stopColor="#050505" />
                </linearGradient>
                <linearGradient id="superchargeWaveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#E52A83" stopOpacity="0.2" />
                  <stop offset="75%" stopColor="#B31372" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Seamless base gradient transition matching section above */}
              <rect width="1440" height="280" className="fill-[#050505] transition-colors duration-300" />

              {/* Layer 1: Ethereal Soft Pink/Magenta Glow Sheen */}
              <path
                d="M0,35 C380,185 740,215 1080,65 C1240,-5 1360,35 1440,85 L1440,320 L0,320 Z"
                fill="url(#superchargeWaveGlow)"
              />

              {/* Layer 2: Main Flowing Asymmetric Deep Purple Base Wave */}
              <path
                d="M0,60 C380,210 740,240 1080,90 C1240,20 1360,60 1440,110 L1440,320 L0,320 Z"
                fill="url(#superchargeWaveMain)"
              />
            </svg>
          </div>

          {/* Deep Space Background for CTA and Footer */}
          <div className="relative w-full bg-[#050505]">
            {/* Ambient Internal Glows Strictly Within Dark Region */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-[#B31372]/15 via-[#E52A83]/10 to-[#16091F]/20 rounded-full blur-[140px]" />
              <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[300px] bg-[#24103A]/[0.2] rounded-full blur-[110px]" />
            </div>

            <div className="relative z-10">
              {/* FINAL CTA SECTION: SUPERCHARGE YOUR THINKING */}
              <div className="w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16 text-center">
                {/* Eyebrow Pill Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 hover:bg-[#16091F] px-4 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-md transition-all mb-5"
                >
                  <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="font-mono text-[11px] text-pink-300">Nyra v2.4</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[12px]">Get Started in Seconds</span>
                </motion.div>

                {/* Product Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.14] max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto"
                >
                  Supercharge your thinking with{' '}
                  <span className="bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent">
                    Nyra AI.
                  </span>
                </motion.h2>

                {/* Product Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-4 sm:mt-4.5 text-sm sm:text-base text-[#A7A7B0] leading-relaxed max-w-2xl sm:max-w-3xl mx-auto font-normal"
                >
                  Join engineers, researchers, and creators accelerating their workflows with conversational reasoning, private PDF document RAG, and continuous memory.
                </motion.p>

                {/* Action Buttons matching Hero CTA style (Strict Single-Line Layout) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.22 }}
                  className="mt-7 sm:mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto"
                >
                  <Link
                    href="/chat-ui"
                    className="group relative inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#960E5B] hover:from-[#FF4FA3] hover:via-[#E52A83] hover:to-[#B31372] text-xs sm:text-[13.5px] font-semibold text-white tracking-wide border border-pink-300/30 hover:border-pink-200/50 shadow-[0_0_24px_rgba(229,42,131,0.35)] hover:shadow-[0_0_36px_rgba(255,79,163,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 text-pink-200 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="whitespace-nowrap">Launch Free Workspace</span>
                    <ArrowRight className="h-4 w-4 text-pink-200 shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>

                  <a
                    href="#desktop-workspace"
                    className="group inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-pink-300/40 text-xs sm:text-[13.5px] font-medium text-[#F5F5F7] hover:text-white backdrop-blur-md shadow-xs hover:shadow-[0_0_20px_rgba(229,42,131,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    <Terminal className="h-4 w-4 text-pink-300/90 shrink-0 group-hover:text-pink-200" />
                    <span className="whitespace-nowrap">Interactive Demo</span>
                  </a>
                </motion.div>

                {/* Trust & Capability Value Chips */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mt-8 sm:mt-9 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#F5F5F7]"
                >
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-pink-400/30 px-3.5 py-1.5 font-medium text-[11.5px] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-2xs">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Fast Model Inference</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-pink-400/30 px-3.5 py-1.5 font-medium text-[11.5px] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-2xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    <span>100% Client-Side Privacy</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-pink-400/30 px-3.5 py-1.5 font-medium text-[11.5px] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-2xs">
                    <Globe className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Verified Web Grounding</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-pink-400/30 px-3.5 py-1.5 font-medium text-[11.5px] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-2xs">
                    <Sparkles className="h-4 w-4 text-pink-300" />
                    <span>Zero Setup Required</span>
                  </span>
                </motion.div>
              </div>

            {/* POLISHED ARCHITECTURAL NYRA AI FOOTER */}
            <footer className="relative pt-12 sm:pt-16 pb-10 text-xs text-[#A7A7B0] overflow-hidden bg-transparent">
              <div className="w-[90%] max-w-[1800px] mx-auto px-4 sm:px-6 space-y-12">
                {/* Clean Horizontal Divider before Footer */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

                {/* 12-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                  {/* Brand & Mission Column (lg:col-span-4) */}
                  <div className="lg:col-span-4 space-y-4.5">
                    <Link href="/" className="inline-flex items-center gap-3.5 group">
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-pink-950/50 border border-pink-500/30 bg-[#0E0514] group-hover:scale-105 group-hover:border-pink-300/60 transition-all duration-300">
                        <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-pink-200 transition-colors">
                          Nyra AI
                        </span>
                        <span className="block text-xs font-mono text-pink-300/85 font-medium tracking-wide">
                          Autonomous Thinking Partner
                        </span>
                      </div>
                    </Link>

                    <p className="text-[13px] text-[#A7A7B0] leading-relaxed max-w-sm">
                      A unified AI workspace for thinking, building, and creating with streaming intelligence, private document RAG, and continuous memory.
                    </p>

                    {/* Operational Status & Replay Intro */}
                    <div className="pt-1 flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[11.5px] font-mono text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span>All Systems Operational</span>
                      </div>

                      <button
                        onClick={handleReplayIntro}
                        className="inline-flex items-center gap-1.5 text-[11.5px] text-pink-200 hover:text-white transition-all cursor-pointer px-3 py-1.5 rounded-xl border border-pink-400/20 bg-pink-500/5 hover:bg-pink-500/15 hover:border-pink-300/40"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Replay 3D Intro</span>
                      </button>
                    </div>

                    {/* Social Channels */}
                    <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-[#A7A7B0] hover:text-white hover:border-pink-300/40 transition-all duration-200 cursor-pointer group shadow-2xs"
                        aria-label="GitHub Repository"
                      >
                        <Github className="h-4 w-4 text-pink-300 group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium">GitHub</span>
                      </a>

                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-[#A7A7B0] hover:text-white hover:border-pink-300/40 transition-all duration-200 cursor-pointer group shadow-2xs"
                        aria-label="LinkedIn Page"
                      >
                        <Linkedin className="h-4 w-4 text-cyan-300 group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium">LinkedIn</span>
                      </a>

                      <a
                        href="mailto:contact@nyra.ai"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-[#A7A7B0] hover:text-white hover:border-pink-300/40 transition-all duration-200 cursor-pointer group shadow-2xs"
                        aria-label="Contact Email"
                      >
                        <Mail className="h-4 w-4 text-amber-300 group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium">Contact</span>
                      </a>
                    </div>
                  </div>

                  {/* Navigation Columns (lg:col-span-8) */}
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
                    {/* Column 1: Workspace */}
                    <div className="space-y-3.5">
                      <span className="font-semibold text-white text-xs uppercase tracking-wider font-mono block text-pink-200/90">
                        Workspace
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link
                            href="/chat-ui"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Chat Studio</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/documents"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Documents &amp; RAG</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tasks"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Tasks &amp; Planning</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/memory"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Continuous Memory</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Platform */}
                    <div className="space-y-3.5">
                      <span className="font-semibold text-white text-xs uppercase tracking-wider font-mono block text-pink-200/90">
                        Platform
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link
                            href="/features"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Core Capabilities</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/docs"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Documentation</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/pricing"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Pricing &amp; Plans</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/features#live-search"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Verified Web Data</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Company & Trust */}
                    <div className="space-y-3.5">
                      <span className="font-semibold text-white text-xs uppercase tracking-wider font-mono block text-pink-200/90">
                        Company
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link
                            href="/about"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>About Nyra AI</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/privacy"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Privacy &amp; Security</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/terms"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Terms of Service</span>
                          </Link>
                        </li>
                        <li>
                          <a
                            href="mailto:support@nyra.ai"
                            className="text-[13px] text-[#A7A7B0] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Support &amp; Feedback</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Legal, Copyright & Version Bar */}
                <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7A7B0]">
                  <p>© {new Date().getFullYear()} Nyra AI Inc. All rights reserved.</p>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-[#A7A7B0]">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <span className="text-white/20">•</span>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                    <span className="text-white/20">•</span>
                    <span className="font-mono text-pink-300 font-semibold px-2.5 py-0.5 rounded-md bg-pink-500/10 border border-pink-400/20 text-[11px]">
                      v2.4.0
                    </span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}