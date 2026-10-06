'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  FileText,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Search,
  Check,
  Zap,
} from 'lucide-react';

export default function UseCasesShowcaseSection() {
  return (
    <section
      id="use-cases"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full bg-transparent py-20 sm:py-28 lg:py-32 overflow-hidden transition-colors"
    >
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-[700px] h-[350px] bg-[#E52A83]/[0.04] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-[600px] h-[300px] bg-[#B31372]/[0.03] rounded-full blur-[130px]" />

      <div className="w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 relative z-10 space-y-20 sm:space-y-28 lg:space-y-36">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl mb-3.5">
            <Layers className="h-3.5 w-3.5 text-pink-400" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-pink-300">
              USE CASES
            </span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F5F5F7] leading-tight">
            Built for your{' '}
            <span className="bg-gradient-to-r from-white via-pink-100 to-pink-300 bg-clip-text text-transparent">
              workflow.
            </span>
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#A7A7B0] leading-relaxed">
            Practical tools to move from idea to execution without switching tabs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-4"
          >
            <span className="font-mono text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20 uppercase tracking-wider">
              01 &bull; Research &amp; Learn
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Research with live web &amp; PDF context.
            </h3>
            <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed">
              Synthesize live internet sources and query multi-page documents with page-accurate citations.
            </p>
            <div className="pt-2">
              <Link
                href="/documents"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white transition-colors group"
              >
                <span>Analyze documents &amp; research live</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-white/[0.1] bg-[#0A0512]/90 p-5 sm:p-6 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Live Web Grounding + PDF Vector Ingestion
                </span>
                <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-xs font-semibold text-white">Synthesized Insights from 3 Verified Sources:</div>
                <p className="text-xs text-[#A7A7B0] leading-relaxed">
                  Comparing current Next.js 16 server action benchmarks with legacy API route latencies from your uploaded architecture PDF.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-pink-200 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
                    <FileText className="h-3 w-3 text-pink-400" />
                    report.pdf (Page 6)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    nextjs.org/docs/server-actions
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <div className="rounded-2xl border border-white/[0.1] bg-[#07030D]/95 p-5 sm:p-6 shadow-2xl space-y-3 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                <span className="text-pink-300 font-semibold flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  Code Studio & Execution
                </span>
                <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  340 tok/s &bull; Groq LPU
                </span>
              </div>
              <div className="rounded-xl bg-[#040108] p-3.5 text-xs text-[#E5DDF0] leading-relaxed overflow-x-auto border border-white/5">
                <span className="text-purple-400">export function</span> <span className="text-cyan-300">useDataPipeline</span>(config: <span className="text-amber-300">Config</span>) {'{'}
                <br />
                {'  '}const {'{'} stream, status {'}'} = <span className="text-pink-300">useModelOrchestrator</span>(config);
                <br />
                {'  '}return {'{'} stream, isReady: status === <span className="text-emerald-300">&#39;connected&#39;</span> {'}'};
                <br />
                {'}'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                <span>React 19 &bull; TypeScript strict</span>
                <span className="text-pink-300">Instant syntax highlighting & testing</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-4 order-1 lg:order-2 text-left"
          >
            <span className="font-mono text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20 uppercase tracking-wider">
              02 &bull; Build &amp; Create
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Turn ideas into executable code.
            </h3>
            <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed">
              Generate TypeScript, debug components, and export clean solutions with zero configuration.
            </p>
            <div className="pt-2">
              <Link
                href="/chat-ui"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white transition-colors group"
              >
                <span>Open coding workspace</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-4"
          >
            <span className="font-mono text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20 uppercase tracking-wider">
              03 &bull; Organize &amp; Remember
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Keep context across sessions.
            </h3>
            <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed">
              Save tech stack preferences, reusable prompts, and active task checklists.
            </p>
            <div className="pt-2">
              <Link
                href="/memory"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white transition-colors group"
              >
                <span>View workspace memory &amp; tasks</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-white/[0.1] bg-[#0A0512]/90 p-5 sm:p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono text-pink-300">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Persistent Context &amp; Action Board
                </span>
                <span className="text-white/40 text-[10px]">Auto-Synced</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Stack Preference: TypeScript, Tailwind, Supabase
                  </span>
                  <span className="text-[10px] text-emerald-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Task: Implement authentication callback endpoint
                  </span>
                  <span className="text-[10px] text-pink-300">In Progress</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <div className="rounded-2xl border border-white/[0.1] bg-[#0A0512]/90 p-5 sm:p-6 shadow-2xl space-y-3.5 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs text-rose-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  ATS Match &amp; Career Intelligence
                </span>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/25">
                  94% Match Score
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                <div className="text-white font-sans font-semibold">Senior Frontend / AI Engineer Role:</div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    ✓ Next.js 16 Server Actions
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    ✓ LLM Multimodal Orchestration
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    ✦ Tailored Interview Q&amp;A Generated
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-4 order-1 lg:order-2 text-left"
          >
            <span className="font-mono text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20 uppercase tracking-wider">
              04 &bull; Career &amp; Job Search
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Score resumes against job specs.
            </h3>
            <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed">
              Identify missing skills and practice tailored interview questions for your target roles.
            </p>
            <div className="pt-2">
              <Link
                href="/career"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white transition-colors group"
              >
                <span>Analyze resume &amp; job match</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
