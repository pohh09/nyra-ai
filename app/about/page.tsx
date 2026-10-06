'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  MessageSquare,
  Terminal,
  Layers,
  Code2,
  Cpu,
  Boxes,
  CheckCircle2,
  Workflow,
  Lock,
} from 'lucide-react';
import { NyraIcon } from '@/components/brand/NyraIcon';

const PILLARS = [
  {
    icon: Boxes,
    title: 'Zero Context Switching',
    badge: 'Consolidated Canvas',
    description:
      'Instead of juggling 5 different browser tabs for chat, search, PDFs, notes, and tasks, Nyra unites every modality into a continuous, contextual canvas.',
  },
  {
    icon: ShieldCheck,
    title: 'Local In-Browser Privacy',
    badge: '100% Client-Side',
    description:
      'Uploaded PDFs and confidential documents are parsed locally in your browser with PDF.js. Your private files are never stored or trained on by external servers.',
  },
  {
    icon: Zap,
    title: 'Hardware-Accelerated Speed',
    badge: 'Sub-15ms TTFT',
    description:
      'Powered by Groq LPUs and ultra-fast Gemini streaming, responses generate at 300+ tokens/second for instantaneous feedback and coding iteration.',
  },
  {
    icon: Workflow,
    title: 'Designed for Real Execution',
    badge: 'Actionable Output',
    description:
      'Turn discussions and brainstorming directly into executable TypeScript code, structured task boards, and persistent workspace memory.',
  },
];

const MODALITIES = [
  {
    icon: MessageSquare,
    title: 'Multi-Model AI Chat',
    description: 'Converse, reason, and code across top open-weights models and specialized engines.',
    href: '/chat-ui',
    tag: 'Conversation',
  },
  {
    icon: Globe,
    title: 'Real-Time Web Search',
    description: 'Ground AI answers with live internet facts and verified domain citations via Tavily.',
    href: '/chat-ui',
    tag: 'Grounding',
  },
  {
    icon: FileText,
    title: 'Document Intelligence & PDFs',
    description: 'Upload complex multi-page PDFs for page-accurate QA, table parsing, and summaries.',
    href: '/documents',
    tag: 'Documents',
  },
  {
    icon: Sparkles,
    title: 'Prompt Engineering Library',
    description: 'Save, fork, test, and organize reusable system prompts and production templates.',
    href: '/chat-ui',
    tag: 'Prompts',
  },
  {
    icon: Terminal,
    title: 'Tasks & Planning Workspace',
    description: 'Break complex workflows into step-by-step checklist execution items.',
    href: '/tasks',
    tag: 'Actionable',
  },
  {
    icon: Layers,
    title: 'Continuous Workspace Memory',
    description: 'Preserve tech stack preferences and project background across all sessions.',
    href: '/memory',
    tag: 'Memory',
  },
  {
    icon: Code2,
    title: 'Career & ATS Tools',
    description: 'Score resumes against job specs, identify skill gaps, and simulate custom interviews.',
    href: '/career',
    tag: 'Career',
  },
];

const TECH_BADGES = [
  { name: 'Next.js 16', category: 'Framework & App Router' },
  { name: 'React 19', category: 'Modern UI Engine' },
  { name: 'TypeScript', category: 'Strict Type Safety' },
  { name: 'Supabase', category: 'Auth & PostgreSQL Database' },
  { name: 'Groq LPUs', category: 'Sub-Second LLM Inference' },
  { name: 'Google Gemini', category: 'Multimodal Vision & Reasoning' },
  { name: 'OpenAI API', category: 'Advanced Language Models' },
  { name: 'Tavily Search', category: 'Live Real-Time Web Data' },
  { name: 'Tailwind CSS', category: 'Unified Dark Design System' },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-pink-500/30 selection:text-white">
      <div className="pointer-events-none absolute top-[-100px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#E52A83]/[0.06] blur-[160px]" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-[500px] w-[500px] rounded-full bg-[#B31372]/[0.05] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-[600px] w-[600px] rounded-full bg-[#FF4FA3]/[0.04] blur-[180px]" />

      <div className="relative z-10">
        
        <header className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/[0.06] bg-[#0A0512]/80">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white hover:border-pink-500/40 hover:bg-[#16091F] transition-all"
                title="Back to Landing Page"
              >
                <ArrowLeft className="h-4 w-4 text-pink-300" />
              </Link>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-pink-500/30 bg-[#16091F] shadow-sm">
                  <NyraIcon size={18} variant="primary" glow />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-[#F5F5F7] group-hover:text-pink-200 transition-colors">
                    Nyra AI
                  </span>
                  <span className="text-[11px] font-mono text-pink-400/80 uppercase tracking-wider">
                    About
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-[#F5F5F7] hover:bg-white/[0.08] transition-all"
              >
                Login
              </Link>

              <Link
                href="/chat-ui"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#801456] hover:from-[#FF4FA3] hover:to-[#B31372] px-4 sm:px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-pink-950/40 transition-all border border-[#FF4FA3]/30"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </header>

        <section className="px-4 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-[1400px] mx-auto">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/80 px-4 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-pink-300">
                PRODUCT ARCHITECTURE & MISSION
              </span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.08]">
              One AI workspace for{' '}
              <span className="bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent">
                thinking, building, and getting things done.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#A7A7B0] leading-relaxed max-w-3xl">
              Nyra brings AI conversations, web research, documents, prompts, tasks, memory, and career tools into one focused workspace — so you can move from an idea to execution without constantly switching between tools.
            </p>
          </div>

          <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A0512]/60 p-6 sm:p-8 space-y-4">
              <span className="font-mono text-xs font-bold text-rose-400/90 uppercase tracking-wider block">
                The Fragmentation Problem
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Modern AI workflows are scattered across disjointed tools.
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7B0] leading-relaxed">
                Most teams bounce between a generic chatbot tab, a standalone PDF summarizer, a web search engine, a separate notes app, and a task board. Context gets lost at every step, requiring repetitive copy-pasting and manual synchronization.
              </p>
            </div>

            <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-[#160822]/90 to-[#0A0314]/90 p-6 sm:p-8 space-y-4 shadow-xl shadow-pink-950/20">
              <span className="font-mono text-xs font-bold text-pink-300 uppercase tracking-wider block">
                The Nyra Solution
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                A unified canvas where all intelligence modalities share state.
              </h2>
              <p className="text-xs sm:text-sm text-[#D1D1DC] leading-relaxed">
                Nyra connects deep reasoning models with in-browser document parsing, live Tavily web search citations, persistent project memory, and actionable execution checklists — keeping all your intellectual momentum in one continuous loop.
              </p>
            </div>
          </div>

          <div className="mt-20 sm:mt-28 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">
                Architectural Principles
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7B0]">
                Engineered from the ground up for speed, local privacy, and tangible output.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PILLARS.map((pillar) => {
                const IconComp = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/[0.08] bg-[#0A0512]/80 p-6 flex flex-col justify-between hover:border-pink-500/30 hover:bg-[#12071E] transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 group-hover:scale-105 transition-transform">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <span className="text-[10.5px] font-mono text-pink-200 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full">
                          {pillar.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-pink-200 transition-colors">
                        {pillar.title}
                      </h3>

                      <p className="mt-2 text-xs text-[#A7A7B0] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-20 sm:mt-28 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">
                What Nyra Brings Together
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7B0]">
                Seven core capabilities operating seamlessly within one interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MODALITIES.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`group rounded-2xl border border-white/[0.08] bg-[#0A0512]/85 p-6 hover:border-pink-500/35 hover:bg-[#12081C] transition-all flex flex-col justify-between ${
                      idx === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 group-hover:scale-105 transition-transform">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-mono text-pink-200 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-pink-200 transition-colors flex items-center justify-between">
                        <span>{item.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-pink-300 transition-all" />
                      </h3>

                      <p className="mt-2 text-xs sm:text-[13px] text-[#A7A7B0] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-pink-300/70 group-hover:text-pink-300">
                      Open in workspace &rarr;
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-20 sm:mt-28 rounded-3xl border border-white/[0.08] bg-[#0A0512]/60 p-6 sm:p-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <span className="font-mono text-xs font-bold text-pink-400 uppercase tracking-wider block">
                Technical Stack
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Built with modern, open technologies
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7B0]">
                Verified full-stack infrastructure delivering low latency, high concurrency, and strict security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
              {TECH_BADGES.map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex items-center justify-between hover:border-pink-500/30 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white">{tech.name}</span>
                  <span className="text-[10.5px] font-mono text-pink-300/80">{tech.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 sm:mt-28 text-center rounded-3xl border border-pink-500/25 bg-gradient-to-br from-[#180922]/90 via-[#0E0417]/90 to-[#05020A]/95 p-8 sm:p-14 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to experience a focused AI workspace?
            </h2>
            <p className="text-sm sm:text-base text-[#A7A7B0] max-w-xl mx-auto leading-relaxed">
              Start chatting, parsing documents, and building workflows with zero setup required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/chat-ui"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#801456] hover:from-[#FF4FA3] hover:to-[#B31372] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-950/50 transition-all hover:scale-[1.02] border border-[#FF4FA3]/30"
              >
                <span>Launch Free Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white transition-all"
              >
                <span>Back to Homepage</span>
              </Link>
            </div>
          </div>

        </section>

        <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-[#8E8E98] font-mono">
          &copy; 2026 Nyra AI Inc. All rights reserved. &bull;{' '}
          <Link href="/" className="hover:text-pink-300 transition-colors">
            Home
          </Link>{' '}
          &bull;{' '}
          <Link href="/chat-ui" className="hover:text-pink-300 transition-colors">
            Workspace
          </Link>
        </footer>

      </div>
    </main>
  );
}