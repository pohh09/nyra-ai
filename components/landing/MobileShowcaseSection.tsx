'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  Bot,
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
  Copy,
  Check,
  Smartphone,
  Layers,
  Cpu,
  Wifi,
  Battery,
  Flame,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Paperclip,
  ShieldCheck,
  ImageIcon,
  Maximize2,
  Server,
  Database,
  ArrowRight,
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
    }, 400);
  };

  const filteredPrompts = activeCategory === 'All'
    ? SIMPLE_PROMPTS
    : SIMPLE_PROMPTS.filter((p) => p.category === activeCategory);

  return (
    <section
      id="mobile-showcase"
      className="relative z-10 w-full bg-transparent py-20 sm:py-28 lg:py-32 overflow-hidden transition-colors"
    >
      {/* Soft Lavender Ambient Backdrop */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="h-[550px] w-[750px] rounded-full bg-[#8B6FC9]/[0.06] blur-[100px] transform -translate-y-10" />
      </div>

      <div className="relative w-[94%] sm:w-[90%] max-w-[1500px] mx-auto px-2 sm:px-4 z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3 relative z-10"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#6B52A3] shadow-[0_2px_10px_rgba(124,92,184,0.07)] hover:border-[#8B6FC9] transition-all mb-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EDE6FA] text-[#7C5CB8]">
              <Smartphone className="h-2.5 w-2.5" />
            </div>
            <span className="font-mono text-[11px] text-[#7C5CB8] font-bold tracking-wider uppercase">
              MOBILE INTELLIGENCE
            </span>
            <span className="text-[#7C5CB8]/30">&bull;</span>
            <span className="text-[#1E162D] font-medium">Pocket AI Companion</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shadow-[0_0_6px_#10B981]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#1E162D] leading-[1.15]">
            Simple, fast, and always with you.
          </h2>

          <p className="text-sm sm:text-base text-[#554D66] leading-relaxed max-w-2xl mx-auto font-normal">
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
                      ? 'bg-[#241C35] text-white shadow-sm'
                      : 'bg-white hover:bg-[#FAF7FE] text-[#554D66] border border-purple-200/80 hover:border-[#8B6FC9]'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-purple-300' : 'text-[#7C5CB8]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 3D Showcase Stage with Elevated Center Device & Generous Spacing */}
        <div className="mt-16 sm:mt-24 lg:mt-32 xl:mt-36 relative">
          
          {/* Subtle Ground Pedestal Shadow */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] max-w-[1000px] h-16 bg-[#8B6FC9]/[0.08] rounded-[100%] blur-xl hidden lg:block" />

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
              {/* Phone Outer Chassis - Clean Titanium Lavender Border */}
              <div className="group relative w-full max-w-[315px] xs:max-w-[330px] rounded-[48px] p-[3px] bg-gradient-to-b from-[#F2ECFB] via-[#DDD0F2] to-[#CBB8E8] shadow-[0_18px_45px_rgba(124,92,184,0.12),0_1px_3px_rgba(0,0,0,0.04)] border border-purple-200/90 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,92,184,0.18)]">
                {/* Inner Screen Surface - Crisp White with Refined Screen Border */}
                <div className="relative w-full rounded-[45px] bg-white p-4 flex flex-col justify-between min-h-[550px] text-[#1E162D] overflow-hidden border border-purple-200/60">
                  
                  {/* Status Bar & Dynamic Capsule */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2">
                    <span className="text-[11px] font-mono font-semibold text-[#554D66]">9:41</span>
                    <div className="h-4.5 w-24 rounded-full bg-[#F4EFFC] flex items-center justify-center gap-1.5 border border-purple-200/80">
                      <span className={`h-1.5 w-1.5 rounded-full ${isVoiceRecording ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-[8.5px] font-mono text-[#6B52A3] font-bold">
                        {isVoiceRecording ? 'Voice Live' : 'Muted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#554D66]">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-2.5 border-b border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-[#F4EFFC] border border-purple-200/80 flex items-center justify-center shadow-2xs">
                        <Volume2 className="h-3.5 w-3.5 text-[#7C5CB8]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E162D]">Voice Mode</h4>
                        <p className="text-[9px] text-[#7C5CB8] font-mono">Whisper Edge &bull; Instant</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      READY
                    </span>
                  </div>

                  {/* Voice Orb & Equalizer Stage */}
                  <div className="flex-1 flex flex-col items-center justify-center py-3 space-y-3.5">
                    {/* Multi-Layer Studio Acoustic Mic Orb */}
                    <div className="relative flex items-center justify-center py-2">
                      {/* Concentric Ambient Audio Ripple Rings */}
                      {isVoiceRecording && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute h-28 w-28 rounded-full border border-purple-300/60 pointer-events-none"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                            className="absolute h-24 w-24 rounded-full border border-purple-400/40 bg-purple-500/[0.04] pointer-events-none"
                          />
                        </>
                      )}

                      {/* Tactile Outer Bezel Rim */}
                      <div className="relative p-1 rounded-full bg-gradient-to-b from-[#F2ECFB] via-[#DDD0F2] to-[#CAB8E8] shadow-[0_10px_25px_rgba(124,92,184,0.25)] border border-purple-200/90">
                        <button
                          onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                            isVoiceRecording
                              ? 'bg-gradient-to-b from-[#8B6FC9] via-[#7C5CB8] to-[#5F3FA0] text-white shadow-[0_8px_20px_rgba(124,92,184,0.35),inset_0_2px_4px_rgba(255,255,255,0.35)] scale-102 hover:scale-105 active:scale-95'
                              : 'bg-white border border-purple-200/90 text-[#7C5CB8] shadow-inner hover:bg-[#FAF8FE]'
                          }`}
                          title={isVoiceRecording ? 'Tap to mute microphone' : 'Tap to activate microphone'}
                        >
                          {/* Inner Concentric Glow Ring */}
                          {isVoiceRecording && (
                            <span className="absolute inset-1.5 rounded-full border border-white/25 pointer-events-none" />
                          )}

                          {isVoiceRecording ? (
                            <div className="flex flex-col items-center justify-center">
                              <Mic className="h-7 w-7 text-white drop-shadow-sm animate-pulse" />
                            </div>
                          ) : (
                            <MicOff className="h-7 w-7 text-[#7C5CB8]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Live Voice Frequency Telemetry Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4EFFC] border border-purple-200/80 text-[9.5px] font-mono font-semibold text-[#6B52A3]">
                      <span className={`h-1.5 w-1.5 rounded-full ${isVoiceRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
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
                          className="w-1.2 rounded-full bg-gradient-to-t from-[#7C5CB8] to-[#A78BFA]"
                        />
                      ))}
                    </div>

                    {/* Clean Light Transcript Bubble */}
                    <div className="w-full p-3 rounded-xl bg-[#FBF9FE] border border-purple-200/80 text-left space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#7C5CB8] font-bold">
                        <span>LIVE TRANSCRIPT</span>
                        <span className="text-emerald-700 font-semibold">12ms Latency</span>
                      </div>
                      <p className="text-[11.5px] font-medium text-[#1E162D] leading-snug">
                        "Explain the difference between Groq LPUs and standard GPUs."
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="pt-2.5 border-t border-purple-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      className="flex-1 py-2 px-3 rounded-lg border border-purple-200/80 bg-[#FBF9FE] hover:bg-[#F4EFFC] text-[11px] font-semibold text-[#6B52A3] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Radio className="h-3 w-3 text-[#7C5CB8]" />
                      <span>{isVoiceRecording ? 'Mute' : 'Speak'}</span>
                    </button>

                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#7C5CB8] to-[#6B4BA8] hover:from-[#6B4BA8] hover:to-[#5B3E96] text-[11px] font-bold text-white shadow-2xs transition-all hover:scale-102 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Open Chat</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-[#1E162D]">Voice Mode</h3>
                <p className="text-xs text-[#554D66]">Hands-free conversational speech with zero latency.</p>
              </div>
            </motion.div>


            {/* =========================================================
                PHONE 2 (CENTER) — IMAGE SHARING & MULTIMODAL VISION (HERO CENTERPIECE)
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
              style={{
                WebkitFontSmoothing: 'antialiased',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
            >
              {/* Center Hero Phone Outer Chassis - High-Fidelity Lavender Rim */}
              <div className="group relative w-full max-w-[350px] xs:max-w-[375px] sm:max-w-[390px] lg:max-w-[415px] rounded-[54px] p-[4px] bg-gradient-to-b from-[#F0E8FA] via-[#D8C6F2] to-[#BFA6E5] shadow-[0_32px_85px_rgba(124,92,184,0.22),0_2px_8px_rgba(0,0,0,0.05)] border-2 border-purple-300/80 transition-all duration-300 hover:shadow-[0_38px_100px_rgba(124,92,184,0.28)]">
                {/* Inner Screen Surface - Crisp High-Contrast White Surface */}
                <div className="relative w-full rounded-[50px] bg-white p-4 sm:p-5 flex flex-col justify-between min-h-[690px] sm:min-h-[730px] lg:min-h-[750px] text-[#1E162D] overflow-hidden border border-purple-200/70">
                  
                  {/* Status Bar & Dynamic Island Pill */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2.5">
                    <span className="text-[11px] font-mono font-semibold text-[#554D66]">9:41</span>
                    <div className="h-5 w-34 rounded-full bg-[#241C35] text-white flex items-center justify-between px-2.5 shadow-xs border border-purple-400/30">
                      <div className="flex items-center gap-1">
                        <Flame className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[8.5px] font-mono font-bold text-emerald-400">Vision 60fps</span>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[#554D66]">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-3 border-b border-purple-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#7C5CB8] to-[#6B4BA8] flex items-center justify-center shadow-2xs border border-purple-300/40">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1E162D]">Nyra Vision Studio</h4>
                        <p className="text-[9.5px] text-emerald-700 font-mono font-medium">● Qwen 2.5 Vision &bull; Active</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="px-3 py-1 rounded-lg bg-[#F4EFFC] hover:bg-[#EDE6FA] text-[10.5px] font-mono font-bold text-[#6B52A3] transition-colors cursor-pointer border border-purple-200/80 shadow-2xs"
                    >
                      Launch
                    </button>
                  </div>

                  {/* Clean Chat Thread: Image Upload & Vision Reasoning */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 px-0.5 py-3.5 text-xs">
                    
                    {/* User Shared Image Message Bubble */}
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#7C5CB8] to-[#6B4BA8] p-3 text-white max-w-[90%] text-[11.5px] shadow-xs leading-relaxed space-y-2 border border-purple-400/30">
                        
                        {/* Image Attachment Card */}
                        <div className="rounded-xl bg-[#1E1438]/90 p-2.5 border border-purple-300/40 text-left space-y-2">
                          <div className="flex items-center justify-between text-[9.5px] font-mono text-purple-200">
                            <span className="flex items-center gap-1.5 font-bold truncate">
                              <ImageIcon className="h-3.5 w-3.5 text-purple-300 shrink-0" />
                              <span className="truncate">architecture_flow.png</span>
                            </span>
                            <span className="text-[8.5px] bg-white/10 px-1.5 py-0.5 rounded text-purple-200">2.4 MB</span>
                          </div>

                          {/* Architecture Diagram Visual Preview */}
                          <div className="rounded-lg bg-[#0F081F] p-2 border border-purple-500/20 text-[9px] font-mono space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] text-purple-300/80">
                              <span>DIAGRAM PREVIEW</span>
                              <span className="text-emerald-400">● 1920x1080</span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 py-1 text-[8.5px] text-slate-200">
                              <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-400/40">App Client</span>
                              <ArrowRight className="h-2.5 w-2.5 text-purple-400" />
                              <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 border border-indigo-400/40">V8 Edge</span>
                              <ArrowRight className="h-2.5 w-2.5 text-purple-400" />
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-400/40">PostgreSQL</span>
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
                      <div className="h-7.5 w-7.5 rounded-xl bg-[#F4EFFC] border border-purple-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="h-4 w-4 text-[#7C5CB8]" />
                      </div>

                      <div className="flex-1 rounded-2xl rounded-tl-xs border border-purple-200/80 bg-[#FBF9FE] p-3 text-[#1E162D] space-y-2.5 shadow-2xs">
                        
                        {/* Inspection Verification Badge */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-[#6B52A3] pb-1.5 border-b border-purple-100">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            99.8% Vision Accuracy
                          </span>
                          <span className="text-[#7C5CB8] font-semibold">Qwen 2.5 Vision</span>
                        </div>

                        <p className="text-[11px] text-[#4A425A] leading-snug">
                          Diagram scanned successfully. Here are the 3 architecture findings:
                        </p>

                        {/* Visual Breakdown Points */}
                        <div className="space-y-1.5">
                          <div className="p-2 rounded-lg bg-white border border-purple-200/70 text-[10.5px] space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-[#1E162D]">
                              <Database className="h-3 w-3 text-[#7C5CB8]" />
                              <span>1. Database Read Replica Pool</span>
                            </div>
                            <p className="text-[10px] text-[#554D66] pl-4.5">
                              Add 2 read replicas to reduce primary PostgreSQL load by 45%.
                            </p>
                          </div>

                          <div className="p-2 rounded-lg bg-white border border-purple-200/70 text-[10.5px] space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-[#1E162D]">
                              <Server className="h-3 w-3 text-[#7C5CB8]" />
                              <span>2. Edge Redis Caching</span>
                            </div>
                            <p className="text-[10px] text-[#554D66] pl-4.5">
                              Place Redis cache layer before V8 edge for sub-5ms repeated queries.
                            </p>
                          </div>
                        </div>

                        {/* Action Pill */}
                        <div className="pt-1 flex items-center gap-1.5">
                          <button
                            onClick={() => router.push('/chat-ui')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F4EFFC] hover:bg-[#EDE6FA] text-[10px] font-semibold text-[#6B52A3] border border-purple-200 transition-colors cursor-pointer"
                          >
                            <span>Generate Terraform Schema</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar with Image Upload Attachment Icon */}
                  <div className="pt-3 pb-1 border-t border-purple-100 flex items-center gap-2 px-0.5">
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[#F4EFFC] border border-purple-200/80 text-[#7C5CB8] hover:bg-[#EDE6FA] transition-colors cursor-pointer"
                      title="Attach Image / Screenshot"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>

                    <div className="flex-1 flex items-center gap-2 rounded-full border border-purple-200/80 bg-[#FAF8FE] px-3 py-2 text-[11.5px] text-[#1E162D] truncate shadow-2xs">
                      <Search className="h-3.5 w-3.5 text-[#7C5CB8] shrink-0" />
                      <span className="text-[#7A728A] truncate">Drop image or ask Nyra vision...</span>
                    </div>

                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CB8] to-[#6B4BA8] hover:from-[#6B4BA8] hover:to-[#5B3E96] text-white cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xs"
                      title="Send"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-[#1E162D]">Vision & Image Sharing</h3>
                <p className="text-xs text-[#554D66]">Upload diagrams, UI mockups, and charts for instant visual reasoning.</p>
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
              {/* Phone Outer Chassis - Clean Titanium Lavender Border */}
              <div className="group relative w-full max-w-[315px] xs:max-w-[330px] rounded-[48px] p-[3px] bg-gradient-to-b from-[#F2ECFB] via-[#DDD0F2] to-[#CBB8E8] shadow-[0_18px_45px_rgba(124,92,184,0.12),0_1px_3px_rgba(0,0,0,0.04)] border border-purple-200/90 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,92,184,0.18)]">
                {/* Inner Screen Surface - Crisp White with Refined Screen Border */}
                <div className="relative w-full rounded-[44px] bg-white p-4 flex flex-col justify-between min-h-[550px] text-[#1E162D] overflow-hidden border border-purple-200/60">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-2 pt-0.5 pb-2">
                    <span className="text-[11px] font-mono font-semibold text-[#554D66]">9:41</span>
                    <div className="h-4.5 w-24 rounded-full bg-[#F4EFFC] flex items-center justify-center border border-purple-200/80">
                      <span className="text-[8.5px] font-mono text-[#6B52A3] flex items-center gap-1 font-bold">
                        <Zap className="h-2.5 w-2.5 fill-[#7C5CB8] text-[#7C5CB8]" />
                        Prompts
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#554D66]">
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 pb-2 border-b border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-[#F4EFFC] border border-purple-200/80 flex items-center justify-center shadow-2xs">
                        <Zap className="h-3.5 w-3.5 text-[#7C5CB8]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E162D]">Prompt Mesh</h4>
                        <p className="text-[9px] text-[#7C5CB8] font-mono">1-Click Launchpad</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#6B52A3] font-semibold">50+ Templates</span>
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
                              ? 'bg-[#241C35] text-white shadow-2xs'
                              : 'bg-[#F4EFFC] text-[#554D66] hover:bg-[#EDE6FA] border border-purple-200/80'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* 4 Prompt Cards in Clean White */}
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
                              ? 'border-emerald-500 bg-emerald-50 scale-[0.98]'
                              : 'border-purple-200/80 bg-[#FBF9FE] hover:border-[#8B6FC9] hover:bg-white shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-[#7C5CB8]" />
                              <span className="text-[11.5px] font-medium text-[#1E162D] group-hover:text-[#6B52A3] transition-colors">
                                {p.title}
                              </span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-[#8A819C] group-hover:text-[#6B52A3] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-purple-100">
                    <button
                      onClick={() => router.push('/chat-ui')}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#7C5CB8] via-[#6B4BA8] to-[#5B3E96] hover:opacity-95 text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-101"
                    >
                      <span>Explore All Prompts</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitle Card */}
              <div className="mt-4 text-center space-y-0.5">
                <h3 className="text-sm font-bold text-[#1E162D]">Prompt Mesh</h3>
                <p className="text-xs text-[#554D66]">Pre-configured multimodal templates for rapid exploration.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
