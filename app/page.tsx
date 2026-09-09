'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { motion, AnimatePresence, useSpring, useMotionValue, type Variants } from 'framer-motion';
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
} from 'lucide-react';

import CinematicIntro3D from '@/components/landing/CinematicIntro3D';
import NavbarReveal from '@/components/landing/NavbarReveal';
import MobileShowcaseSection from '@/components/landing/MobileShowcaseSection';
import DesktopWorkspaceSection from '@/components/landing/DesktopWorkspaceSection';
import HeroRobotVisual from '@/components/landing/HeroRobotVisual';

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

  // 3D Cinematic Intro State (shown on first visit per session or when replayed)
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [isIntroComplete, setIsIntroComplete] = useState<boolean>(true);
  const [isClientMounted, setIsClientMounted] = useState<boolean>(false);

  // Navbar & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);

  // Hero Depth Planes Refs
  const heroLeftPlaneRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCapabilitiesRef = useRef<HTMLDivElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);
  const heroRightPlaneRef = useRef<HTMLDivElement>(null);

  // FAQ Accordion & Category Filter State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>('all');

  // Architecture Journey State & Auto-Play Animation
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [isAutoPlayingPipeline, setIsAutoPlayingPipeline] = useState<boolean>(true);
  const [techCategory, setTechCategory] = useState<string>('all');

  // Auto-advance the 4-step journey animation smoothly
  useEffect(() => {
    if (!isAutoPlayingPipeline) return;
    const interval = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % 4);
    }, 3600);
    return () => clearInterval(interval);
  }, [isAutoPlayingPipeline]);

  // Mouse Parallax Values for 3D Camera Feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 90, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 22 });

  // Session & Reduced Motion Initialization
  useEffect(() => {
    setIsClientMounted(true);
    if (typeof window === 'undefined') return;

    const introSeen = sessionStorage.getItem('nyra_intro_seen') === 'true';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!introSeen && !prefersReducedMotion) {
      setShowIntro(true);
      setIsIntroComplete(false);
    } else {
      setShowIntro(false);
      setIsIntroComplete(true);
    }
  }, []);

  // Handle 3D Cinematic Intro Completion
  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
    setIsIntroComplete(true);
  }, []);

  // Replay Intro Handler (callable from footer)
  const handleReplayIntro = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nyra_intro_seen');
    }
    setIsIntroComplete(false);
    setShowIntro(true);
  }, []);

  // Hero Depth Planes Arrival
  useEffect(() => {
    if (!isIntroComplete) return;

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
          heroRightPlaneRef.current,
        ],
        { opacity: 1, x: 0, y: 0, z: 0, scale: 1, rotateY: 0, rotateX: 0, filter: 'blur(0px)' }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(heroLeftPlaneRef.current, {
        x: -160,
        z: -200,
        rotationY: 10,
        opacity: 0,
      });

      gsap.set(heroRightPlaneRef.current, {
        x: 180,
        z: -250,
        rotationY: -14,
        rotationX: 4,
        scale: 0.88,
        opacity: 0,
      });

      tl.to(
        heroLeftPlaneRef.current,
        {
          x: 0,
          z: 0,
          rotationY: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.05
      );

      tl.fromTo(
        heroBadgeRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.2
      );

      tl.fromTo(
        heroHeadingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        0.28
      );

      tl.fromTo(
        heroDescRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        0.38
      );

      tl.fromTo(
        heroCtasRef.current,
        { scale: 0.94, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' },
        0.48
      );

      tl.fromTo(
        heroCapabilitiesRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.58
      );

      tl.to(
        heroRightPlaneRef.current,
        {
          x: 0,
          z: 0,
          rotationY: 0,
          rotationX: 0,
          scale: 1,
          opacity: 1,
          duration: 1.05,
          ease: 'power3.out',
        },
        0.3
      );
    });

    return () => ctx.revert();
  }, [isIntroComplete]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - 150);
    mouseY.set(e.clientY - 150);

    if (heroRightPlaneRef.current && isIntroComplete) {
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(heroRightPlaneRef.current, {
        rotationY: xNorm * 3.5,
        rotationX: -yNorm * 2.5,
        duration: 0.6,
        ease: 'power1.out',
      });
    }
  };

  // 6 Verified Core Features (Soft Lavender Light-Theme Style)
  const featuresList = [
    {
      icon: MessageSquare,
      title: 'Contextual AI Chat',
      desc: 'Natural conversational AI with fast streaming and multi-turn memory.',
      points: ['Instant token streaming', 'Full conversation history'],
      tag: 'AI Chat',
      href: '/chat-ui',
      actionText: 'Try AI Chat',
    },
    {
      icon: Globe,
      title: 'Real-Time Web Search',
      desc: 'Live internet retrieval for verified answers, facts, and source citations.',
      points: ['Live web data synthesis', 'Direct source citations'],
      tag: 'Web Search',
      href: '/chat-ui',
      actionText: 'Search the Web',
    },
    {
      icon: FileText,
      title: 'PDF & Document Analysis',
      desc: 'Upload PDFs and documents to summarize contents and ask targeted questions.',
      points: ['Local document parsing', 'Instant chapter summaries'],
      tag: 'PDF & Documents',
      href: '/documents',
      actionText: 'Analyze Documents',
    },
    {
      icon: ImageIcon,
      title: 'Multimodal Vision',
      desc: 'Analyze screenshots, architecture diagrams, charts, and visual mockups.',
      points: ['UI & diagram reasoning', 'Chart & visual analysis'],
      tag: 'Vision AI',
      href: '/chat-ui',
      actionText: 'Inspect with Vision',
    },
    {
      icon: Code2,
      title: 'Code Generation & Studio',
      desc: 'Write, debug, and refactor clean code with built-in syntax highlighting.',
      points: ['Syntax-highlighted code', 'One-click copy and edit'],
      tag: 'Code Studio',
      href: '/chat-ui',
      actionText: 'Open Code Studio',
    },
    {
      icon: Layers,
      title: 'Workspace & Branching',
      desc: 'Organize conversations into separate project spaces and save them offline.',
      points: ['Custom project spaces', 'Offline local saving'],
      tag: 'Workspaces',
      href: '/chat-ui',
      actionText: 'Explore Workspaces',
    },
  ];

  // How Nyra Works — 4 Simple Visual Journey Stages
  const architecturePipelineSteps = [
    {
      id: 'step-1',
      number: '01',
      title: 'User Prompt',
      shortDesc: 'You type a message, ask a question, or upload a file.',
      icon: MessageSquare,
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Understands & Routes',
      shortDesc: 'Nyra reads intent and selects the optimal AI workflow.',
      icon: Network,
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Retrieves Information',
      shortDesc: 'Parses files privately in-browser or searches the live web.',
      icon: Search,
    },
    {
      id: 'step-4',
      number: '04',
      title: 'Generates Response',
      shortDesc: 'Streams clean answers with code, formatting, and citations.',
      icon: Cpu,
    },
  ];

  // 3 Core Architectural Guarantees (Simplified & Clear)
  const architecturePillars = [
    {
      icon: Zap,
      title: 'Fast Responses',
      badge: 'Sub-15ms Speed',
      description: 'Answers start streaming in milliseconds with ultra-fast generation so you never wait.',
      points: ['Instant time-to-first-token', '300+ words/sec streaming'],
    },
    {
      icon: ShieldCheck,
      title: 'Private Processing',
      badge: '100% In-Browser',
      description: 'Your PDFs and images are processed on your device and never stored on cloud servers.',
      points: ['Local document analysis', 'Zero cloud file storage'],
    },
    {
      icon: Globe,
      title: 'Live Web Information',
      badge: 'Verified Sources',
      description: 'Retrieves fresh internet facts and technical docs with direct clickable citations.',
      points: ['Real-time web research', 'Verified source links'],
    },
  ];

  // Simplified Verified Tech Stack
  const coreTechStack = [
    { name: 'Next.js 16', role: 'Edge Routing' },
    { name: 'React 19', role: 'UI Framework' },
    { name: 'Groq LPUs', role: 'Inference Engine' },
    { name: 'Tavily Search', role: 'Live Web Data' },
    { name: 'PDF.js', role: 'Local Parsing' },
    { name: 'TypeScript', role: 'Type Safety' },
    { name: 'Framer Motion', role: 'Smooth Motion' },
    { name: 'Tailwind CSS', role: 'Design System' },
  ];

  // FAQ Data with Categories
  const faqData = [
    {
      q: 'What is Nyra AI?',
      a: 'Nyra AI is a modern full-stack AI workspace built for engineers, researchers, and creators. It integrates fast conversational models, live web search, PDF document parsing, vision analysis, and code assistance into a single unified application.',
      category: 'general',
      tag: 'Overview',
    },
    {
      q: 'What can Nyra help me with?',
      a: 'You can use Nyra to write and debug code, query the live internet for verified sources, upload and summarize PDFs, analyze visual mockups, and organize conversations into structured project workspaces.',
      category: 'general',
      tag: 'Workflows',
    },
    {
      q: 'Can Nyra analyze PDFs?',
      a: 'Yes. You can upload multi-page PDF documents directly in the workspace. Nyra extracts text client-side using PDF.js and allows you to summarize chapters, extract tables, and ask targeted questions.',
      category: 'documents',
      tag: 'PDF & RAG',
    },
    {
      q: 'Can Nyra understand images and diagrams?',
      a: 'Yes. Nyra supports image and screenshot uploads, analyzing visual layouts, database architecture diagrams, UI mockups, and charts with multimodal vision models.',
      category: 'capabilities',
      tag: 'Vision AI',
    },
    {
      q: 'Does Nyra support live web search?',
      a: 'Yes. Nyra incorporates real-time Tavily search retrieval, synthesizing live internet sources and providing domain favicons with bracketed inline citations.',
      category: 'capabilities',
      tag: 'Web Search',
    },
    {
      q: 'Which AI models power Nyra?',
      a: 'Nyra is powered by high-performance models via the Groq SDK, including Qwen 3.6 27B for vision and reasoning, Llama 3.3 70B for code, and Llama 3.1 8B for fast sub-second interactions.',
      category: 'models',
      tag: 'Groq LPUs',
    },
    {
      q: 'Is Nyra free to use?',
      a: 'Yes. Nyra offers full free access to conversation tools, prompt creator library, document RAG, and project workspaces with zero setup required.',
      category: 'general',
      tag: 'Access',
    },
    {
      q: 'Is voice interaction supported?',
      a: 'Yes. Nyra includes built-in microphone speech recognition and a dedicated voice interaction mode with live audio waveform equalizers.',
      category: 'capabilities',
      tag: 'Voice Mode',
    },
  ];

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: rgba(168, 85, 247, 0.3);
          color: #ffffff;
        }

        ::-webkit-scrollbar {
          width: 7px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      `}</style>

      {/* 3D CINEMATIC INTRO OVERLAY */}
      {isClientMounted && showIntro && <CinematicIntro3D onComplete={handleIntroComplete} />}

      {/* MAIN CONTAINER */}
      <main
        onMouseMove={handleMouseMove}
        className="relative w-full min-h-screen bg-[#F6F3FA] text-[#241C35] overflow-x-hidden selection:bg-[#8B6FC9]/25 selection:text-[#241C35] transition-colors duration-300"
      >
        {/* ASYMMETRIC DEEP MIDNIGHT VIOLET HERO BACKDROP */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1150px] sm:h-[1280px] lg:h-[1360px] overflow-hidden z-0 select-none">
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 1440 1360"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="midnightVioletHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B0418" />
                <stop offset="35%" stopColor="#15082E" />
                <stop offset="70%" stopColor="#200D44" />
                <stop offset="100%" stopColor="#2B125A" />
              </linearGradient>
              <linearGradient id="subtleVioletAccent" x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor="#8B6FC9" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#5B3896" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2D1552" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="violetRimGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
                <stop offset="45%" stopColor="#8B6FC9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#432272" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="heroCenterSpotlight" cx="68%" cy="28%" r="46%">
                <stop offset="0%" stopColor="#8B6FC9" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#432272" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#110724" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Asymmetric Flowing Path:
                - Left side (x=0) extends down to y=1360 (flowing into next section)
                - Right side (x=1440) ends up at y=680 (ends naturally inside hero section)
                - Curved organic flowing boundary connecting right to left
            */}
            <path
              d="M0 0 L1440 0 L1440 680 C1280 710 1080 770 900 860 C700 960 540 1060 380 1180 C220 1290 90 1340 0 1360 Z"
              fill="url(#midnightVioletHeroGrad)"
            />

            {/* Secondary Soft Layer for Organic Editorial Depth */}
            <path
              d="M0 0 L1440 0 L1440 640 C1290 670 1100 730 930 820 C730 910 570 1000 410 1120 C240 1240 100 1300 0 1320 Z"
              fill="url(#subtleVioletAccent)"
            />

            {/* Glowing Accent Rim along the Organic Curved Boundary */}
            <path
              d="M0 1360 C90 1340 220 1290 380 1180 C540 1060 700 960 900 860 C1080 770 1280 710 1440 680"
              stroke="url(#violetRimGlow)"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Ambient Radial Spotlight Behind 3D Companion Robot */}
            <circle cx="980" cy="380" r="440" fill="url(#heroCenterSpotlight)" />
          </svg>
        </div>

        {/* STICKY PILL NAVBAR */}
        <NavbarReveal isScrolled={isScrolled} />

        {/* HERO SECTION */}
        <section className="relative z-10 w-full min-h-[calc(100vh-60px)] flex flex-col justify-center py-12 sm:py-16 lg:py-24">
          <div
            className="w-[94%] sm:w-[90%] max-w-[1750px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
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
                className="inline-flex items-center gap-2.5 rounded-full border border-purple-300/25 bg-white/[0.08] px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-purple-200 shadow-sm backdrop-blur-xl hover:border-purple-300/40 transition-colors"
              >
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-[11px] text-purple-300">Nyra v2.4</span>
                <span className="text-white/40">•</span>
                <span>Next-Gen Autonomous Thinking Partner</span>
              </div>

              {/* Product-Focused Headline */}
              <h1
                ref={heroHeadingRef}
                className="text-4xl xs:text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] sm:leading-[1.05] break-words"
              >
                The AI workspace for{' '}
                <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  thinking, building, and creating.
                </span>
              </h1>

              {/* Product Description */}
              <p
                ref={heroDescRef}
                className="text-sm xs:text-base sm:text-lg text-[#D4CBE5] leading-relaxed max-w-xl font-normal"
              >
                Experience ultra-fast Groq LPU inference, multi-page in-browser PDF research, live web synthesis, and persistent memory — unified in a distraction-free studio.
              </p>

              {/* CTAs */}
              <div
                ref={heroCtasRef}
                className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <Link
                  href="/chat-ui"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-950/60 hover:shadow-purple-700/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-purple-200" />
                  <span>Launch Free Studio</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#desktop-workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.07] hover:bg-white/[0.13] px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all cursor-pointer shadow-sm hover:border-purple-300/40"
                >
                  <Terminal className="h-4 w-4 text-purple-300" />
                  <span>Interactive Demo</span>
                </a>
              </div>

              {/* Trust & Model Capability Chips */}
              <div
                ref={heroCapabilitiesRef}
                className="pt-2 flex flex-col gap-3 w-full"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#E4DCF0]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Sub-15ms Groq LPUs</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <Globe className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Real-Time Web Search</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <FileText className="h-3.5 w-3.5 text-violet-300" />
                    <span>PDF.js In-Browser RAG</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    <span>100% Private</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#A69BBF]">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>No credit card required</span>
                  <span className="text-white/30">•</span>
                  <span>Instant setup</span>
                  <span className="text-white/30">•</span>
                  <span className="font-mono text-purple-300">Llama 3.3 & Qwen 2.5 72B</span>
                </div>
              </div>
            </div>

            {/* RIGHT HERO COLUMN: 3D Robot Companion & Floating Telemetry Cards */}
            <div
              ref={heroRightPlaneRef}
              className="lg:col-span-6 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <HeroRobotVisual />
            </div>
          </div>
        </section>

        {/* 3D MOBILE SHOWCASE */}
        <MobileShowcaseSection />

        {/* 3D DESKTOP WORKSPACE SHOWCASE & LIVE DEMO */}
        <DesktopWorkspaceSection />

        {/* 6 CORE CAPABILITIES (Soft Lavender Light-Theme Style) */}
        <section id="features" className="relative w-full border-t border-[#E2D4F2] bg-[#F8F5FC] py-18 sm:py-24 lg:py-28 overflow-hidden transition-colors">
          {/* Subtle Soft Lavender Ambient Light */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#8B6FC9]/[0.05] rounded-full blur-3xl" />

          <div className="w-[94%] sm:w-[90%] max-w-[1440px] mx-auto px-1 sm:px-4 relative z-10">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto flex flex-col items-center"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7EC] bg-[#EFE8F6] px-3.5 py-1 text-xs font-semibold text-[#633A9D] shadow-xs mb-3.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DFD0F2] text-[#633A9D]">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                  CORE CAPABILITIES
                </span>
                <span className="text-[#633A9D]/30">&bull;</span>
                <span className="text-[#231538] font-medium">Everything You Need</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#231538] leading-[1.18]">
                Built for work, <span className="bg-gradient-to-r from-[#5B2E96] via-[#6E42A6] to-[#8C62C8] bg-clip-text text-transparent">research, and coding.</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#5A4F6B] px-2 max-w-2xl leading-relaxed">
                Six verified core tools engineered directly into Nyra—clean, fast, and ready to use without setup friction.
              </p>
            </motion.div>

            {/* Clean, Minimal 3 x 2 Soft Lavender Cards Grid */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {featuresList.map((feature, i) => {
                const IconComp = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    custom={i}
                    variants={fadeUpStagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-30px' }}
                    className="group relative rounded-2xl border border-[#D8C7EC] bg-[#EFE8F6] p-6 sm:p-6.5 transition-all duration-200 hover:-translate-y-1 hover:border-[#B596DA] hover:bg-[#E9DFFA] shadow-[0_4px_16px_rgba(109,72,160,0.06)] hover:shadow-[0_12px_28px_rgba(109,72,160,0.12)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Medium Violet Icon & Soft Lavender Tag */}
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFD0F2] text-[#633A9D] border border-[#CEBAE6] group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-[#D8C7EC] bg-[#F7F2FD] px-2.5 py-0.5 text-[11px] font-mono font-semibold text-[#633A9D] tracking-wide">
                          {feature.tag}
                        </span>
                      </div>

                      {/* Title & Short Description */}
                      <h3 className="mt-4.5 text-lg font-bold text-[#231538] group-hover:text-[#5B2E96] transition-colors tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] sm:text-[13.5px] text-[#5A4F6B] leading-relaxed">
                        {feature.desc}
                      </p>

                      {/* 2 Key Points (Clear & Minimal) */}
                      <div className="mt-4 pt-3.5 border-t border-[#DFD0F2]/80 space-y-1.5">
                        {feature.points.map((pt) => (
                          <div key={pt} className="flex items-center gap-2 text-xs font-medium text-[#46395B]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C50B8] shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Link */}
                    <div className="mt-4.5 pt-3 border-t border-[#DFD0F2]/80 flex items-center justify-between">
                      <Link
                        href={feature.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#633A9D] hover:text-[#471E80] transition-colors group-hover:gap-2"
                      >
                        <span>{feature.actionText}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW NYRA WORKS / SYSTEM ARCHITECTURE (Visual Flow, Animated Connectors & Soft Lavender) */}
        <section id="architecture" className="relative w-full border-t border-[#E2D4F2] bg-[#F8F5FC] py-18 sm:py-24 lg:py-28 overflow-hidden transition-colors">
          {/* Soft Lavender Ambient Spotlight */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#8B6FC9]/[0.05] rounded-full blur-3xl" />

          <div className="w-[94%] sm:w-[90%] max-w-[1440px] mx-auto px-1 sm:px-4 space-y-12 sm:space-y-16 relative z-10">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto flex flex-col items-center"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7EC] bg-[#EFE8F6] px-3.5 py-1 text-xs font-semibold text-[#633A9D] shadow-xs mb-3.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DFD0F2] text-[#633A9D]">
                  <Cpu className="h-2.5 w-2.5" />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                  HOW NYRA WORKS
                </span>
                <span className="text-[#633A9D]/30">&bull;</span>
                <span className="text-[#231538] font-medium">Simple 4-Step Flow</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#231538] leading-tight">
                From your prompt to <span className="bg-gradient-to-r from-[#5B2E96] via-[#6E42A6] to-[#8C62C8] bg-clip-text text-transparent">the final response.</span>
              </h2>

              <p className="mt-3 text-sm sm:text-base text-[#5A4F6B] px-2 max-w-2xl leading-relaxed">
                A seamless, privacy-first journey powered by intelligent routing, private in-browser document parsing, and ultra-fast AI streaming.
              </p>
            </motion.div>

            {/* 4-Stage Visual Journey with Animated Flow Connectors */}
            <div
              onMouseEnter={() => setIsAutoPlayingPipeline(false)}
              onMouseLeave={() => setIsAutoPlayingPipeline(true)}
              className="relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
                {architecturePipelineSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = activePipelineStep === idx;
                  const isPassed = activePipelineStep > idx;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      onClick={() => {
                        setActivePipelineStep(idx);
                        setIsAutoPlayingPipeline(false);
                      }}
                      className={`relative rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group select-none ${
                        isActive
                          ? 'bg-white border-2 border-[#7C50B8] shadow-lg shadow-[#7C50B8]/12 -translate-y-1'
                          : isPassed
                          ? 'bg-[#F4EFFC] border border-[#D0BFEC] hover:border-[#B596DA] hover:bg-white hover:-translate-y-0.5'
                          : 'bg-[#EFE8F6] border border-[#D8C7EC] hover:border-[#B596DA] hover:bg-[#FAF7FD] hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Active Indicator Pulse Ring */}
                      {isActive && (
                        <div className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full bg-[#7C50B8] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          <span>Active</span>
                        </div>
                      )}

                      <div>
                        {/* Top Row: Stage Number & Icon */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold tracking-wider ${
                            isActive ? 'text-[#7C50B8]' : 'text-[#8C7A9E]'
                          }`}>
                            STAGE {step.number}
                          </span>
                          <div className={`p-2.5 rounded-xl transition-colors ${
                            isActive
                              ? 'bg-[#7C50B8] text-white shadow-xs'
                              : 'bg-[#DFD0F2] text-[#633A9D] group-hover:bg-[#7C50B8] group-hover:text-white'
                          }`}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Title & Short Explanation */}
                        <h3 className={`mt-4 text-base sm:text-lg font-bold tracking-tight transition-colors ${
                          isActive ? 'text-[#231538]' : 'text-[#3E3250]'
                        }`}>
                          {step.title}
                        </h3>

                        <p className="mt-1.5 text-xs sm:text-[13px] text-[#5A4F6B] leading-relaxed">
                          {step.shortDesc}
                        </p>
                      </div>

                      {/* Bottom Flow Connector Indicator (Desktop Arrow) */}
                      {idx < architecturePipelineSteps.length - 1 && (
                        <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center border shadow-xs transition-colors ${
                            isPassed || isActive
                              ? 'bg-[#7C50B8] text-white border-[#7C50B8]'
                              : 'bg-[#EFE8F6] text-[#8C7A9E] border-[#D8C7EC]'
                          }`}>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Flow Particle Track */}
              <div className="mt-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#633A9D]">
                  <span className="flex h-2 w-2 rounded-full bg-[#7C50B8] animate-ping" />
                  <span>Processing Workflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <button
                      key={stepIdx}
                      onClick={() => {
                        setActivePipelineStep(stepIdx);
                        setIsAutoPlayingPipeline(false);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activePipelineStep === stepIdx
                          ? 'w-8 bg-[#7C50B8]'
                          : 'w-2 bg-[#D8C7EC] hover:bg-[#B596DA]'
                      }`}
                      aria-label={`Go to stage ${stepIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Supporting Capability Cards (Clean & Simplified in Soft Lavender) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {architecturePillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    className="rounded-2xl border border-[#D8C7EC] bg-[#EFE8F6] p-6 flex flex-col justify-between hover:border-[#B596DA] hover:bg-[#E9DFFA] hover:-translate-y-1 shadow-[0_4px_16px_rgba(109,72,160,0.06)] hover:shadow-[0_12px_28px_rgba(109,72,160,0.12)] transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="h-11 w-11 rounded-xl bg-[#DFD0F2] border border-[#CEBAE6] flex items-center justify-center text-[#633A9D] group-hover:scale-105 transition-transform shadow-2xs">
                          <PillarIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-[#F7F2FD] border border-[#D8C7EC] text-[#633A9D] font-bold">
                          {pillar.badge}
                        </span>
                      </div>

                      <h3 className="mt-4.5 text-base sm:text-lg font-bold text-[#231538] group-hover:text-[#5B2E96] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-[13px] text-[#5A4F6B] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#DFD0F2]/80 space-y-1.5">
                      {pillar.points.map((pt) => (
                        <div key={pt} className="flex items-center gap-2 text-xs text-[#46395B] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#7C50B8] shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Simplified & Compact Core Tech Stack Area */}
            <div className="rounded-2xl border border-[#D8C7EC] bg-[#EFE8F6]/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#633A9D] block">
                  Verified Engine Stack
                </span>
                <span className="text-[11px] text-[#5A4F6B]">
                  Built on modern, type-safe, and high-performance open standards.
                </span>
              </div>

              {/* Compact Badges Strip */}
              <div className="flex flex-wrap items-center gap-2">
                {coreTechStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8C7EC] bg-[#FAF7FD] px-3 py-1 text-xs font-medium text-[#231538] hover:border-[#B596DA] hover:bg-white transition-colors shadow-2xs"
                  >
                    <span className="font-semibold">{tech.name}</span>
                    <span className="text-[10px] text-[#7A6E8C] font-mono">• {tech.role}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REDESIGNED FAQ SECTION (Soft Lavender Light-Theme Style) */}
        <section id="faq" className="relative w-full border-t border-[#E2D4F2] bg-[#F8F5FC] py-18 sm:py-24 lg:py-28 overflow-hidden transition-colors">
          {/* Subtle Soft Lavender Ambient Light */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#8B6FC9]/[0.05] rounded-full blur-3xl" />

          <div className="w-[94%] sm:w-[90%] max-w-[960px] mx-auto px-1 sm:px-4 space-y-10 sm:space-y-12 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto flex flex-col items-center"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7EC] bg-[#EFE8F6] px-3.5 py-1 text-xs font-semibold text-[#633A9D] shadow-xs mb-3.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DFD0F2] text-[#633A9D]">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                  KNOWLEDGE & ANSWERS
                </span>
                <span className="text-[#633A9D]/30">&bull;</span>
                <span className="text-[#231538] font-medium">Clear Explanations</span>
              </div>

              {/* Dark Charcoal / Deep Violet Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#231538] leading-tight">
                Frequently Asked <span className="bg-gradient-to-r from-[#5B2E96] via-[#6E42A6] to-[#8C62C8] bg-clip-text text-transparent">Questions</span>
              </h2>

              {/* Muted Gray-Violet Subtitle */}
              <p className="mt-3 text-sm sm:text-base text-[#5A4F6B] max-w-lg mx-auto leading-relaxed">
                Everything you need to know about models, document intelligence, live search, and privacy.
              </p>

              {/* Category Filter Pills in Soft Lavender */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
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
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#7C50B8] text-white shadow-sm shadow-[#7C50B8]/20 scale-105'
                          : 'bg-[#EFE8F6] text-[#633A9D] border border-[#D8C7EC] hover:bg-[#FAF7FD] hover:border-[#B596DA]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Accordion List in Soft Lavender */}
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
                          ? 'bg-white border-[#7C50B8] shadow-md shadow-[#7C50B8]/8'
                          : 'bg-[#EFE8F6] border-[#D8C7EC] hover:border-[#B596DA] hover:bg-[#FAF7FD]'
                      }`}
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-[15px] text-[#231538] cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-md bg-[#F7F2FD] text-[#633A9D] font-semibold border border-[#D8C7EC] shrink-0">
                            {item.tag}
                          </span>
                          <span className="leading-snug">{item.q}</span>
                        </div>

                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
                            isOpen
                              ? 'bg-[#7C50B8] text-white rotate-180'
                              : 'bg-[#DFD0F2] text-[#633A9D]'
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
                            className="px-4.5 sm:px-5 pb-5 pt-3 text-xs sm:text-[13.5px] text-[#5A4F6B] leading-relaxed border-t border-[#DFD0F2]/70 bg-white"
                          >
                            {item.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
            </div>

            {/* Enhanced "Have More Questions?" Card in Soft Lavender */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F6F0FD] via-[#EFE7F8] to-[#E9DEF5] border border-[#D5C4EC] p-6 sm:p-8 shadow-[0_12px_40px_rgba(124,80,184,0.08)]">
              {/* Subtle ambient gradient orb */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#CEBAEE]/35 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-[#DAC4F8]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                {/* Left info & text */}
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D5C4EC] text-[#633A9D] text-xs font-semibold shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C50B8] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C50B8]"></span>
                    </span>
                    <span>Live 24/7 AI Assistance</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-[#231538] tracking-tight flex items-center gap-2">
                      Still have questions about Nyra?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A4F6B] leading-relaxed">
                      Ask Nyra directly in our interactive workspace. Test RAG knowledge lookup, speed benchmarks, or custom workflows in real-time.
                    </p>
                  </div>

                  {/* Quick suggested question chips */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#7C50B8]">Try asking:</span>
                    {[
                      'How private are my files?',
                      'Can I bring custom API keys?',
                      'What models are supported?',
                    ].map((sample) => (
                      <Link
                        key={sample}
                        href="/chat-ui"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-[#4A3B63] hover:text-[#7C50B8] border border-[#DCD0EE] hover:border-[#B596DA] text-[11px] font-medium transition-all shadow-2xs"
                      >
                        <Sparkles className="h-3 w-3 text-[#7C50B8] shrink-0" />
                        <span>{sample}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-3 shrink-0 lg:border-l lg:border-[#DCD0EE]/80 lg:pl-8">
                  <Link
                    href="/chat-ui"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C50B8] via-[#6F42AB] to-[#5C3294] text-white hover:from-[#6F42AB] hover:to-[#502985] text-sm font-bold shadow-md shadow-[#7C50B8]/25 hover:shadow-lg hover:shadow-[#7C50B8]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
                  >
                    <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Ask Nyra AI Now</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <div className="flex items-center justify-center lg:justify-end gap-3 text-[11px] text-[#6A5E7F]">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-[#7C50B8]" />
                      &lt;100ms response
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-[#7C50B8]" />
                      Free &amp; private
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HERO-CONTINUATION: ASYMMETRIC MIDNIGHT VIOLET CTA & FOOTER               */}
        {/* ========================================================================= */}
        <section className="relative w-full pt-12 sm:pt-20 lg:pt-28 pb-0 overflow-hidden">
          {/* Asymmetric Deep Midnight Violet Flowing Backdrop matching Hero */}
          <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden z-0 select-none">
            <svg
              className="absolute inset-0 w-full h-full object-cover"
              viewBox="0 0 1440 1400"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="midnightVioletHeroGradBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0B0418" />
                  <stop offset="35%" stopColor="#15082E" />
                  <stop offset="70%" stopColor="#200D44" />
                  <stop offset="100%" stopColor="#2B125A" />
                </linearGradient>
                <linearGradient id="subtleVioletAccentBottom" x1="20%" y1="10%" x2="80%" y2="90%">
                  <stop offset="0%" stopColor="#8B6FC9" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#5B3896" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#2D1552" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="violetRimGlowBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#432272" stopOpacity="0" />
                  <stop offset="25%" stopColor="#8B6FC9" stopOpacity="0.6" />
                  <stop offset="65%" stopColor="#C4B5FD" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#432272" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="ctaInternalAmbientGlow" cx="50%" cy="40%" r="45%">
                  <stop offset="0%" stopColor="#8B6FC9" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#200D44" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0B0418" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="footerBrandSpotlight" cx="20%" cy="80%" r="35%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
                  <stop offset="60%" stopColor="#15082E" stopOpacity="0" />
                </radialGradient>

                {/* Strict Clip Path so NO fill or glow can bleed above the wave crest */}
                <clipPath id="ctaWaveClip">
                  <path d="M0 1400 L0 160 C140 100 320 80 500 160 C700 250 880 300 1080 270 C1240 245 1360 165 1440 90 L1440 1400 Z" />
                </clipPath>
              </defs>

              {/* Clipped Group: strictly constrained below the wave line */}
              <g clipPath="url(#ctaWaveClip)">
                {/* Base Asymmetric Midnight Violet Flowing Background */}
                <rect width="1440" height="1400" fill="url(#midnightVioletHeroGradBottom)" />

                {/* Secondary Soft Layer for Depth */}
                <path
                  d="M0 1400 L0 200 C150 140 340 120 520 200 C720 285 900 330 1100 305 C1260 280 1370 200 1440 130 L1440 1400 Z"
                  fill="url(#subtleVioletAccentBottom)"
                />

                {/* Ambient Internal Glows Strictly Within Dark Region */}
                <circle cx="720" cy="500" r="480" fill="url(#ctaInternalAmbientGlow)" />
                <circle cx="280" cy="1000" r="420" fill="url(#footerBrandSpotlight)" />
              </g>

              {/* Glowing Accent Rim along the Organic Asymmetric Curve */}
              <path
                d="M0 160 C140 100 320 80 500 160 C700 250 880 300 1080 270 C1240 245 1360 165 1440 90"
                stroke="url(#violetRimGlowBottom)"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative z-10">
            {/* FINAL CTA SECTION */}
            <div className="w-[92%] sm:w-[88%] max-w-[1000px] mx-auto pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 text-center">
              {/* Eyebrow Pill Badge matching Hero */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-300/25 bg-white/[0.08] px-4 py-1.5 text-xs font-semibold text-purple-200 shadow-sm backdrop-blur-xl hover:border-purple-300/40 transition-colors mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-[11px] text-purple-300">Nyra v2.4</span>
                <span className="text-white/40">•</span>
                <span>Get Started in Seconds</span>
              </div>

              {/* Product Headline */}
              <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] max-w-3xl mx-auto">
                Supercharge your thinking with{' '}
                <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  Nyra AI.
                </span>
              </h2>

              {/* Product Subtitle */}
              <p className="mt-5 text-sm xs:text-base sm:text-lg text-[#D4CBE5] leading-relaxed max-w-2xl mx-auto font-normal">
                Join engineers, researchers, and creators accelerating their workflows with conversational reasoning, private PDF document RAG, and continuous memory.
              </p>

              {/* Action Buttons matching Hero CTA style */}
              <div className="mt-8 flex flex-col xs:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
                <Link
                  href="/chat-ui"
                  className="w-full xs:w-auto group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] px-7 py-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-950/60 hover:shadow-purple-700/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-purple-200" />
                  <span>Launch Free Workspace</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#desktop-workspace"
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] px-6 py-4 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all cursor-pointer shadow-sm hover:border-purple-300/40"
                >
                  <Terminal className="h-4 w-4 text-purple-300" />
                  <span>Interactive Demo</span>
                </a>
              </div>

              {/* Trust & Capability Value Chips */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#E4DCF0]">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Sub-15ms Speed</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  <span>100% In-Browser Privacy</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                  <Globe className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Verified Live Web Data</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-medium text-[11px] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                  <span>No Setup Required</span>
                </span>
              </div>
            </div>

            {/* Glowing Luminous Divider Rule separating CTA and Footer */}
            <div className="w-[92%] sm:w-[88%] max-w-[1300px] mx-auto">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent" />
            </div>

            {/* POLISHED PREMIUM AI PRODUCT FOOTER */}
            <footer className="relative pt-16 pb-12 text-xs text-[#D4CBE5]/80 overflow-hidden">
              <div className="w-[92%] sm:w-[88%] max-w-[1300px] mx-auto space-y-12">
                {/* 12-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                  {/* Brand & Mission Column (5 cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#5B21B6] text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
                        <Sparkles className="h-5 w-5 text-purple-100" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-purple-200 transition-colors">
                          Nyra AI
                        </span>
                        <span className="block text-[11px] font-mono text-purple-300 font-medium">
                          Autonomous Thinking Partner
                        </span>
                      </div>
                    </Link>

                    <p className="text-xs sm:text-[13px] text-[#D4CBE5]/75 leading-relaxed max-w-sm">
                      A unified AI workspace for thinking, building, and creating with streaming intelligence, private document RAG, and continuous memory.
                    </p>

                    {/* Live System Operational Status & 3D Intro Replay */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-emerald-400/25 text-[11px] font-mono text-emerald-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span>All Systems Operational</span>
                      </div>

                      <button
                        onClick={handleReplayIntro}
                        className="inline-flex items-center gap-1.5 text-[11px] text-purple-300 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Replay 3D Intro</span>
                      </button>
                    </div>

                    {/* Social & Contact Links (GitHub, LinkedIn, Mail) */}
                    <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-[#D4CBE5] hover:text-white hover:border-purple-300/40 transition-all cursor-pointer group shadow-xs"
                        aria-label="GitHub Repository"
                      >
                        <Github className="h-3.5 w-3.5 text-purple-300 group-hover:text-white transition-colors" />
                        <span className="text-[11px] font-medium">GitHub</span>
                      </a>

                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-[#D4CBE5] hover:text-white hover:border-purple-300/40 transition-all cursor-pointer group shadow-xs"
                        aria-label="LinkedIn Page"
                      >
                        <Linkedin className="h-3.5 w-3.5 text-cyan-300 group-hover:text-white transition-colors" />
                        <span className="text-[11px] font-medium">LinkedIn</span>
                      </a>

                      <a
                        href="mailto:contact@nyra.ai"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-[#D4CBE5] hover:text-white hover:border-purple-300/40 transition-all cursor-pointer group shadow-xs"
                        aria-label="Contact Email"
                      >
                        <Mail className="h-3.5 w-3.5 text-amber-300 group-hover:text-white transition-colors" />
                        <span className="text-[11px] font-medium">Mail</span>
                      </a>
                    </div>
                  </div>

                  {/* Navigation Columns (7 cols) */}
                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                    {/* Column 1: Workspace */}
                    <div className="space-y-4">
                      <span className="font-bold text-white text-xs uppercase tracking-wider font-mono block">
                        Workspace
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link href="/chat-ui" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Chat Studio
                          </Link>
                        </li>
                        <li>
                          <Link href="/documents" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Documents &amp; RAG
                          </Link>
                        </li>
                        <li>
                          <Link href="/tasks" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Tasks &amp; Planning
                          </Link>
                        </li>
                        <li>
                          <Link href="/memory" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            AI Memory
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Platform & Docs */}
                    <div className="space-y-4">
                      <span className="font-bold text-white text-xs uppercase tracking-wider font-mono block">
                        Platform
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link href="/features" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Core Capabilities
                          </Link>
                        </li>
                        <li>
                          <Link href="/docs" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Documentation
                          </Link>
                        </li>
                        <li>
                          <Link href="/pricing" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            Pricing Plans
                          </Link>
                        </li>
                        <li>
                          <Link href="/about" className="text-[#D4CBE5]/75 hover:text-white transition-colors">
                            About Nyra
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Integrated Quick Access Card */}
                    <div className="space-y-4 col-span-2 sm:col-span-1">
                      <span className="font-bold text-white text-xs uppercase tracking-wider font-mono block">
                        Get Started
                      </span>
                      <div className="p-4 rounded-2xl bg-white/[0.06] border border-purple-300/20 backdrop-blur-md space-y-3 shadow-lg">
                        <span className="text-xs font-bold text-white block">Ready to build?</span>
                        <span className="text-[11px] text-[#D4CBE5]/80 block leading-snug">
                          Instant access with zero setup required.
                        </span>
                        <Link
                          href="/chat-ui"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-purple-950/40 transition-all cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-purple-200" />
                          <span>Launch Nyra Free</span>
                          <ArrowRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Legal, Copyright & Version Bar */}
                <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-[#A69BBF]">
                  <p>© {new Date().getFullYear()} Nyra AI Inc. All rights reserved.</p>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-[#D4CBE5]/80">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                    <span>•</span>
                    <span className="font-mono text-purple-300 font-semibold">v2.4.0</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}