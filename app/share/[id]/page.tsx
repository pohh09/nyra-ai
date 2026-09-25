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
      <div className="flex min-h-screen items-center justify-center dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#8B6FC9] to-[#7E9AC7] animate-pulse flex items-center justify-center text-white">
            <span className="text-lg font-bold">✦</span>
          </div>
          <p className="text-xs dark:text-white/50 text-[#686477]">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-slate-100 text-[#292633] flex flex-col selection:bg-[#8B6FC9]/30 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b dark:border-white/10 border-[#E8E4EF] dark:bg-[#0A0C14]/90 bg-white/90 backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <Link
            href="/chat-ui"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] text-xs font-semibold dark:text-white text-[#292633] transition"
          >
            <ArrowLeft size={14} />
            <span>Nyra AI</span>
          </Link>
          <div className="h-4 w-[1px] dark:bg-white/10 bg-[#E8E4EF]" />
          <h1 className="text-xs md:text-sm font-bold dark:text-white text-[#292633] truncate max-w-[110px] 2xs:max-w-[150px] xs:max-w-[220px] sm:max-w-md">
            {conversation.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] text-xs font-semibold dark:text-white text-[#292633] transition cursor-pointer"
            title="Copy share link"
          >
            {copied ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Share2 size={13} />}
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] text-xs font-semibold dark:text-white text-[#292633] transition cursor-pointer"
            title="Export conversation"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            href="/chat-ui"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-xs font-bold text-white shadow-md transition"
          >
            <Sparkles size={13} />
            <span className="hidden xs:inline">Open in Nyra</span>
            <span className="xs:hidden">App</span>
          </Link>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 space-y-6">
        <div className="rounded-2xl border dark:border-white/10 border-[#E8E4EF] dark:bg-[#0A0C14] bg-white p-3.5 sm:p-4 mb-6 flex items-center justify-between text-xs dark:text-white/70 text-[#686477] shadow-sm">
          <div>
            <p className="font-bold dark:text-white text-[#292633] mb-0.5">{conversation.title}</p>
            <p className="text-[11px] dark:text-white/40 text-[#686477]">
              Shared on {new Date(conversation.createdAt).toLocaleDateString()} &bull; Read-only view
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full dark:bg-purple-500/20 bg-purple-100 border dark:border-purple-500/30 border-purple-200 text-[10px] font-mono dark:text-purple-300 text-purple-700">
            Public Share
          </span>
        </div>

        {conversation.messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              {!isUser && (
                <div className="w-7 h-7 shrink-0 mr-2 sm:mr-3 mt-1 rounded-xl bg-gradient-to-br from-[#8B6FC9] to-[#7E9AC7] flex items-center justify-center text-[11px] font-bold shadow-sm text-white">
                  ✦
                </div>
              )}

              <div className="relative group max-w-[92%] sm:max-w-[85%] md:max-w-[82%]">
                <div className={`mb-1.5 flex items-center gap-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs font-semibold dark:text-white/80 text-[#292633]">{isUser ? 'User' : '✦ Nyra'}</span>
                  {!isUser && msg.modelId && (
                    <span className="px-1.5 py-0.5 rounded-md dark:bg-white/5 bg-[#F5F3F9] border dark:border-white/10 border-[#E8E4EF] text-[9px] dark:text-purple-300 text-purple-700 font-mono">
                      {msg.modelId.split('/').pop() || msg.modelId}
                    </span>
                  )}
                  <span
                    className="text-[10px] dark:text-white/40 text-[#686477] font-mono"
                    title={getFullTimestamp(msg.timestamp || Date.now())}
                  >
                    {getRelativeTime(msg.timestamp || Date.now())}
                  </span>
                </div>

                {isUser ? (
                  <div className="rounded-[20px] px-4 py-3 text-[14px] leading-relaxed dark:bg-[#1E1B2E] bg-[#EAE5F5] dark:text-white text-[#292633] shadow-sm border dark:border-white/10 border-[#DDD7EB]">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="text-[14.5px] leading-relaxed dark:text-slate-100 text-[#292633] font-normal">
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
                            <code className="dark:bg-white/10 bg-[#F5F3F9] dark:text-purple-300 text-purple-700 px-1.5 py-0.5 rounded font-mono text-xs border dark:border-white/10 border-[#E8E4EF]" {...rest}>
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
