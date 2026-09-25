'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Sparkles,
  Code2,
  FileText,
  Globe,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Send,
  CheckCircle2,
  MessageSquare,
  Settings,
  Search,
} from 'lucide-react';

interface DemoMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  codeSnippet?: string;
  codeHeader?: string;
  followUps?: string[];
}

interface DemoScenario {
  id: string;
  label: string;
  icon: React.ElementType;
  model: string;
  speed: string;
  activeFile: string;
  fileTree: string[];
  messages: DemoMessage[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'code',
    label: 'React 19 & TypeScript',
    icon: Code2,
    model: 'Llama 3.3 70B',
    speed: '340 tok/s',
    activeFile: 'usePagination.ts',
    fileTree: ['usePagination.ts', 'Pagination.tsx', 'pagination.test.ts'],
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Build a reusable TypeScript pagination hook in React 19 with page boundaries.',
      },
      {
        id: 2,
        sender: 'ai',
        text: 'Here is a clean, zero-dependency pagination hook with memoized boundaries:',
        codeHeader: 'usePagination.ts',
        codeSnippet: `import { useMemo } from 'react';

export function usePagination(totalItems: number, itemsPerPage = 10, currentPage = 1) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pageRange = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return { totalPages, canPrevious, canNext, pageRange };
}`,
        followUps: ['Add Vitest unit tests', 'Explain boundary logic', 'Convert to SSR handler'],
      },
    ],
  },
  {
    id: 'rag',
    label: 'PDF Document RAG',
    icon: FileText,
    model: 'Qwen 2.5 72B',
    speed: '295 tok/s',
    activeFile: 'financial_synthesis.json',
    fileTree: ['financial_synthesis.json', 'q4_report.pdf', 'balance_matrix.csv'],
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Extract Q4 adjusted EBITDA and net free cash flow from the uploaded PDF audit.',
      },
      {
        id: 2,
        sender: 'ai',
        text: 'Direct vector retrieval from page 48 of the uploaded balance sheet:',
        codeHeader: 'financial_synthesis.json',
        codeSnippet: `{
  "fiscal_quarter": "Q4-2025",
  "adjusted_ebitda": "$1.42B (+18.4% YoY)",
  "free_cash_flow": "$312.0M",
  "confidence_score": 0.998
}`,
        followUps: ['Generate summary table', 'Audit currency risk hedges'],
      },
    ],
  },
  {
    id: 'search',
    label: 'Real-Time Web Search',
    icon: Globe,
    model: 'Tavily Search API',
    speed: '315 tok/s',
    activeFile: 'form_actions_guide.md',
    fileTree: ['form_actions_guide.md', 'tavily_sources.json', 'search_grounding.log'],
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Search live documentation for React 19 Server Actions form status hooks.',
      },
      {
        id: 2,
        sender: 'ai',
        text: 'Here is the verified synthesis from current official release notes:',
        codeHeader: 'form_actions_guide.md',
        codeSnippet: `1. Use \`useActionState\` for pending form states and optimistic feedback.
2. Pair with \`useFormStatus\` inside child submit buttons to disable double-clicks.
3. Server Actions support progressive enhancement when JS is disabled.`,
        followUps: ['Show optimistic UI code', 'Compare with useTransition'],
      },
    ],
  },
];

const desktopRisingVariants: Variants = {
  hidden: {
    y: 30,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function DesktopWorkspaceSection() {
  const demoEndRef = useRef<HTMLDivElement>(null);

  const [activeScenarioId, setActiveScenarioId] = useState<string>('code');
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>(activeScenario.messages);
  const [demoInput, setDemoInput] = useState('');
  const [isDemoTyping, setIsDemoTyping] = useState(false);
  const [demoStreamingText, setDemoStreamingText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setDemoMessages(activeScenario.messages);
    setIsDemoTyping(false);
    setDemoStreamingText('');
  }, [activeScenarioId, activeScenario.messages]);

  const triggerAiResponse = (query: string) => {
    if (!query.trim() || isDemoTyping) return;

    const userMsg: DemoMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
    };

    setDemoMessages((prev) => [...prev, userMsg]);
    setDemoInput('');
    setIsDemoTyping(true);
    setDemoStreamingText('');

    let fullResponse = '';
    let codeSnippet = '';
    let codeHeader = 'solution.ts';

    if (query.toLowerCase().includes('test') || query.toLowerCase().includes('unit')) {
      fullResponse = `Here are comprehensive unit test suites covering boundary conditions:`;
      codeHeader = 'pagination.test.ts';
      codeSnippet = `import { renderHook } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('calculates total pages accurately', () => {
    const { result } = renderHook(() => usePagination(25, 10, 1));
    expect(result.current.totalPages).toBe(3);
    expect(result.current.canNext).toBe(true);
  });
});`;
    } else {
      fullResponse = `Generated production-ready solution for "${query}":`;
      codeHeader = 'task_solution.ts';
      codeSnippet = `export async function handleTaskWorkflow(payload: { prompt: string }) {
  const result = await streamModelInference(payload.prompt);
  return { success: true, timestamp: Date.now(), data: result };
}`;
    }

    let charIndex = 0;
    const streamInterval = setInterval(() => {
      if (charIndex < fullResponse.length) {
        setDemoStreamingText((prev) => prev + fullResponse.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(streamInterval);
        const aiMsg: DemoMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: fullResponse,
          codeHeader,
          codeSnippet,
          followUps: ['Show another example', 'Optimize performance'],
        };
        setDemoMessages((prev) => [...prev, aiMsg]);
        setIsDemoTyping(false);
        setDemoStreamingText('');
      }
    }, 14);
  };

  const handleDemoSend = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAiResponse(demoInput);
  };

  useEffect(() => {
    demoEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [demoMessages, isDemoTyping, demoStreamingText]);

  const copySnippet = (code: string, index: number) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section
      id="desktop-workspace"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full py-20 sm:py-28 lg:py-36 overflow-hidden bg-transparent transition-colors"
    >
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none">
        <div className="h-[650px] w-[950px] rounded-full bg-[#B31372]/[0.06] blur-[160px] transform -translate-y-6" />
      </div>

      <div className="w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 xl:gap-20 items-center">
          {/* LEFT COLUMN: REAL DESKTOP AI WORKSPACE WINDOW */}
          <motion.div
            variants={desktopRisingVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-7 xl:col-span-7 order-2 lg:order-1"
          >
            {/* Desktop Chassis with Near-Black & Pink Highlight Rim */}
            <div className="relative rounded-[22px] xs:rounded-[28px] sm:rounded-[32px] border border-pink-500/25 bg-[#08030D] shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300">
              {/* 1. TOP WINDOW TITLEBAR & MULTI-TAB IDE BAR */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0E0514] px-3 sm:px-5 py-2 sm:py-2.5 transition-colors gap-2">
                {/* Traffic Lights & Active Tabs */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-2xs" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-2xs" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-2xs" />
                  </div>

                  {/* Active & Sibling File Tabs */}
                  <div className="flex items-center gap-1.5 pl-1 overflow-x-auto scrollbar-none min-w-0">
                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-[#180922] border border-pink-400/30 text-[10px] sm:text-[11px] font-mono text-white shadow-2xs truncate">
                      <Code2 className="h-3 w-3 text-[#FF4FA3] shrink-0" />
                      <span className="font-semibold truncate">{activeScenario.activeFile}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    </div>

                    {activeScenario.fileTree.slice(1, 2).map((file) => (
                      <div key={file} className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-mono text-pink-300/60 shrink-0">
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Omnibar / Command Search Pill */}
                <div className="hidden xl:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-pink-200 font-mono shadow-2xs shrink-0">
                  <Search className="h-3 w-3 text-[#FF4FA3]" />
                  <span>nyra-studio / workspace</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-400/30">⌘K</span>
                </div>

                {/* Right Window Status Badge & Link */}
                <div className="flex items-center gap-2 sm:gap-2.5 text-xs shrink-0">
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-emerald-300 font-mono text-[9.5px] sm:text-[10.5px] font-bold shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeScenario.speed}
                  </span>

                  <Link
                    href="/chat-ui"
                    className="hidden xs:flex items-center gap-1 text-[11px] font-bold text-pink-300 hover:text-white transition-colors"
                  >
                    <span>Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* 2. DESKTOP WORKSPACE BODY */}
              <div className="flex min-h-[440px] xs:min-h-[480px] sm:min-h-[520px]">
                {/* Slim Navigation Sidebar Dock */}
                <div className="w-10 xs:w-12 sm:w-14 border-r border-white/10 bg-[#0A0310] p-1.5 sm:p-2 flex flex-col justify-between items-center shrink-0">
                  <div className="space-y-2.5 sm:space-y-3 flex flex-col items-center w-full pt-1">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    <div className="w-5 sm:w-6 h-[1px] bg-white/10" />

                    <div className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg bg-pink-500/20 text-[#FF4FA3] border border-pink-400/30 flex items-center justify-center shadow-2xs" title="Chat">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg hover:bg-white/[0.06] text-pink-300/70 hover:text-pink-200 flex items-center justify-center transition-colors cursor-pointer" title="Code Studio">
                      <Code2 className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg hover:bg-white/[0.06] text-pink-300/70 hover:text-pink-200 flex items-center justify-center transition-colors cursor-pointer" title="Documents & RAG">
                      <FileText className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg hover:bg-white/[0.06] text-pink-300/70 hover:text-pink-200 flex items-center justify-center transition-colors cursor-pointer" title="Live Web Search">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col items-center pb-1">
                    <div className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg hover:bg-white/[0.06] text-pink-300/70 hover:text-pink-200 flex items-center justify-center transition-colors cursor-pointer" title="Settings">
                      <Settings className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Main Workspace Work Area */}
                <div className="flex-1 flex flex-col justify-between p-3 xs:p-4 sm:p-5 overflow-hidden bg-[#050208] min-w-0">
                  {/* Top Work Area Sub-Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/10 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Workspace Session</span>
                      <span className="text-[#FF4FA3] font-mono">•</span>
                      <span className="font-mono text-pink-300/80">{activeScenario.model}</span>
                    </div>

                    <div className="hidden xs:flex items-center gap-2 text-[10.5px] font-mono text-pink-300">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 font-semibold">Temp: 0.2</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 font-semibold">Context: 128k</span>
                    </div>
                  </div>

                  {/* Conversation Feed */}
                  <div className="space-y-3.5 max-h-[340px] sm:max-h-[360px] overflow-y-auto pr-1 scrollbar-thin flex-1">
                    {demoMessages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 sm:gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-white font-bold text-xs shadow-xs mt-0.5">
                            ✦
                          </div>
                        )}

                        <div
                          className={`max-w-[92%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-[#B31372] to-[#800A4C] text-white border border-pink-400/30 shadow-2xs font-normal'
                              : 'border border-white/10 bg-[#0D0514] text-[#F5F5F7] shadow-2xs'
                          }`}
                        >
                          <p className="font-medium leading-relaxed">{msg.text}</p>

                          {/* Dark Mode Code Block */}
                          {msg.codeSnippet && (
                            <div className="mt-3 relative rounded-xl bg-[#030106] p-3 font-mono text-[11px] text-pink-100 border border-pink-900/40 shadow-2xs overflow-hidden">
                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-pink-900/30 text-[10px] text-pink-300">
                                <span className="font-bold">{msg.codeHeader || 'code.ts'}</span>
                                <button
                                  onClick={() => copySnippet(msg.codeSnippet!, index)}
                                  className="flex items-center gap-1 rounded-md bg-white/[0.08] border border-white/10 px-2 py-0.5 text-pink-200 hover:text-white font-semibold transition-colors cursor-pointer shadow-2xs"
                                  title="Copy Code"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="overflow-x-auto leading-relaxed max-w-full text-[#FF85C0] font-medium">
                                {msg.codeSnippet}
                              </pre>
                            </div>
                          )}

                          {/* Suggested Action Chips */}
                          {msg.followUps && (
                            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#FF4FA3] font-mono font-bold">
                                Suggested:
                              </span>
                              {msg.followUps.map((chip, ci) => (
                                <button
                                  key={ci}
                                  onClick={() => triggerAiResponse(chip)}
                                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-pink-200 text-[10.5px] font-semibold transition cursor-pointer shadow-2xs hover:scale-102"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Streaming Response Indicator */}
                    {isDemoTyping && (
                      <div className="flex gap-3 items-center">
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-white font-bold text-xs animate-pulse shadow-xs">
                          ✦
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#0D0514] px-3.5 py-2 text-xs text-white font-mono shadow-2xs">
                          <span>{demoStreamingText}</span>
                          <span className="inline-block w-2 h-3.5 ml-1 bg-[#E52A83] animate-pulse align-middle" />
                        </div>
                      </div>
                    )}
                    <div ref={demoEndRef} />
                  </div>

                  {/* Input Command Bar */}
                  <form
                    onSubmit={handleDemoSend}
                    className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0514] px-3.5 py-2.5 shadow-2xs focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20 transition-all">
                      <input
                        type="text"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        placeholder="Ask Nyra anything or click a suggested prompt..."
                        className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none placeholder-pink-300/40 min-w-0"
                      />

                      <button
                        type="submit"
                        disabled={isDemoTyping || !demoInput.trim()}
                        className="rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:from-[#FF4FA3] hover:to-[#E52A83] px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-pink-950/50 hover:scale-102 shrink-0"
                      >
                        <span>Send</span>
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: CONTENTS, SCENARIO SWITCHERS & EXPLANATION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 xl:col-span-5 order-1 lg:order-2 space-y-6"
          >
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl hover:border-pink-300/40 transition-all mb-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
                <Terminal className="h-2.5 w-2.5" />
              </div>
              <span className="font-mono text-[11px] text-pink-300 font-bold tracking-wider uppercase">
                INTERACTIVE DEMO
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-white font-medium">Live Studio Canvas</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shadow-[0_0_8px_#34d399]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Experience the workspace{' '}
                <span className="bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent">
                  live.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[#A7A7B0] leading-relaxed">
                Test real-time model streaming, syntax-highlighted code generation, and multi-modal responses directly in your browser.
              </p>
            </div>

            {/* Interactive Scenario Cards in Dark Theme */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-300">
                Select Interactive Scenario
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_SCENARIOS.map((scenario) => {
                  const Icon = scenario.icon;
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenarioId(scenario.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#E52A83] bg-[#180922] shadow-lg shadow-pink-950/40 scale-[1.01]'
                          : 'border-white/10 bg-[#0A0310] hover:bg-[#12051A] hover:border-pink-400/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            isActive
                              ? 'bg-[#E52A83] text-white border-pink-400'
                              : 'bg-white/[0.06] text-pink-300 border-white/10'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {scenario.label}
                          </div>
                          <div className="text-[11px] font-mono text-pink-300/70">
                            Powered by {scenario.model}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-block font-mono text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-400/25">
                          {scenario.speed}
                        </span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isActive
                              ? 'border-[#E52A83] bg-[#E52A83]'
                              : 'border-white/20'
                          }`}
                        >
                          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch App Button & Quick Note */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/chat-ui"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#960E5B] hover:from-[#FF4FA3] hover:via-[#E52A83] hover:to-[#B31372] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-pink-950/60 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Launch Full Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2 text-xs font-mono text-[#A7A7B0] px-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Zero signup required to test</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
