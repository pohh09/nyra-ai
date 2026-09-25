'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Copy,
  Check,
  Globe,
  Download,
  BookOpen,
  FileText,
  Trash2,
  Layers,
  Clock,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import {
  getResearchBriefs,
  saveResearchBrief,
  deleteResearchBrief,
  exportBriefAsMarkdown,
  ResearchBrief,
} from '@/lib/services/researchService';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ResearchPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [briefs, setBriefs] = useState<ResearchBrief[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);

  // Form State
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'comprehensive'>('deep');
  const [specificQuestions, setSpecificQuestions] = useState('');

  // Generation State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loaded = getResearchBriefs();
    setBriefs(loaded);
    if (loaded.length > 0) {
      setSelectedBriefId(loaded[0].id);
      setActiveReport(loaded[0].synthesis);
      setTopic(loaded[0].topic);
    }
  }, []);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      addToast({ type: 'error', title: 'Please enter a research topic or question' });
      return;
    }

    setIsSynthesizing(true);
    setActiveReport('');

    const prompt = `You are a Principal AI Research Scientist. Perform an in-depth, rigorous research synthesis on this topic:

=== RESEARCH TOPIC ===
${topic.trim()}
======================
${specificQuestions.trim() ? `=== SPECIFIC OBJECTIVES & QUESTIONS ===\n${specificQuestions.trim()}\n=====================================` : ''}
Depth: ${depth.toUpperCase()}

Generate an exhaustive, well-structured research brief formatted in clean markdown:
# Executive Research Synthesis: ${topic.trim()}

## 1. Executive Summary & Core Thesis
Provide a clear high-level synthesis of current state, consensus, and breakthrough findings.

## 2. Comprehensive Analysis & Findings
Deep dive into mechanisms, empirical observations, real-world implementations, and performance metrics.

## 3. Critical Trade-offs, Bottlenecks & Counter-Arguments
Analyze what alternatives exist, risks, failure modes, or opposing viewpoints.

## 4. Key Takeaways & Actionable Recommendations
Summarize concrete steps, architectural takeaways, or strategic decisions.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          webSearch: true,
          modelId: 'balanced',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate synthesis');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullReport = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullReport += chunk;
        setActiveReport(fullReport);
      }

      const newBrief: ResearchBrief = {
        id: `brief_${Date.now()}`,
        topic: topic.trim(),
        title: topic.trim().slice(0, 45) + (topic.length > 45 ? '...' : ''),
        depth,
        objectives: specificQuestions.trim() ? [specificQuestions.trim()] : [],
        synthesis: fullReport,
        keyFindings: [],
        sources: [],
        takeaways: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveResearchBrief(newBrief);
      const updated = getResearchBriefs();
      setBriefs(updated);
      setSelectedBriefId(newBrief.id);

      addToast({ type: 'success', title: 'Research brief synthesized & saved!' });
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Synthesis failed' });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSelectBrief = (b: ResearchBrief) => {
    setSelectedBriefId(b.id);
    setActiveReport(b.synthesis);
    setTopic(b.topic);
  };

  const handleDeleteBrief = (id: string) => {
    deleteResearchBrief(id);
    const updated = getResearchBriefs();
    setBriefs(updated);
    if (selectedBriefId === id) {
      if (updated.length > 0) {
        handleSelectBrief(updated[0]);
      } else {
        setSelectedBriefId(null);
        setActiveReport(null);
      }
    }
    addToast({ type: 'info', title: 'Research session deleted' });
  };

  const handleExport = () => {
    if (!activeReport) return;
    const blob = new Blob([activeReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_brief_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Downloaded research report as Markdown' });
  };

  const handleCopy = () => {
    if (!activeReport) return;
    navigator.clipboard.writeText(activeReport);
    setCopied(true);
    addToast({ type: 'success', title: 'Copied report to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FB] dark:bg-[#050505] text-[#261827] dark:text-white flex flex-col selection:bg-[#F4DCE9] selection:text-[#B31372] dark:selection:text-pink-200 transition-colors duration-200">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,42,131,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(229,42,131,0.18),transparent_75%)]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 border-b border-[#E7B8CF] dark:border-pink-500/15 bg-white/80 dark:bg-[#16091F]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/chat-ui"
            className="p-1.5 rounded-lg bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#686477] dark:text-slate-300 hover:text-[#292633] dark:hover:text-white transition"
            title="Back to Workspace"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F9F4EB] dark:bg-amber-500/15 border border-[#EFE2CC] dark:border-amber-400/30 flex items-center justify-center text-[#9C773E] dark:text-amber-300">
              <Search size={14} />
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#292633] dark:text-white tracking-tight">
              AI Deep Research Studio
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/chat-ui"
            className="px-3.5 py-1.5 rounded-full bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-[#8B6FC9]/25 cursor-pointer active:scale-95"
          >
            <Sparkles size={13} />
            <span>Chat Studio</span>
          </Link>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: SAVED BRIEFS & QUERY BUILDER (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* New Research Form */}
            <div className="p-5 rounded-[22px] bg-white dark:bg-[linear-gradient(180deg,#181030_0%,#100a24_100%)] border border-[#E8E4EF] dark:border-purple-400/25 shadow-sm dark:shadow-xl space-y-3.5">
              <h3 className="text-sm font-bold text-[#292633] dark:text-white flex items-center gap-2">
                <Globe size={15} className="text-[#8B6FC9] dark:text-amber-400" />
                <span>New Research Investigation</span>
              </h3>

              <form onSubmit={handleStartResearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#292633] dark:text-purple-200 mb-1">
                    Topic / Question *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js 15 Server Actions vs tRPC at scale"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F7FB] dark:bg-black/40 border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292633] dark:text-purple-200 mb-1">
                    Specific Objectives / Sub-questions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key areas to focus on or compare..."
                    value={specificQuestions}
                    onChange={(e) => setSpecificQuestions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F7FB] dark:bg-black/40 border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292633] dark:text-purple-200 mb-1">
                    Investigation Depth
                  </label>
                  <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F7FB] dark:bg-black/40 border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 transition cursor-pointer capitalize"
                  >
                    <option value="standard">Standard Brief</option>
                    <option value="deep">Deep Dive (Multi-Source)</option>
                    <option value="comprehensive">Comprehensive Report</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSynthesizing || !topic.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-[#8B6FC9]/25 cursor-pointer active:scale-95"
                >
                  {isSynthesizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Synthesize Research Brief</span>
                </button>
              </form>
            </div>

            {/* Saved Briefs History */}
            <div className="p-4 rounded-[22px] bg-white dark:bg-[#120c26]/90 border border-[#E8E4EF] dark:border-purple-400/20 backdrop-blur-md shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#292633] dark:text-white flex items-center gap-1.5">
                  <Bookmark size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span>Saved Sessions ({briefs.length})</span>
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {briefs.length === 0 ? (
                  <p className="text-xs text-[#92909B] dark:text-slate-500 text-center py-4">No saved briefs yet.</p>
                ) : (
                  briefs.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBrief(b)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedBriefId === b.id
                          ? 'bg-[#EEE8FA] dark:bg-[#1f153d] border-[#8B6FC9] text-[#292633] dark:text-white font-medium shadow-sm'
                          : 'bg-[#F8F7FB] hover:bg-[#F5F3F9] dark:bg-[#181030]/60 border-[#E8E4EF] dark:border-purple-400/15 text-[#686477] dark:text-slate-300 hover:text-[#292633] dark:hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold truncate">{b.title}</h4>
                        <span className="text-[10px] text-[#92909B] dark:text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString()} • {b.depth}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrief(b.id);
                        }}
                        className="p-1 text-[#92909B] hover:text-[#C77B7B] dark:hover:text-rose-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SYNTHESIS REPORT CANVAS (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[linear-gradient(180deg,#150d2c_0%,#0d071a_100%)] border border-[#E8E4EF] dark:border-purple-400/25 shadow-sm dark:shadow-xl space-y-4 min-h-[520px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6FA58A] dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-[#292633] dark:text-white">Research Canvas & Brief</h3>
                </div>

                {activeReport && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 rounded-xl bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#292633] dark:text-slate-300 hover:text-[#292633] dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check size={13} className="text-[#6FA58A]" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleExport}
                      className="px-3 py-1 rounded-xl bg-[#EEE8FA] hover:bg-[#E4DCF5] dark:bg-purple-500/20 dark:hover:bg-purple-500/30 border border-[#E8E4EF] dark:border-purple-400/30 text-xs text-[#6B52A3] dark:text-purple-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Export .md</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Report Body */}
              <div className="flex-1 py-2">
                {isSynthesizing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <Loader2 size={36} className="animate-spin text-[#8B6FC9]" />
                    <p className="text-xs text-[#6B52A3] dark:text-purple-200">
                      Querying live intelligence, synthesizing findings, and structuring research brief...
                    </p>
                  </div>
                ) : (
                  <div className="text-xs sm:text-[13px] text-[#292633] dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {activeReport || 'Define a research topic on the left and click "Synthesize Research Brief" to generate a deep-dive investigation.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
