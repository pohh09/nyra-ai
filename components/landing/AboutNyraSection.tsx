'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Globe,
  FileText,
  Layers,
  Terminal,
  CheckCircle2,
  Code2,
} from 'lucide-react';

export default function AboutNyraSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full bg-transparent py-20 sm:py-28 lg:py-32 overflow-hidden transition-colors"
    >
      <span id="features" className="scroll-mt-28 absolute top-0" />

      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[350px] bg-[#E52A83]/[0.05] rounded-full blur-[140px]" />

      <div className="w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-pink-300">
                ABOUT NYRA
              </span>
            </div>

            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
              One AI workspace for{' '}
              <span className="bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent">
                thinking, building, and getting things done.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#A7A7B0] leading-relaxed">
              Nyra brings AI conversations, web research, documents, prompts, tasks, memory, and career tools into one focused workspace — so you can move from an idea to execution without constantly switching between tools.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-[#D1D1DB] font-medium">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
                <span>Multi-Model AI Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Live Web Grounding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                <span>Private PDF Parsing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Actionable Workspaces</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/chat-ui"
                className="inline-flex items-center gap-2 text-sm font-bold text-pink-300 hover:text-white transition-colors group cursor-pointer"
              >
                <span>Explore the Nyra Workspace</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-3xl border border-white/[0.12] bg-[#0A0512]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#0E0518]/90">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80 border border-rose-400/40" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
                  </div>
                  <div className="h-3.5 w-px bg-white/10 mx-1" />
                  <span className="text-xs font-mono font-semibold text-white/90">nyra.ai/workspace</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 px-2.5 py-0.5 text-[11px] font-mono text-pink-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
                    Gemini 2.5 & Groq LPU
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7 space-y-4">
                
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Globe className="h-3 w-3" />
                    Tavily Web: 3 Sources
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    <FileText className="h-3 w-3" />
                    architecture-v2.pdf (Page 4)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    <Layers className="h-3 w-3" />
                    Memory: Next.js 16 + TypeScript
                  </span>
                </div>

                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-xs bg-pink-500/20 border border-pink-500/30 px-4 py-2.5 max-w-[90%] text-xs sm:text-sm text-white leading-relaxed">
                    Refactor the event pipeline with typed Next.js 16 server actions, cross-reference our system PDF, and generate implementation tasks.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E52A83] to-[#B31372] text-white shadow-md shadow-pink-950/50 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-xs bg-white/[0.03] border border-white/[0.08] p-4 text-xs sm:text-[13.5px] text-[#D7D7DF] space-y-3 leading-relaxed">
                    <p>
                      Synthesized requirements from <strong className="text-white">architecture-v2.pdf (§ 4.2)</strong> and validated with live Next.js 16 specifications:
                    </p>

                    <div className="rounded-xl border border-white/[0.08] bg-[#05020A] p-3.5 font-mono text-[11px] sm:text-xs text-pink-200/90 overflow-x-auto">
                      <div className="text-white/40 pb-1.5 mb-2 border-b border-white/5 text-[10px] flex items-center justify-between">
                        <span>app/actions/pipeline.ts</span>
                        <span className="text-emerald-400">TypeScript • 0 errors</span>
                      </div>
                      <code>
                        <span className="text-purple-400">&#39;use server&#39;;</span>
                        <br />
                        <span className="text-purple-400">export async function</span> <span className="text-cyan-300">dispatchWorkspaceEvent</span>(payload: <span className="text-amber-300">PipelineEvent</span>) {'{'}
                        <br />
                        {'  '}const verified = await <span className="text-pink-300">validateDocumentContext</span>(payload.docId);
                        <br />
                        {'  '}return <span className="text-blue-300">executeTaskGraph</span>({'{'} ...payload, verified {'}'});
                        <br />
                        {'}'}
                      </code>
                    </div>

                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/90 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>[✓] Context synced with persistent project memory</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90 font-mono">
                        <Terminal className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                        <span>[→] 3 execution tasks added to active workspace</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-5 py-2.5 border-t border-white/[0.06] bg-[#07020E] flex items-center justify-between text-[11px] font-mono text-[#8E8E98]">
                <span>Status: Connected to Real-Time Graph</span>
                <span className="text-emerald-400">● 100% In-Browser Privacy</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
