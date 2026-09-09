'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  Code2,
  FileText,
  Globe,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Terminal,
  Send,
  CheckCircle2,
  FolderTree,
  MessageSquare,
  Database,
  Layers,
  Settings,
  Search,
  Maximize2,
  SplitSquareVertical,
  SlidersHorizontal,
  ChevronDown,
  Paperclip,
  Activity,
  Zap,
  Bot,
  Play,
  Share2,
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
        text: 'Extract operating income and risk factors from Section 3 of the financial quarterly PDF.',
      },
      {
        id: 2,
        sender: 'ai',
        text: 'Extracted financial balance matrix directly from in-browser PDF.js vector chunking:',
        codeHeader: 'financial_synthesis.json',
        codeSnippet: `{
  "operating_income": "$148.2M (+34% YoY)",
  "cloud_revenue": "$892.4M (62% of ARR)",
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

  // Sync scenario switch
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
      className="relative w-full py-20 sm:py-28 lg:py-36 overflow-hidden bg-transparent transition-colors"
    >
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="h-[600px] w-[900px] rounded-full bg-[#8B6FC9]/[0.06] blur-[130px] transform -translate-y-6" />
      </div>

      <div className="w-[94%] sm:w-[90%] max-w-[1580px] mx-auto px-2 sm:px-4 relative z-10">
        {/* Generous Responsive Grid with Increased Column Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 xl:gap-20 items-center">
          
          {/* LEFT COLUMN: REAL DESKTOP AI WORKSPACE WINDOW */}
          <motion.div
            variants={desktopRisingVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-7 xl:col-span-7 order-2 lg:order-1"
          >
            {/* Real Desktop Application Chassis with Soft Lavender Titanium Border */}
            <div className="relative rounded-[28px] sm:rounded-[32px] border-2 border-purple-200/90 bg-[#FAF7FE] shadow-[0_28px_80px_rgba(124,92,184,0.16),0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300">
              
              {/* 1. TOP WINDOW TITLEBAR & MULTI-TAB IDE BAR */}
              <div className="flex items-center justify-between border-b border-purple-200/80 bg-[#F2ECFB] px-3.5 sm:px-5 py-2.5 transition-colors">
                
                {/* Traffic Lights & Active Tabs */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-2xs" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-2xs" />
                    <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-2xs" />
                  </div>

                  {/* Active & Sibling File Tabs */}
                  <div className="hidden sm:flex items-center gap-1.5 pl-1 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-purple-200/90 text-[11px] font-mono text-[#1E162D] shadow-2xs">
                      <Code2 className="h-3 w-3 text-[#7C5CB8]" />
                      <span className="font-semibold">{activeScenario.activeFile}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>

                    {activeScenario.fileTree.slice(1, 2).map((file) => (
                      <div key={file} className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-mono text-[#686477]">
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Omnibar / Command Search Pill */}
                <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-purple-200/70 text-[11px] text-[#554D66] font-mono shadow-2xs">
                  <Search className="h-3 w-3 text-[#7C5CB8]" />
                  <span>nyra-studio / workspace</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F4EFFC] text-[#7C5CB8] font-bold border border-purple-200">⌘K</span>
                </div>

                {/* Right Window Status Badge & Link */}
                <div className="flex items-center gap-2.5 text-xs shrink-0">
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-mono text-[10.5px] font-bold shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeScenario.speed}
                  </span>

                  <Link
                    href="/chat-ui"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#7C5CB8] hover:text-[#5B3E96] transition-colors"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* 2. DESKTOP WORKSPACE BODY WITH SIDEBAR & CHAT WORK AREA */}
              <div className="flex min-h-[490px] sm:min-h-[520px]">
                
                {/* Slim Navigation Sidebar Dock */}
                <div className="w-12 sm:w-14 border-r border-purple-200/70 bg-[#FAF7FE] p-2 flex flex-col justify-between items-center shrink-0">
                  <div className="space-y-3 flex flex-col items-center w-full pt-1">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#7C5CB8] to-[#6B4BA8] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div className="w-6 h-[1px] bg-purple-200/80" />

                    <div className="h-7 w-7 rounded-lg bg-[#F2ECFB] text-[#7C5CB8] border border-purple-200/80 flex items-center justify-center shadow-2xs" title="Chat">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-7 w-7 rounded-lg hover:bg-[#F2ECFB] text-[#554D66] hover:text-[#7C5CB8] flex items-center justify-center transition-colors cursor-pointer" title="Code Studio">
                      <Code2 className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-7 w-7 rounded-lg hover:bg-[#F2ECFB] text-[#554D66] hover:text-[#7C5CB8] flex items-center justify-center transition-colors cursor-pointer" title="Documents & RAG">
                      <FileText className="h-3.5 w-3.5" />
                    </div>

                    <div className="h-7 w-7 rounded-lg hover:bg-[#F2ECFB] text-[#554D66] hover:text-[#7C5CB8] flex items-center justify-center transition-colors cursor-pointer" title="Live Web Search">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col items-center pb-1">
                    <div className="h-7 w-7 rounded-lg hover:bg-[#F2ECFB] text-[#554D66] hover:text-[#7C5CB8] flex items-center justify-center transition-colors cursor-pointer" title="Settings">
                      <Settings className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Main Workspace Work Area */}
                <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 overflow-hidden bg-white">
                  
                  {/* Top Work Area Sub-Header / Active Session Info */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-purple-100 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1E162D]">Workspace Session</span>
                      <span className="text-[#7C5CB8] font-mono">•</span>
                      <span className="font-mono text-[#554D66]">{activeScenario.model}</span>
                    </div>

                    <div className="hidden xs:flex items-center gap-2 text-[10.5px] font-mono text-[#7C5CB8]">
                      <span className="px-2 py-0.5 rounded-md bg-[#F4EFFC] border border-purple-200/60 font-semibold">Temp: 0.2</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#F4EFFC] border border-purple-200/60 font-semibold">Context: 128k</span>
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
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C5CB8] to-[#6B4BA8] text-white font-bold text-xs shadow-xs mt-0.5">
                            ✦
                          </div>
                        )}

                        <div
                          className={`max-w-[92%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#F2ECFB] text-[#1E162D] border border-purple-200/90 shadow-2xs font-normal'
                              : 'border border-purple-200/80 bg-[#FAF8FE] text-[#1E162D] shadow-2xs'
                          }`}
                        >
                          <p className="font-medium leading-relaxed">{msg.text}</p>

                          {/* Clean High-Contrast Light-Themed Code Block */}
                          {msg.codeSnippet && (
                            <div className="mt-3 relative rounded-xl bg-white p-3 font-mono text-[11px] text-[#1E162D] border border-purple-200/90 shadow-2xs overflow-hidden">
                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-purple-100 text-[10px] text-[#7C5CB8]">
                                <span className="font-bold">{msg.codeHeader || 'code.ts'}</span>
                                <button
                                  onClick={() => copySnippet(msg.codeSnippet!, index)}
                                  className="flex items-center gap-1 rounded-md bg-[#F4EFFC] border border-purple-200/80 px-2 py-0.5 text-[#6B52A3] hover:text-[#4F3680] font-semibold transition-colors cursor-pointer shadow-2xs"
                                  title="Copy Code"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      <span className="text-emerald-600 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="overflow-x-auto leading-relaxed max-w-full text-[#2D2340] font-medium">
                                {msg.codeSnippet}
                              </pre>
                            </div>
                          )}

                          {/* Suggested Action Chips */}
                          {msg.followUps && (
                            <div className="mt-3 pt-2.5 border-t border-purple-100 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#7C5CB8] font-mono font-bold">
                                Suggested:
                              </span>
                              {msg.followUps.map((chip, ci) => (
                                <button
                                  key={ci}
                                  onClick={() => triggerAiResponse(chip)}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7FE] border border-purple-200/80 text-[#6B52A3] text-[10.5px] font-semibold transition cursor-pointer shadow-2xs hover:scale-102"
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
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C5CB8] to-[#6B4BA8] text-white font-bold text-xs animate-pulse shadow-xs">
                          ✦
                        </div>
                        <div className="rounded-xl border border-purple-200/80 bg-white px-3.5 py-2 text-xs text-[#1E162D] font-mono shadow-2xs">
                          <span>{demoStreamingText}</span>
                          <span className="inline-block w-2 h-3.5 ml-1 bg-[#7C5CB8] animate-pulse align-middle" />
                        </div>
                      </div>
                    )}
                    <div ref={demoEndRef} />
                  </div>

                  {/* Input Command Bar */}
                  <form
                    onSubmit={handleDemoSend}
                    className="mt-3 border-t border-purple-100 pt-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 rounded-2xl border border-purple-200/80 bg-[#FAF8FE] px-3.5 py-2.5 shadow-2xs focus-within:border-[#7C5CB8] focus-within:ring-2 focus-within:ring-[#7C5CB8]/15 transition-all">
                      <input
                        type="text"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        placeholder="Ask Nyra anything or click a suggested prompt..."
                        className="flex-1 bg-transparent text-xs sm:text-sm text-[#1E162D] outline-none placeholder-[#7A728A] min-w-0"
                      />

                      <button
                        type="submit"
                        disabled={isDemoTyping || !demoInput.trim()}
                        className="rounded-xl bg-gradient-to-r from-[#7C5CB8] to-[#6B4BA8] hover:from-[#6B4BA8] hover:to-[#5B3E96] px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-102 shrink-0"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#6B52A3] shadow-[0_2px_10px_rgba(124,92,184,0.07)] hover:border-[#8B6FC9] transition-all mb-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EDE6FA] text-[#7C5CB8]">
                <Terminal className="h-2.5 w-2.5" />
              </div>
              <span className="font-mono text-[11px] text-[#7C5CB8] font-bold tracking-wider uppercase">
                INTERACTIVE DEMO
              </span>
              <span className="text-[#7C5CB8]/30">&bull;</span>
              <span className="text-[#1E162D] font-medium">Live Studio Canvas</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shadow-[0_0_6px_#10B981]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E162D] leading-[1.15]">
                Experience the workspace <span className="bg-gradient-to-r from-[#6B52A3] via-[#7C5CB8] to-[#906FC8] bg-clip-text text-transparent">live.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#554D66] leading-relaxed">
                Test real-time model streaming, syntax-highlighted code generation, and multi-modal responses directly in your browser.
              </p>
            </div>

            {/* Interactive Scenario Cards in Soft Lavender */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7C5CB8]">
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
                          ? 'border-[#7C5CB8] bg-[#F4EFFC] shadow-sm shadow-[#7C5CB8]/10 scale-[1.01]'
                          : 'border-purple-200/70 bg-white hover:bg-[#FAF7FE] hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            isActive
                              ? 'bg-[#7C5CB8] text-white border-[#6B4BA8]'
                              : 'bg-[#F4EFFC] text-[#7C5CB8] border-purple-200/80'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[#1E162D]">
                            {scenario.label}
                          </div>
                          <div className="text-[11px] font-mono text-[#554D66]">
                            Powered by {scenario.model}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-block font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {scenario.speed}
                        </span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isActive
                              ? 'border-[#7C5CB8] bg-[#7C5CB8]'
                              : 'border-purple-300'
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C5CB8] via-[#6B4BA8] to-[#5B3E96] hover:from-[#6B4BA8] hover:to-[#4F3680] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Launch Full Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <div className="flex items-center gap-2 text-xs font-mono text-[#554D66] px-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Zero signup required to test</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
