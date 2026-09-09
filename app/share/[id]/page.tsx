'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Download, Check, Sparkles, Share2 } from 'lucide-react';
import { getRelativeTime, getFullTimestamp } from '@/lib/formatTimestamp';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/chat/CodeBlock';
import { useToast } from '@/components/ui/Toast';
import ExportModal from '@/components/modals/ExportModal';

interface SharedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  modelId?: string;
}

interface SharedConversation {
  id: string;
  title: string;
  createdAt: number;
  messages: SharedMessage[];
}

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const shareId = params?.id as string;

  useEffect(() => {
    if (!shareId) return;

    // 1. Check if stored in localStorage shared conversations cache
    try {
      const cached = localStorage.getItem(`nyra_share_${shareId}`);
      if (cached) {
        setConversation(JSON.parse(cached));
        return;
      }

      // 2. Check if the active chats in localStorage have this ID
      const savedChats = localStorage.getItem('nyra_saved_chats');
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        const match = chats.find((c: any) => c.id === shareId);
        if (match) {
          setConversation(match);
          return;
        }
      }

      // 3. Fallback mock / sample shared conversation
      setConversation({
        id: shareId,
        title: 'Shared AI Research & Architecture Discussion',
        createdAt: Date.now() - 3600000,
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'How should we architect a high-scale real-time AI chat application with multi-provider streaming?',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Here is the recommended architecture for a production-grade multi-provider AI chat workspace:\n\n### 1. Core Architecture Layers\n- **Client Layer**: React 19 + Next.js App Router with Server-Sent Events (SSE) stream consumption.\n- **Stream Resolver**: Edge/Node proxy that validates provider credentials, normalizes model IDs, and filters internal `<think>` reasoning tags.\n- **Storage**: Supabase PostgreSQL with Row Level Security (RLS) for cloud sync and offline `localStorage` fallback.\n\n```typescript\ninterface AIStreamConfig {\n  provider: "groq" | "openai" | "anthropic" | "gemini" | "openrouter";\n  model: string;\n  stream: boolean;\n}\n```\n\nThis decoupled design ensures high reliability and zero downtime during provider failovers.',
            timestamp: Date.now() - 3550000,
            modelId: 'qwen/qwen3.6-27b',
          },
        ],
      });
    } catch (e) {
      console.error('Failed to load shared conversation:', e);
    }
  }, [shareId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast({ type: 'success', title: 'Share link copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040a17] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 animate-pulse flex items-center justify-center">
            <span className="text-lg font-bold">✦</span>
          </div>
          <p className="text-xs text-slate-400">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040a17] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-sky-400/15 bg-[#08152e]/90 backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/chat-ui"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/20 bg-sky-950/40 hover:bg-sky-900/60 text-xs font-semibold text-sky-200 hover:text-white transition"
          >
            <ArrowLeft size={14} />
            <span>Nyra AI</span>
          </Link>
          <div className="h-4 w-[1px] bg-sky-400/20" />
          <h1 className="text-xs md:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {conversation.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/20 bg-sky-950/40 hover:bg-sky-900/60 text-xs font-semibold text-sky-200 hover:text-white transition cursor-pointer"
            title="Copy share link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/20 bg-sky-950/40 hover:bg-sky-900/60 text-xs font-semibold text-sky-200 hover:text-white transition cursor-pointer"
            title="Export conversation"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            href="/chat-ui"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition"
          >
            <Sparkles size={13} />
            <span>Open in Nyra</span>
          </Link>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="rounded-2xl border border-sky-400/20 bg-sky-950/30 p-4 mb-6 flex items-center justify-between text-xs text-sky-200">
          <div>
            <p className="font-bold text-white mb-0.5">{conversation.title}</p>
            <p className="text-[11px] text-slate-400">
              Shared on {new Date(conversation.createdAt).toLocaleDateString()} &bull; Read-only view
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] font-mono text-sky-300">
            Public Share
          </span>
        </div>

        {conversation.messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              {!isUser && (
                <div className="w-7 h-7 shrink-0 mr-3 mt-1 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold shadow-[0_0_15px_rgba(56,189,248,0.35)] text-slate-950">
                  ✦
                </div>
              )}

              <div className="relative group max-w-[85%] md:max-w-[82%]">
                <div className={`mb-1.5 flex items-center gap-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs font-semibold text-slate-200">{isUser ? 'User' : '✦ Nyra'}</span>
                  {!isUser && msg.modelId && (
                    <span className="px-1.5 py-0.5 rounded-md bg-sky-950/70 border border-sky-400/25 text-[9px] text-sky-300 font-mono">
                      {msg.modelId.split('/').pop() || msg.modelId}
                    </span>
                  )}
                  <span
                    className="text-[10px] text-slate-400/70 font-mono"
                    title={getFullTimestamp(msg.timestamp || Date.now())}
                  >
                    {getRelativeTime(msg.timestamp || Date.now())}
                  </span>
                </div>

                {isUser ? (
                  <div className="rounded-[20px] px-4 py-3 text-[14px] leading-relaxed bg-gradient-to-r from-[#1d4ed8]/95 via-[#0284c7]/95 to-[#0ea5e9]/95 text-white shadow-md border border-[rgba(125,211,252,0.25)]">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="text-[14.5px] leading-relaxed text-slate-100 font-normal">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props) {
                          const { className, children, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match && !String(children).includes('\n');
                          return !isInline ? (
                            <CodeBlock language={match ? match[1] : 'text'} value={String(children).replace(/\n$/, '')} />
                          ) : (
                            <code className="bg-sky-950/80 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs border border-sky-400/20" {...rest}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chat={{
          id: conversation.id,
          title: conversation.title,
          messages: conversation.messages as any,
          createdAt: conversation.createdAt,
        }}
      />
    </div>
  );
}
