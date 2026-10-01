'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Globe,
  Cpu,
  Workflow,
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  FileCode,
  FileText,
  Search,
  Database,
  Brain,
  Zap,
  Check,
  Copy,
  Layers,
  ShieldCheck,
  ChevronRight,
  Bot
} from 'lucide-react';

interface WorkflowScenario {
  id: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  steps: {
    title: string;
    subtitle: string;
    badge: string;
    summary: string;
    metrics: string;
    details: React.ReactNode;
  }[];
}

export default function HowNyraWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const SCENARIOS: WorkflowScenario[] = [
    {
      id: 'fullstack',
      name: 'Full-Stack Engineering',
      tagline: 'Edge caching & resilient Next.js microservice',
      icon: FileCode,
      steps: [
        {
          title: 'INGEST',
          subtitle: 'Multi-Modal Prompt & Workspace Context',
          badge: 'Input Phase',
          summary: 'Analyzes user request, repository schema, and active files in real-time.',
          metrics: 'Prompt: 142 tokens • 2 context files',
          details: (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#8E8E98] pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-pink-300">
                  <Terminal className="h-3.5 w-3.5" /> user_query.sh
                </span>
                <span className="text-[11px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">
                  Intent: Backend Optimization
                </span>
              </div>
              <p className="text-white/90 font-sans text-sm leading-relaxed">
                &quot;Implement an Edge API route with Redis distributed rate-limiting and SWR caching for 50k req/min traffic spikes.&quot;
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded text-[#C5C5CE]">
                  <FileCode className="h-3 w-3 text-cyan-400" /> schema.prisma (3.4 KB)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded text-[#C5C5CE]">
                  <FileCode className="h-3 w-3 text-pink-400" /> upstash-redis.ts (1.2 KB)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Workspace Indexed
                </span>
              </div>
            </div>
          ),
        },
        {
          title: 'GROUND',
          subtitle: 'Vector Retrieval & Live Docs Query',
          badge: 'Context Phase',
          summary: 'Scans official Upstash docs and project embeddings in 34ms.',
          metrics: 'Latency: 34ms • Similarity: 0.941',
          details: (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-pink-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1"><Search className="h-3 w-3" /> Live Docs Crawl</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                  <p className="text-[#A7A7B0] text-[11px] truncate">@upstash/ratelimit v2.0.5 API specs</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Vector RAG Store</span>
                    <span className="text-pink-400">cosine: 0.941</span>
                  </div>
                  <p className="text-[#A7A7B0] text-[11px] truncate">lib/auth/sessionCache.ts:L18-42</p>
                </div>
              </div>
              <div className="p-2 rounded bg-pink-500/[0.04] border border-pink-500/20 text-[#D8D8E0] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Brain className="h-3.5 w-3.5 text-pink-400" /> Recalled User Memory:
                </span>
                <span className="text-[11px] font-sans text-pink-200">Prefers TypeScript strict mode &amp; Zod v3</span>
              </div>
            </div>
          ),
        },
        {
          title: 'REASON',
          subtitle: 'Multi-Model Inference & Chain-of-Thought',
          badge: 'Cognition Phase',
          summary: 'Evaluates race conditions, token-bucket limits, and memory leak vectors.',
          metrics: 'Model: Groq LLaMA 3.3 70B • 220 tok/sec',
          details: (
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E98] pb-1 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Zap className="h-3.5 w-3.5" /> Reasoning Trace (Chain-of-Thought)
                </span>
                <span className="text-emerald-400 font-sans text-[11px] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Streaming 220 t/s
                </span>
              </div>
              <div className="space-y-1.5 text-[#A7A7B0] font-sans text-[12.5px]">
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-mono text-xs">1.</span>
                  <span>Formulating sliding-window token bucket algorithm via Redis pipelining to avoid connection bottlenecks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-mono text-xs">2.</span>
                  <span>Configuring Next.js Edge Runtime with `stale-while-revalidate` HTTP headers for sub-10ms global edge reads.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-mono text-xs">3.</span>
                  <span>Validating failure mode fallback: allow read grace period if Redis cluster encounters timeout.</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'EXECUTE',
          subtitle: 'Verified Code & Interactive Actions',
          badge: 'Output Phase',
          summary: 'Outputs hardened production code, automated test suite, and one-click actions.',
          metrics: '0 Syntax Errors • 100% Type-Safe',
          details: (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-[11.5px] text-[#E0E0E6] overflow-x-auto relative">
                <span className="text-pink-400">export const</span> runtime = <span className="text-emerald-300">&apos;edge&apos;</span>;{'\n'}
                <span className="text-pink-400">export async function</span> <span className="text-cyan-300">GET</span>(req: Request) {'{\n'}
                {'  '}const {'{'} success, reset {'}'} = <span className="text-pink-400">await</span> ratelimit.<span className="text-cyan-300">limit</span>(ip);{'\n'}
                {'  '}<span className="text-pink-400">if</span> (!success) <span className="text-pink-400">return</span> Response.json({'{'} error: <span className="text-emerald-300">&apos;Rate limit exceeded&apos;</span> {'}'}, {'{'} status: <span className="text-amber-300">429</span> {'}'});{'\n'}
                {'  '}<span className="text-pink-400">return</span> Response.json(data, {'{'} headers: {'{'} <span className="text-emerald-300">&apos;Cache-Control&apos;</span>: <span className="text-emerald-300">&apos;s-maxage=60, stale-while-revalidate=300&apos;</span> {'}'} {'}'});{'\n'}
                {'}'}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Typecheck passed</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8E8E98]">
                  <Workflow className="h-3.5 w-3.5 text-pink-400" />
                  <span>Interactive artifacts ready</span>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'document',
      name: 'Document Intelligence',
      tagline: '48-page quarterly financial report deep audit',
      icon: FileText,
      steps: [
        {
          title: 'INGEST',
          subtitle: 'PDF Parsing & OCR Multimodal Ingestion',
          badge: 'Input Phase',
          summary: 'Splits complex balance sheets, vectorizes tabular data, and parses footnotes.',
          metrics: 'File: Q3_Financials.pdf • 48 Pages',
          details: (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#8E8E98] pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-pink-300">
                  <FileText className="h-3.5 w-3.5" /> Q3_Financial_Statement.pdf
                </span>
                <span className="text-[11px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">
                  48 Pages • 2.4 MB
                </span>
              </div>
              <p className="text-white/90 font-sans text-sm leading-relaxed">
                &quot;Extract Net EBITDA margins, calculate Year-over-Year operating expense deltas, and cross-reference Section 4 risk disclosures.&quot;
              </p>
              <div className="flex items-center gap-2 text-xs text-[#8E8E98]">
                <span className="px-2 py-0.5 bg-white/[0.04] border border-white/10 rounded text-cyan-300">12 Tables Isolated</span>
                <span className="px-2 py-0.5 bg-white/[0.04] border border-white/10 rounded text-pink-300">High-Res OCR Enabled</span>
              </div>
            </div>
          ),
        },
        {
          title: 'GROUND',
          subtitle: 'Hybrid Semantic & Tabular Chunking',
          badge: 'Context Phase',
          summary: 'Correlates page 14 EBITDA with page 38 restatement footnotes.',
          metrics: 'Chunks: 64 • High-Density RAG',
          details: (
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <span className="text-cyan-300 text-[11px]">Chunk #14: Consolidated Income Statement</span>
                <span className="text-emerald-400 text-[11px]">Match: 98.7%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <span className="text-pink-300 text-[11px]">Chunk #38: Note 11 - Capitalized R&amp;D Amortization</span>
                <span className="text-emerald-400 text-[11px]">Match: 94.2%</span>
              </div>
              <p className="text-[11.5px] font-sans text-[#A7A7B0]">
                Extracted tabular rows verified against original bounding boxes. No hallucinations or estimated approximations.
              </p>
            </div>
          ),
        },
        {
          title: 'REASON',
          subtitle: 'Mathematical Verification & Cross-Auditing',
          badge: 'Cognition Phase',
          summary: 'Calculates true free cash flow margin accounting for stock-based compensation.',
          metrics: 'Model: Google Gemini 2.5 Pro • Reasoning',
          details: (
            <div className="space-y-2 text-xs font-sans text-[#C5C5CE]">
              <div className="flex items-center gap-2 text-pink-300 font-mono text-[11px] pb-1 border-b border-white/[0.06]">
                <Brain className="h-3.5 w-3.5" /> Deterministic Audit Trace
              </div>
              <div className="space-y-1.5 text-[12.5px] leading-relaxed">
                <p>• Q3 2025 Revenue: $148.2M (+22.4% YoY)</p>
                <p>• Adjusted Operating Margin: 26.8% (normalized for $8.4M one-off datacenter expansion)</p>
                <p>• Identified disclosure discrepancy between preliminary letter (p. 2) and legal appendix (p. 42).</p>
              </div>
            </div>
          ),
        },
        {
          title: 'EXECUTE',
          subtitle: 'Executive Brief & Markdown Financial Matrix',
          badge: 'Output Phase',
          summary: 'Generates clean markdown comparison table with exact page citation links.',
          metrics: 'Exact Page Anchors • Export Ready',
          details: (
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[#8E8E98]">EBITDA Margin</div>
                  <div className="text-base font-bold text-white mt-1">26.8%</div>
                  <div className="text-emerald-400 text-[10px]">+320 bps YoY</div>
                </div>
                <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[#8E8E98]">Free Cash Flow</div>
                  <div className="text-base font-bold text-white mt-1">$41.2M</div>
                  <div className="text-cyan-400 text-[10px]">Rule of 40: 49.2</div>
                </div>
                <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[#8E8E98]">Citations</div>
                  <div className="text-base font-bold text-pink-400 mt-1">14 Verified</div>
                  <div className="text-white/60 text-[10px]">Pages 4, 14, 38</div>
                </div>
              </div>
              <p className="text-[11.5px] text-[#8E8E98] text-center">
                Full executive memo formatted with downloadable CSV export.
              </p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'agentic',
      name: 'Autonomous Agentic Task',
      tagline: 'Multi-step competitive intelligence & live synthesis',
      icon: Workflow,
      steps: [
        {
          title: 'INGEST',
          subtitle: 'High-Level Goal & Constraints Definition',
          badge: 'Input Phase',
          summary: 'Breaks complex multi-part objective into an autonomous dependency DAG.',
          metrics: 'Goal: Market Intelligence • Depth: Deep',
          details: (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#8E8E98] pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-pink-300">
                  <Bot className="h-3.5 w-3.5" /> agent_directive.yaml
                </span>
                <span className="text-[11px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">
                  Mode: Autonomous Sub-Tasks
                </span>
              </div>
              <p className="text-white/90 font-sans text-sm leading-relaxed">
                &quot;Compare pricing tier changes across top 5 AI coding assistants over the last 90 days and output an actionable strategic summary.&quot;
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Autonomous Web Navigation
                </span>
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                  Recursive Synthesis
                </span>
              </div>
            </div>
          ),
        },
        {
          title: 'GROUND',
          subtitle: 'Multi-Query Concurrent Web Ingestion',
          badge: 'Context Phase',
          summary: 'Fires 8 parallel search queries, crawls changelogs, and filters marketing noise.',
          metrics: '8 Queries • 24 Pages Scraped',
          details: (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#8E8E98] text-[11px]">
                <span>Parallel Search Crawlers</span>
                <span className="text-emerald-400">All 8 Resolved (0.6s)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-1.5 bg-white/[0.02] border border-white/[0.06] rounded flex items-center justify-between text-[#C5C5CE]">
                  <span className="truncate">GET https://cursor.com/pricing (Wayback delta)</span>
                  <span className="text-pink-400">Found diff</span>
                </div>
                <div className="p-1.5 bg-white/[0.02] border border-white/[0.06] rounded flex items-center justify-between text-[#C5C5CE]">
                  <span className="truncate">GET https://github.com/copilot/changelog</span>
                  <span className="text-cyan-400">Found diff</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'REASON',
          subtitle: 'Cross-Source Triangulation & Noise Filtering',
          badge: 'Cognition Phase',
          summary: 'Synthesizes conflicting community reports with verified official documentation.',
          metrics: 'Model: LLaMA 3.3 70B & Gemini 2.5',
          details: (
            <div className="space-y-2 font-sans text-xs text-[#C5C5CE]">
              <div className="text-[11px] font-mono text-cyan-300 pb-1 border-b border-white/[0.06]">
                Deduplication &amp; Sentiment Calibration
              </div>
              <p className="text-[12px] leading-relaxed">
                Filtered 14 Reddit speculative threads. Reconciled pricing differences based on monthly vs. annual commitments and enterprise token overage rate brackets.
              </p>
            </div>
          ),
        },
        {
          title: 'EXECUTE',
          subtitle: 'Interactive Matrix & Actionable Roadmap',
          badge: 'Output Phase',
          summary: 'Delivers comparative pricing matrix, positioning strategy, and slide deck outline.',
          metrics: '5 Competitors Analyzed • 100% Sourced',
          details: (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-pink-500/[0.06] border border-pink-500/20 text-[#E0E0E6]">
                <div className="font-semibold text-pink-300 text-xs mb-1">Key Strategic Insight:</div>
                <p className="text-[11.5px] text-[#C5C5CE] leading-relaxed">
                  Competitors are unbundling slow frontier models into separate token metering. Nyra&apos;s unified multi-model routing offers a 42% cost efficiency advantage.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E98] pt-1">
                <span>Exported to Markdown &amp; JSON</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready to Share
                </span>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const currentScenario = SCENARIOS[selectedScenarioIdx];
  const currentStepData = currentScenario.steps[activeStep];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    autoPlayRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPlaying, activeStep]);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STEP_METADATA = [
    {
      number: '01',
      id: 'ask',
      title: 'ASK & INGEST',
      shortTitle: 'Ingest',
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-500',
      glow: 'rgba(244,63,94,0.3)',
      tag: '01 / Input',
    },
    {
      number: '02',
      id: 'ground',
      title: 'GROUND CONTEXT',
      shortTitle: 'Retrieve',
      icon: Globe,
      color: 'from-fuchsia-500 to-pink-500',
      glow: 'rgba(217,70,239,0.3)',
      tag: '02 / Context',
    },
    {
      number: '03',
      id: 'reason',
      title: 'NEURAL REASON',
      shortTitle: 'Reason',
      icon: Cpu,
      color: 'from-violet-500 to-fuchsia-500',
      glow: 'rgba(168,85,247,0.3)',
      tag: '03 / Inference',
    },
    {
      number: '04',
      id: 'act',
      title: 'ACT & EXECUTE',
      shortTitle: 'Execute',
      icon: Workflow,
      color: 'from-cyan-400 to-blue-500',
      glow: 'rgba(6,182,212,0.3)',
      tag: '04 / Action',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full bg-transparent py-20 sm:py-28 lg:py-36 overflow-hidden transition-colors"
    >
      {/* Anchor alias */}
      <span id="architecture" className="scroll-mt-28 absolute top-0" />

      {/* Atmospheric Ambient Spotlights */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#E52A83]/[0.07] via-[#B31372]/[0.04] to-transparent rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-[450px] h-[350px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />

      <div className="w-[94%] sm:w-[90%] max-w-[1700px] mx-auto px-2 sm:px-4 space-y-12 sm:space-y-16 relative z-10">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-[#140620]/80 px-4 py-1.5 text-xs font-semibold text-pink-200 shadow-[0_0_20px_rgba(229,42,131,0.15)] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-pink-300">
              PIPELINE ARCHITECTURE
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-[11px] text-[#A7A7B0]">4-Stage Deterministic Loop</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            How Nyra thinks &amp;{' '}
            <span className="bg-gradient-to-r from-white via-pink-200 to-rose-300 bg-clip-text text-transparent">
              delivers.
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-[#A7A7B0] max-w-2xl leading-relaxed"
          >
            Watch raw user intent transform through multi-source grounding, cognitive reasoning, and verified execution in milliseconds.
          </motion.p>

          {/* Scenario Selector Pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            <span className="text-xs font-mono text-[#7D7D88] mr-1 hidden sm:inline">Scenario:</span>
            {SCENARIOS.map((sc, idx) => {
              const ScenarioIcon = sc.icon;
              const isSelected = selectedScenarioIdx === idx;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIdx(idx);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500/20 border border-pink-500/50 text-white shadow-[0_0_15px_rgba(229,42,131,0.25)]'
                      : 'bg-white/[0.04] border border-white/[0.08] text-[#A7A7B0] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <ScenarioIcon className={`h-3.5 w-3.5 ${isSelected ? 'text-pink-400' : 'text-white/40'}`} />
                  <span>{sc.name}</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* TIMELINE PROGRESS & PLAY/PAUSE CONTROLS                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col space-y-6">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.05] hover:bg-white/[0.1] text-pink-300 border border-white/[0.08] transition-colors"
                title={isPlaying ? 'Pause auto-progression' : 'Play auto-progression'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Auto-Playing</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Paused</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveStep(0)}
                className="p-1 rounded-lg text-xs font-mono text-[#8E8E98] hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Restart from Step 1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-xs font-mono text-[#8E8E98] flex items-center gap-2">
              <span className="hidden sm:inline">Active Phase:</span>
              <span className="text-pink-300 font-bold">
                {activeStep + 1} / 4 &bull; {STEP_METADATA[activeStep].title}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONNECTED 4-NODE INTERACTIVE TIMELINE RIBBON                              */}
          {/* ========================================================================= */}
          <div className="relative">
            
            {/* Desktop Connecting Beam */}
            <div className="hidden lg:block absolute top-[52px] left-[6%] right-[6%] h-[2px] bg-white/[0.08] z-0">
              {/* Dynamic Illuminating Progress Line */}
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 via-[#E52A83] to-cyan-400"
                animate={{
                  width: `${(activeStep / 3) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              {/* Glowing Pulse Packet traveling to active node */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#E52A83]"
                animate={{
                  left: `calc(${(activeStep / 3) * 100}% - 8px)`,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>

            {/* 4 Connected Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {STEP_METADATA.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = activeStep === idx;
                const isPast = activeStep > idx;
                const stepData = currentScenario.steps[idx];

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStep(idx);
                      setIsPlaying(false);
                    }}
                    className={`group relative text-left rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                      isActive
                        ? 'border-pink-500/60 bg-[#160624]/95 shadow-[0_16px_40px_rgba(229,42,131,0.22)] -translate-y-1'
                        : isPast
                        ? 'border-white/[0.12] bg-[#0E0616]/80 hover:border-pink-500/30 hover:bg-[#12081C]'
                        : 'border-white/[0.06] bg-[#0A0512]/60 hover:border-white/20 hover:bg-[#0F0718]'
                    }`}
                  >
                    {/* Top Row: Number Node & Step Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        {/* Number Badge */}
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-white shadow-lg shadow-pink-950/60 scale-105 ring-2 ring-pink-400/40'
                              : isPast
                              ? 'bg-pink-500/10 text-pink-300 border border-pink-500/30'
                              : 'bg-white/[0.05] text-[#8E8E98] border border-white/10'
                          }`}
                        >
                          {step.number}
                        </div>

                        {/* Status Icon */}
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                            isActive
                              ? 'bg-pink-500/20 border-pink-500/40 text-pink-200 shadow-[0_0_12px_rgba(229,42,131,0.3)]'
                              : 'bg-white/[0.03] border-white/[0.08] text-[#8E8E98] group-hover:text-white'
                          }`}
                        >
                          <StepIcon className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Step Labels */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-pink-400 block">
                          {step.tag}
                        </span>
                        <h3 className={`text-lg font-bold tracking-tight transition-colors ${
                          isActive ? 'text-white' : 'text-[#E0E0E6] group-hover:text-white'
                        }`}>
                          {step.title}
                        </h3>
                      </div>

                      {/* Brief Summary */}
                      <p className="mt-2.5 text-xs text-[#A7A7B0] leading-relaxed line-clamp-2">
                        {stepData.summary}
                      </p>
                    </div>

                    {/* Bottom Status / Phase Pill */}
                    <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                      <span className={`${isActive ? 'text-pink-300 font-semibold' : 'text-[#8E8E98]'}`}>
                        {stepData.badge}
                      </span>
                      {isActive ? (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-pink-300 transition-colors" />
                      )}
                    </div>

                    {/* Active Bottom Glow Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-step-glow"
                        className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-pink-500 via-[#E52A83] to-cyan-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE ENGINE ROOM: LIVE STAGE EXECUTION VISUALIZER                         */}
          {/* ========================================================================= */}
          <motion.div
            layout
            className="rounded-3xl border border-white/[0.1] bg-[#0C0517]/90 p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Ambient Background Gradient Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-[#E52A83]/10 rounded-full blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/[0.06] rounded-full blur-[90px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Context & Deep Dive (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                    <span className="text-pink-400 font-bold uppercase tracking-wider">
                      Stage {activeStep + 1} of 4
                    </span>
                    <span className="text-white/20">&bull;</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Pipeline Monitor
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentStepData.subtitle}
                  </h3>

                  <p className="mt-3 text-sm text-[#A7A7B0] leading-relaxed">
                    {currentStepData.summary}
                  </p>
                </div>

                {/* Metrics Highlight Pill */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#8E8E98] uppercase tracking-wider">Telemetry Benchmark</div>
                    <div className="text-xs font-mono font-semibold text-white mt-0.5">
                      {currentStepData.metrics}
                    </div>
                  </div>
                </div>

                {/* Architecture Highlights */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#8E8E98]">Key Capabilities at this stage:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#C5C5CE]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                      <span>Zero-data retention option</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#C5C5CE]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                      <span>Sub-50ms token routing</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#C5C5CE]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Deterministic cross-eval</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#C5C5CE]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Instant artifact generation</span>
                    </div>
                  </div>
                </div>

                {/* Step navigation shortcut */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveStep((prev) => (prev > 0 ? prev - 1 : 3));
                      setIsPlaying(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-[#A7A7B0] hover:text-white hover:border-white/20 transition-colors"
                  >
                    &larr; Prev Stage
                  </button>
                  <button
                    onClick={() => {
                      setActiveStep((prev) => (prev < 3 ? prev + 1 : 0));
                      setIsPlaying(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-xs font-mono text-white hover:bg-pink-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Live Visualizer Window (7 cols) */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-white/[0.12] bg-[#07030C]/90 shadow-2xl overflow-hidden flex flex-col">
                  
                  {/* Window Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                      <span className="ml-2 font-mono text-[11px] text-[#8E8E98]">
                        nyra://engine/stage-{activeStep + 1}-{STEP_METADATA[activeStep].shortTitle.toLowerCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded">
                        {currentScenario.name}
                      </span>
                    </div>
                  </div>

                  {/* Window Content Display */}
                  <div className="p-5 sm:p-6 min-h-[260px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedScenarioIdx}-${activeStep}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {currentStepData.details}
                      </motion.div>
                    </AnimatePresence>

                    {/* Interactive Sub-actions in Execution Window */}
                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#8E8E98]">
                        <Layers className="h-3.5 w-3.5 text-pink-400" />
                        <span className="text-[11px] font-mono">
                          Live Pipeline Trace: OK
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeStep === 3 && (
                          <button
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-pink-300 border border-white/10 transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        )}
                        <span className="text-[11px] font-mono text-[#6A6A76]">
                          Execution: deterministic
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
