'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Volume2,
  Mic,
  MicOff,
  Send,
  Zap,
  ChevronRight,
  Code2,
  FileText,
  Globe,
  Radio,
  Smartphone,
  Layers,
  Wifi,
  Battery,
  Flame,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ImageIcon,
  Server,
  Database,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  tag: string;
}

const SIMPLE_PROMPTS: PromptTemplate[] = [
  {
    id: 'p1',
    title: 'Architect React 19 Component',
    category: 'Code',
    icon: Code2,
    tag: 'Next.js',
  },
  {
    id: 'p2',
    title: 'Summarize Multi-Page PDF',
    category: 'Docs',
    icon: FileText,
    tag: 'PDF.js',
  },
  {
    id: 'p3',
    title: 'Live Market & Web Synthesis',
    category: 'Search',
    icon: Globe,
    tag: 'Tavily',
  },
  {
    id: 'p4',
    title: 'Code Security & Token Audit',
    category: 'Security',
    icon: ShieldCheck,
    tag: 'Audit',
  },
];

export default function MobileShowcaseSection() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFocusMode, setActiveFocusMode] = useState<'all' | 'voice' | 'chat' | 'prompts'>('all');
  const [launchedPromptId, setLaunchedPromptId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLaunchPrompt = (template: PromptTemplate) => {
    setLaunchedPromptId(template.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyra_prompt', template.title);
    }
    setTimeout(() => {
      router.push('/chat-ui');
    }, 280);
  };

  const filteredPrompts =
    activeCategory === 'All'
      ? SIMPLE_PROMPTS
      : SIMPLE_PROMPTS.filter((p) => p.category === activeCategory);

  return (
    <section
      id="mobile-showcase"
      className="relative z-10 w-full bg-transparent py-20 sm:py-28 lg:py-32 overflow-hidden transition-colors"
    >
      {/* Dark Ambient Violet Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none">
        <div className="h-[600px] w-[800px] rounded-full bg-[#B31372]/[0.08] blur-[150px] transform -translate-y-10" />
      </div>

      <div className="relative w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3 relative z-10"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl hover:border-pink-300/40 transition-all mb-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
              <Smartphone className="h-2.5 w-2.5" />
            </div>
            <span className="font-mono text-[11px] text-pink-300 font-bold tracking-wider uppercase">
              MOBILE INTELLIGENCE
            </span>
            <span className="text-white/30">&bull;</span>
            <span className="text-white font-medium">Pocket AI Companion</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shadow-[0_0_8px_#34d399]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.15]">
            Simple, fast, and{' '}
            <span className="bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent">
              always with you.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed max-w-2xl mx-auto font-normal">
            Clean voice ideation, instant multimodal image reasoning, and one-tap prompt templates designed for everyday touch workflow.
          </p>

          {/* Clean Focus Mode Filter Tabs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Modes', icon: Layers },
              { id: 'voice', label: 'Voice Mode', icon: Volume2 },
              { id: 'chat', label: 'Image Sharing', icon: ImageIcon },
              { id: 'prompts', label: 'Prompts', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFocusMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFocusMode(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] text-white shadow-md shadow-pink-950/60 border border-pink-400/40'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#A7A7B0] hover:text-white border border-white/10 hover:border-pink-400/30'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-pink-300'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 3D Showcase Stage with Elevated Center Device */}
        <div className="mt-16 sm:mt-24 lg:mt-32 xl:mt-36 relative">
          {/* Subtle Ground Pedestal Shadow */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] max-w-[1000px] h-16 bg-[#B31372]/[0.10] rounded-[100%] blur-2xl hidden lg:block" />

          {/* Device Showcase Grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center justify-center max-w-[1360px] mx-auto"
            style={{
              perspective: isMobile ? 'none' : '2000px',
            }}
          >
            {/* =========================================================
                PHONE 1 (LEFT) — VOICE MODE (Supporting Flank)
            ========================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: isMobile ? 0 : 16, rotateZ: isMobile ? 0 : -3 }}
              whileInView={{
                opacity: activeFocusMode === 'all' || activeFocusMode === 'voice' ? 1 : 0.4,
                y: isMobile ? 0 : 18,
                rotateY: isMobile ? 0 : activeFocusMode === 'voice' ? 0 : 10,
                rotateZ: isMobile ? 0 : activeFocusMode === 'voice' ? 0 : -2,
                scale: activeFocusMode === 'voice' ? 1.02 : isMobile ? 1 : 0.95,
              }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4 flex flex-col items-center order-2 lg:order-1 w-full lg:-mr-5 z-10"
            >
              {/* Phone Outer Chassis - Dark Titanium Border */}
              <div className="group relative w-full max-w-[315px] xs:max-w-[330px] rounded-[48px] p-[3px] bg-gradient-to-b from-[#24103A] via-[#16091F] to-[#08020D] shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-pink-500/25 transition-all duration-300 hover:border-pink-300/50">
                {/* Inner Screen Surface - Deep Dark Obsidian */}
                <div className="relative w-full rounded-[45px] bg-[#0A0410] p-4 flex flex-col justify-between min-h-[550px] text-white overflow-hidden border border-pink-500/15">
                  {/* Status Bar & Dynamic Capsule */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2">
                    <span className="text-[11px] font-mono font-semibold text-pink-300/80">9:41</span>
                    <div className="h-4.5 w-24 rounded-full bg-white/[0.08] flex items-center justify-center gap-1.5 border border-pink-400/25">
                      <span className={`h-1.5 w-1.5 rounded-full ${isVoiceRecording ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-[8.5px] font-mono text-pink-200 font-bold">
                        {isVoiceRecording ? 'Voice Live' : 'Muted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-pink-300/80">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center shadow-2xs">
                        <Volume2 className="h-3.5 w-3.5 text-[#FF4FA3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Voice Mode</h4>
                        <p className="text-[9px] text-pink-300 font-mono">Whisper Edge &bull; Instant</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/25">
                      READY
                    </span>
                  </div>

                  {/* Voice Orb & Equalizer Stage */}
                  <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-3.5">
                    {/* Multi-Layer Studio Acoustic Mic Orb */}
                    <div className="relative flex items-center justify-center py-2">
                      {isVoiceRecording && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute h-28 w-28 rounded-full border border-pink-400/50 pointer-events-none"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                            className="absolute h-24 w-24 rounded-full border border-pink-400/30 bg-pink-500/[0.08] pointer-events-none"
                          />
                        </>
                      )}

                      {/* Tactile Outer Bezel Rim */}
                      <div className="relative p-1 rounded-full bg-gradient-to-b from-[#24103A] via-[#16091F] to-[#08020D] shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-pink-400/30">
                        <button
                          onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                            isVoiceRecording
                              ? 'bg-gradient-to-b from-[#E52A83] via-[#B31372] to-[#800A4C] text-white shadow-[0_8px_25px_rgba(229,42,131,0.5)] scale-102 hover:scale-105 active:scale-95'
                              : 'bg-[#12051A] border border-pink-400/30 text-pink-300 shadow-inner hover:bg-[#1A0724]'
                          }`}
                          title={isVoiceRecording ? 'Tap to mute microphone' : 'Tap to activate microphone'}
                        >
                          {isVoiceRecording && (
                            <span className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />
                          )}

                          {isVoiceRecording ? (
                            <div className="flex flex-col items-center justify-center">
                              <Mic className="h-7 w-7 text-white drop-shadow-sm animate-pulse" />
                            </div>
                          ) : (
                            <MicOff className="h-7 w-7 text-pink-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Live Voice Frequency Telemetry Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-pink-400/25 text-[9.5px] font-mono font-semibold text-pink-200">
                      <span className={`h-1.5 w-1.5 rounded-full ${isVoiceRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{isVoiceRecording ? '48kHz Stereo · Active' : 'Microphone Muted'}</span>
                    </div>

                    {/* Multi-Frequency Equalizer Wave */}
                    <div className="flex items-center justify-center gap-1 h-7 px-4">
                      {[30, 65, 100, 75, 95, 85, 50, 90, 70, 85, 45, 30].map((h, idx) => (
                        <motion.div
                          key={idx}
                          animate={{
                            height: isVoiceRecording ? [`${h * 0.25}%`, `${h}%`, `${h * 0.2}%`] : '15%',
                            opacity: isVoiceRecording ? [0.65, 1, 0.65] : 0.25,
                          }}
                          transition={{
                            duration: 0.55 + (idx % 4) * 0.12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-1.2 rounded-full bg-gradient-to-t from-[#B31372] to-[#FF85C0]"
                        />
                      ))}
                    </div>

                    {/* Dark Transcript Bubble */}
                    <div className="w-full p-3 rounded-xl bg-[#12051A] border border-pink-400/20 text-left space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-[9px] font-mono text-pink-300 font-bold">
                        <span>LIVE TRANSCRIPT</span>
                        <span className="text-emerald-400 font-semibold">12ms Latency</span>
                      </div>
                      <p className="text-[11.5px] font-medium text-white leading-snug">
                        "Explain the difference between Groq LPUs and standard GPUs."
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      className="flex-1 py-2 px-3 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-pink-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Radio className="h-3 w-3 text-pink-300" />
                      <span>{isVoiceRecording ? 'Mute' : 'Speak'}</span>
                    </button>

                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:from-[#FF4FA3] hover:to-[#E52A83] text-[11px] font-bold text-white shadow-md shadow-pink-950/50 transition-all hover:scale-102 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Open Chat</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-white">Voice Mode</h3>
                <p className="text-xs text-[#A7A7B0]">Hands-free conversational speech with zero latency.</p>
              </div>
            </motion.div>

            {/* =========================================================
                PHONE 2 (CENTER) — IMAGE SHARING & MULTIMODAL VISION
            ========================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{
                opacity: activeFocusMode === 'all' || activeFocusMode === 'chat' ? 1 : 0.4,
                y: isMobile ? 0 : 0,
                scale: activeFocusMode === 'chat' ? (isMobile ? 1.02 : 1.08) : isMobile ? 1 : 1.04,
              }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4 flex flex-col items-center order-1 lg:order-2 z-30 w-full"
            >
              {/* Center Hero Phone Outer Chassis */}
              <div className="group relative w-full max-w-[315px] xs:max-w-[350px] sm:max-w-[390px] lg:max-w-[415px] rounded-[46px] xs:rounded-[50px] sm:rounded-[54px] p-[3px] sm:p-[4px] bg-gradient-to-b from-[#2E1242] via-[#1A092A] to-[#0A0212] shadow-[0_32px_85px_rgba(0,0,0,0.85)] border-2 border-pink-500/35 transition-all duration-300 hover:border-pink-300/60">
                {/* Inner Screen Surface */}
                <div className="relative w-full rounded-[42px] xs:rounded-[46px] sm:rounded-[50px] bg-[#050208] p-3.5 sm:p-5 flex flex-col justify-between min-h-[580px] xs:min-h-[640px] sm:min-h-[730px] lg:min-h-[750px] text-white overflow-hidden border border-pink-500/20">
                  {/* Status Bar & Dynamic Island Pill */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2.5">
                    <span className="text-[11px] font-mono font-semibold text-pink-300/80">9:41</span>
                    <div className="h-5 w-30 xs:w-34 rounded-full bg-black/80 text-white flex items-center justify-between px-2.5 shadow-xs border border-pink-400/30">
                      <div className="flex items-center gap-1">
                        <Flame className="h-2.5 w-2.5 text-[#FF4FA3] fill-[#FF4FA3]" />
                        <span className="text-[8.5px] font-mono font-bold text-emerald-400">Vision 60fps</span>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5 text-pink-300/80">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#E52A83] to-[#B31372] flex items-center justify-center shadow-2xs border border-pink-300/40">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">Nyra Vision Studio</h4>
                        <p className="text-[9.5px] text-emerald-400 font-mono font-medium">● Qwen 2.5 Vision &bull; Active</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-[10px] sm:text-[10.5px] font-mono font-bold text-pink-200 transition-colors cursor-pointer border border-pink-400/30 shadow-2xs"
                    >
                      Launch
                    </button>
                  </div>

                  {/* Chat Thread: Image Upload & Vision Reasoning */}
                  <div className="flex-1 overflow-y-auto space-y-3 px-0.5 py-2.5 sm:py-3.5 text-xs">
                    {/* User Shared Image Message Bubble */}
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#B31372] to-[#800A4C] p-2.5 sm:p-3 text-white max-w-[92%] sm:max-w-[90%] text-[11px] sm:text-[11.5px] shadow-xs leading-relaxed space-y-2 border border-pink-400/30">
                        {/* Image Attachment Card */}
                        <div className="rounded-xl bg-[#0F0418] p-2 sm:p-2.5 border border-pink-300/30 text-left space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] font-mono text-pink-200">
                            <span className="flex items-center gap-1.5 font-bold truncate">
                              <ImageIcon className="h-3.5 w-3.5 text-[#FF4FA3] shrink-0" />
                              <span className="truncate">architecture_flow.png</span>
                            </span>
                            <span className="text-[8px] sm:text-[8.5px] bg-white/10 px-1.5 py-0.5 rounded text-pink-200 shrink-0">2.4 MB</span>
                          </div>

                          {/* Architecture Diagram Visual Preview */}
                          <div className="rounded-lg bg-[#050109] p-2 border border-pink-500/20 text-[9px] font-mono space-y-1.5 overflow-hidden">
                            <div className="flex items-center justify-between text-[8px] text-pink-300/80">
                              <span>DIAGRAM PREVIEW</span>
                              <span className="text-emerald-400">● 1920x1080</span>
                            </div>
                            <div className="flex flex-wrap xs:flex-nowrap items-center justify-center gap-1 xs:gap-1.5 py-1 text-[8px] xs:text-[8.5px] text-slate-200">
                              <span className="px-1.5 py-0.5 rounded bg-pink-950/80 border border-pink-400/40 shrink-0">App Client</span>
                              <ArrowRight className="h-2.5 w-2.5 text-pink-400 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-400/40 shrink-0">V8 Edge</span>
                              <ArrowRight className="h-2.5 w-2.5 text-pink-400 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/40 shrink-0">PostgreSQL</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] font-normal leading-snug">
                          Analyze this architecture diagram and optimize database bottlenecks.
                        </p>
                      </div>
                    </div>

                    {/* AI Vision Analysis Response */}
                    <div className="flex items-start gap-2.5">
                      <div className="h-7.5 w-7.5 rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="h-4 w-4 text-[#FF4FA3]" />
                      </div>

                      <div className="flex-1 rounded-2xl rounded-tl-xs border border-pink-400/25 bg-[#0D0416] p-3 text-pink-100 space-y-2.5 shadow-2xs">
                        {/* Inspection Verification Badge */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-pink-300 pb-1.5 border-b border-white/10">
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            99.8% Vision Accuracy
                          </span>
                          <span className="text-pink-300 font-semibold">Qwen 2.5 Vision</span>
                        </div>

                        <p className="text-[11px] text-[#A7A7B0] leading-snug">
                          Diagram scanned successfully. Here are the 3 architecture findings:
                        </p>

                        {/* Visual Breakdown Points */}
                        <div className="space-y-1.5">
                          <div className="p-2 rounded-lg bg-[#160722] border border-pink-400/20 text-[10.5px] space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                              <Database className="h-3 w-3 text-[#FF4FA3]" />
                              <span>1. Database Read Replica Pool</span>
                            </div>
                            <p className="text-[10px] text-[#A7A7B0] pl-4.5">
                              Add 2 read replicas to reduce primary PostgreSQL load by 45%.
                            </p>
                          </div>

                          <div className="p-2 rounded-lg bg-[#160722] border border-pink-400/20 text-[10.5px] space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                              <Server className="h-3 w-3 text-[#FF4FA3]" />
                              <span>2. Edge Redis Caching</span>
                            </div>
                            <p className="text-[10px] text-[#A7A7B0] pl-4.5">
                              Place Redis cache layer before V8 edge for sub-5ms repeated queries.
                            </p>
                          </div>
                        </div>

                        {/* Action Pill */}
                        <div className="pt-1 flex items-center gap-1.5">
                          <button
                            onClick={() => router.push('/chat-ui')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-[10px] font-semibold text-pink-200 border border-pink-400/30 transition-colors cursor-pointer"
                          >
                            <span>Generate Terraform Schema</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="pt-3 pb-1 border-t border-white/10 flex items-center gap-2 px-0.5">
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] border border-pink-400/30 text-pink-200 hover:bg-white/[0.15] transition-colors cursor-pointer"
                      title="Attach Image / Screenshot"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>

                    <div className="flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-[#0E0416] px-3 py-2 text-[11.5px] text-white truncate shadow-2xs">
                      <Search className="h-3.5 w-3.5 text-pink-300 shrink-0" />
                      <span className="text-pink-300/50 truncate">Drop image or ask Nyra vision...</span>
                    </div>

                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:from-[#FF4FA3] hover:to-[#E52A83] text-white cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md shadow-pink-950/50"
                      title="Send"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-white">Vision & Image Sharing</h3>
                <p className="text-xs text-[#A7A7B0]">Upload diagrams, UI mockups, and charts for instant visual reasoning.</p>
              </div>
            </motion.div>

            {/* =========================================================
                PHONE 3 (RIGHT) — PROMPT MESH (Supporting Flank)
            ========================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: isMobile ? 0 : -16, rotateZ: isMobile ? 0 : 3 }}
              whileInView={{
                opacity: activeFocusMode === 'all' || activeFocusMode === 'prompts' ? 1 : 0.4,
                y: isMobile ? 0 : 18,
                rotateY: isMobile ? 0 : activeFocusMode === 'prompts' ? 0 : -10,
                rotateZ: isMobile ? 0 : activeFocusMode === 'prompts' ? 0 : 2,
                scale: activeFocusMode === 'prompts' ? 1.02 : isMobile ? 1 : 0.95,
              }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="lg:col-span-4 flex flex-col items-center order-3 w-full lg:-ml-5 z-10"
            >
              {/* Phone Outer Chassis - Dark Titanium Border */}
              <div className="group relative w-full max-w-[315px] xs:max-w-[330px] rounded-[48px] p-[3px] bg-gradient-to-b from-[#24103A] via-[#16091F] to-[#08020D] shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-pink-500/25 transition-all duration-300 hover:border-pink-300/50">
                {/* Inner Screen Surface */}
                <div className="relative w-full rounded-[44px] bg-[#0A0410] p-4 flex flex-col justify-between min-h-[550px] text-white overflow-hidden border border-pink-500/15">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2">
                    <span className="text-[11px] font-mono font-semibold text-pink-300/80">9:41</span>
                    <div className="h-4.5 w-24 rounded-full bg-white/[0.08] flex items-center justify-center border border-pink-400/25">
                      <span className="text-[8.5px] font-mono text-pink-200 flex items-center gap-1 font-bold">
                        <Zap className="h-2.5 w-2.5 fill-pink-300 text-pink-300" />
                        Prompts
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-pink-300/80">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center shadow-2xs">
                        <Zap className="h-3.5 w-3.5 text-[#FF4FA3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Prompt Mesh</h4>
                        <p className="text-[9px] text-pink-300 font-mono">1-Click Launchpad</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-pink-300 font-semibold">50+ Templates</span>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 pt-2 pb-1 overflow-x-auto scrollbar-none">
                    {['All', 'Code', 'Docs', 'Search'].map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] text-white shadow-xs'
                              : 'bg-white/[0.06] text-[#A7A7B0] hover:bg-white/[0.12] hover:text-white border border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* 4 Prompt Cards in Dark Theme */}
                  <div className="flex-1 overflow-y-auto space-y-2 py-1.5 px-0.5">
                    {filteredPrompts.map((p) => {
                      const Icon = p.icon;
                      const isLaunching = launchedPromptId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleLaunchPrompt(p)}
                          className={`group p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isLaunching
                              ? 'border-emerald-400 bg-emerald-500/20 scale-[0.98]'
                              : 'border-white/10 bg-[#12051A] hover:border-pink-400/40 hover:bg-[#1A0724] shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-[#FF4FA3]" />
                              <span className="text-[11.5px] font-medium text-white group-hover:text-pink-200 transition-colors">
                                {p.title}
                              </span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-pink-300/60 group-hover:text-pink-200 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#960E5B] hover:opacity-95 text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-pink-950/50 transition-all hover:scale-101"
                    >
                      <span>Explore All Prompts</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-white">Prompt Mesh</h3>
                <p className="text-xs text-[#A7A7B0]">Pre-configured multimodal templates for rapid exploration.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
