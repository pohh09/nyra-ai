'use client';

import React, { useEffect, useRef, useState, Fragment } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import StreamingText from './StreamingText';
import {
  Pencil,
  Copy,
  RotateCcw,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Star,
  Brain,
  ChevronDown,
  GitBranch,
  Sparkles,
  Wand2,
  FileText,
  HelpCircle,
  Code2,
  Languages,
  AlertCircle,
  RefreshCw,
  VolumeX,
  CheckSquare,
  Bug,
  Zap,
  GitCompare,
  Search,
  Globe,
  Cpu,
  Layers,
  ZoomIn,
  X,
  MoreHorizontal,
} from 'lucide-react';

import CodeBlock from './CodeBlock';
import WebSearchCard from './WebSearchCard';
import SuggestedFollowUps from './SuggestedFollowUps';
import { WebSource, FileAttachment, ToolCallRecord } from '@/lib/types';
import { getRelativeTime, getFullTimestamp } from '@/lib/formatTimestamp';



type Props = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  images?: string[];
  pdfName?: string;
  pdfPages?: number;
  attachments?: FileAttachment[];
  timestamp?: number;
  isLast: boolean;
  loading: boolean;
  streaming?: boolean;
  isGrouped: boolean;
  thinking?: boolean;
  thinkingText?: string;
  sources?: WebSource[];
  suggestedFollowUps?: string[];
  toolCalls?: ToolCallRecord[];
  isBookmarked?: boolean;
  status?: 'sent' | 'streaming' | 'error';
  modelId?: string;
  isSpeaking?: boolean;
  searchQuery?: string;
  hideFollowUps?: boolean;
  onSpeak?: () => void;
  onStopSpeak?: () => void;
  onToggleBookmark?: (id: string) => void;
  onSelectFollowUp?: (prompt: string) => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onEdit?: (id: string, value: string) => void;
  onBranch?: (id: string) => void;
  onSmartAction?: (actionPrompt: string) => void;
};

function highlightMatchedText(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-amber-400/35 text-amber-100 font-semibold px-1 py-0.5 rounded border border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.35)]"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

function highlightChildren(children: React.ReactNode, query?: string): React.ReactNode {
  if (!query || !query.trim()) return children;
  if (typeof children === 'string') {
    return highlightMatchedText(children, query);
  }
  if (Array.isArray(children)) {
    return children.map((child, idx) => (
      <Fragment key={idx}>{highlightChildren(child, query)}</Fragment>
    ));
  }
  return children;
}

export default function MessageBubble({
  id,
  role,
  content,
  image,
  images,
  pdfName,
  pdfPages,
  attachments,
  timestamp,
  isLast,
  loading,
  streaming,
  isGrouped,
  thinking,
  thinkingText,
  sources,
  suggestedFollowUps,
  toolCalls,
  isBookmarked,
  status,
  modelId,
  isSpeaking,
  searchQuery,
  hideFollowUps,
  onSpeak,
  onStopSpeak,
  onToggleBookmark,
  onSelectFollowUp,
  onRegenerate,
  onContinue,
  onEdit,
  onBranch,
  onSmartAction,
}: Props) {
  const isUser = role === 'user';

  const [editing, setEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(content);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEditingValue(content);
  }, [content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(56, Math.min(textareaRef.current.scrollHeight, 320))}px`;
    }
  }, [editing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleSaveEdit = () => {
    if (id && onEdit && editingValue.trim()) {
      onEdit(id, editingValue.trim());
      setEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditingValue(content);
  };

  const handleEditTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.max(56, Math.min(e.target.scrollHeight, 320))}px`;
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const displayContent = content;

  // Check if response is an error message
  const isErrorMessage =
    status === 'error' ||
    content.startsWith('✦ Error') ||
    content.startsWith('Error:') ||
    content.includes('hit a snag') ||
    content.toLowerCase().includes('document or request is too large');

  // Extract inline sources if present
  let parsedSources: WebSource[] = sources || [];

  if (content.includes('__SOURCES__')) {
    const parts = content.split('__SOURCES__');
    try {
      parsedSources = JSON.parse(parts[1].trim());
    } catch (e) { }
  }

  // Context-Aware Action Detection
  const isCode = content.includes('```') || /function |const |import |class |def |export |async |interface |<[A-Z]\w+/i.test(content);
  const isDocument = Boolean(pdfName || (attachments && attachments.some((a) => a.type === 'pdf')) || /attached document|\[document|\.pdf|resume|cv|candidate profile/i.test(content));
  const isResearch = Boolean((parsedSources && parsedSources.length > 0) || /\[\d+\]/i.test(content) || /search results|sources:|citations|tavily/i.test(content));

  const contextualActionGroup = isCode
    ? {
      label: 'Code Actions',
      icon: <Code2 size={12} className="text-purple-400" />,
      actions: [
        { id: 'explain', label: 'Explain Logic', desc: 'Step-by-step code breakdown', icon: HelpCircle, prompt: `Explain how the following code works step by step in detail:\n\n"${displayContent}"` },
        { id: 'improve', label: 'Improve & Clean', desc: 'Clean code & modern best practices', icon: Wand2, prompt: `Improve and refactor this code following modern clean code best practices and strict typings:\n\n"${displayContent}"` },
        { id: 'debug', label: 'Debug Edge Cases', desc: 'Find runtime bugs & memory leaks', icon: Bug, prompt: `Review this code thoroughly for potential runtime bugs, race conditions, and memory leaks:\n\n"${displayContent}"` },
        { id: 'optimize', label: 'Optimize Speed', desc: 'Execution speed & memory usage', icon: Zap, prompt: `Optimize this implementation for maximum runtime performance and execution speed:\n\n"${displayContent}"` },
        { id: 'convert', label: 'Convert to Module', desc: 'Reusable TypeScript hook/class', icon: Cpu, prompt: `Convert this code into a reusable, production-ready modular TypeScript hook or service:\n\n"${displayContent}"` },
      ],
    }
    : isDocument
      ? {
        label: 'Doc Actions',
        icon: <FileText size={12} className="text-rose-400" />,
        actions: [
          { id: 'doc-summarize', label: 'Summarize Document', desc: 'Structured executive summary', icon: FileText, prompt: `Provide a structured executive summary of the attached document findings:\n\n"${displayContent}"` },
          { id: 'doc-keypoints', label: 'Extract Key Points', desc: 'Bullet list of core insights', icon: Sparkles, prompt: `Extract the most critical key points and insights from this document into a concise list:\n\n"${displayContent}"` },
          { id: 'doc-questions', label: 'Ask Critical Questions', desc: '3 high-value analytical questions', icon: HelpCircle, prompt: `What are the 3 most important analytical questions to ask based on this document?\n\n"${displayContent}"` },
          { id: 'doc-checklist', label: 'Create Checklist', desc: 'Actionable step-by-step checklist', icon: CheckSquare, prompt: `Create an actionable step-by-step checklist based on this document:\n\n"${displayContent}"` },
          { id: 'doc-compare', label: 'Compare Findings', desc: 'Analyze sections & trade-offs', icon: GitCompare, prompt: `Compare the core arguments, methodologies, or data sections in this document:\n\n"${displayContent}"` },
        ],
      }
      : isResearch
        ? {
          label: 'Research Actions',
          icon: <Globe size={12} className="text-purple-400" />,
          actions: [
            { id: 'res-summarize', label: 'Summarize Sources', desc: 'Consensus across web results', icon: Globe, prompt: `Summarize the key consensus and findings across these web sources:\n\n"${displayContent}"` },
            { id: 'res-compare', label: 'Compare Findings', desc: 'Differing viewpoints & data', icon: GitCompare, prompt: `Compare the differing perspectives and evidence among these cited sources:\n\n"${displayContent}"` },
            { id: 'res-evidence', label: 'Find More Evidence', desc: 'Search additional empirical data', icon: Search, prompt: `Search for more empirical evidence, supporting statistics, and recent data on this topic:\n\n"${displayContent}"` },
            { id: 'res-report', label: 'Create Brief Report', desc: 'Comprehensive synthesized brief', icon: FileText, prompt: `Synthesize a comprehensive structured report based on these research results:\n\n"${displayContent}"` },
            { id: 'res-save', label: 'Save Key Takeaways', desc: 'Workspace takeaway notes', icon: Layers, prompt: `Summarize the core findings into clean, concise takeaway notes for my workspace:\n\n"${displayContent}"` },
          ],
        }
        : {
          label: 'Smart Actions',
          icon: <Sparkles size={12} className="text-purple-400" />,
          actions: [
            { id: 'summarize', label: 'Summarize', desc: 'High-level bullet points', icon: FileText, prompt: `Please provide a concise, high-level summary of the following response with bullet points:\n\n"${displayContent}"` },
            { id: 'simplify', label: 'Simplify for Beginner', desc: 'Clear elementary explanation', icon: HelpCircle, prompt: `Explain the following response in simple terms that a beginner can easily understand:\n\n"${displayContent}"` },
            { id: 'expand', label: 'Expand with Examples', desc: 'Real-world practical cases', icon: Wand2, prompt: `Expand in detail on this response with real-world examples and practical edge cases:\n\n"${displayContent}"` },
            { id: 'rewrite', label: 'Executive Tone', desc: 'Polished professional prose', icon: Languages, prompt: `Rewrite this response into a polished, professional, publication-grade executive tone:\n\n"${displayContent}"` },
            { id: 'code', label: 'Generate Code', desc: 'Production TypeScript snippet', icon: Code2, prompt: `Generate complete, production-ready implementation code with TypeScript types based on this:\n\n"${displayContent}"` },
          ],
        };

  const handleTriggerAction = (actionPrompt: string) => {
    setShowMoreMenu(false);
    if (!onSmartAction) return;
    onSmartAction(actionPrompt);
  };

  // Aggregate images
  const allImages: string[] = [];
  if (image) allImages.push(image);
  if (images && Array.isArray(images)) {
    images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} py-2 md:py-2.5`}
      >
        {isUser ? (
          /* =========================================================
             USER MESSAGE ROW (ChatGPT Style: Standalone attachments + Text Bubble)
          ========================================================= */
          <div className={`flex flex-col items-end ${editing ? 'w-full max-w-full sm:max-w-xl md:max-w-2xl' : 'max-w-[85%] sm:max-w-[75%]'} group`}>
            {/* STANDALONE IMAGE ATTACHMENTS (No enclosing bubble) */}
            {allImages.length > 0 && (
              <div className={`flex flex-wrap justify-end gap-2.5 ${content && content.trim().length > 0 ? 'mb-2' : ''}`}>
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImg(img)}
                    className="group/img relative rounded-2xl overflow-hidden border border-[#E8E4EF] dark:border-purple-400/25 bg-[#F5F3F9] dark:bg-[#130f24] shadow-md dark:shadow-lg dark:shadow-purple-950/40 cursor-pointer transition-all duration-200 hover:border-[#8B6FC9]/50 dark:hover:border-purple-400/50"
                  >
                    <div className="relative w-44 h-36 sm:w-56 sm:h-44">
                      <Image
                        src={img}
                        alt={`Attached Media ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-[#292633]/20 dark:bg-purple-950/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white">
                        <ZoomIn size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STANDALONE PDF & DOCUMENT ATTACHMENTS (No enclosing bubble) */}
            {attachments && attachments.length > 0 ? (
              <div className={`flex flex-col items-end gap-2 ${content && content.trim().length > 0 ? 'mb-2' : ''}`}>
                {attachments
                  .filter((att) => att.type === 'pdf' || att.name?.endsWith('.pdf'))
                  .map((att, idx) => (
                    <div
                      key={att.id || idx}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24]/90 hover:bg-[#F5F3F9] dark:hover:bg-[#1a1433] shadow-sm dark:shadow-md backdrop-blur-xl transition-all max-w-[280px] sm:max-w-[340px]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-[#292633] dark:text-white truncate" title={att.name}>{att.name}</p>
                        <p className="text-[10px] text-[#686477] dark:text-slate-400 font-mono mt-0.5">
                          {att.pages ? `${att.pages} pages` : 'Document'} {att.size ? `• ${(att.size / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : pdfName ? (
              <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24]/90 hover:bg-[#F5F3F9] dark:hover:bg-[#1a1433] shadow-sm dark:shadow-md backdrop-blur-xl transition-all max-w-[280px] sm:max-w-[340px] ${content && content.trim().length > 0 ? 'mb-2' : ''}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[#292633] dark:text-white truncate" title={pdfName}>{pdfName}</p>
                  <p className="text-[10px] text-[#686477] dark:text-slate-400 font-mono mt-0.5">{pdfPages} pages • Document</p>
                </div>
              </div>
            ) : null}

            {/* USER TEXT SPEECH BUBBLE / CHATGPT STYLE INLINE EDITOR */}
            {editing ? (
              <div className="w-full chat-edit-box rounded-2xl sm:rounded-[22px] p-3.5 sm:p-4 transition-all">
                <textarea
                  ref={textareaRef}
                  value={editingValue}
                  onChange={handleEditTextareaChange}
                  onKeyDown={handleEditKeyDown}
                  rows={Math.max(2, Math.min(8, editingValue.split('\n').length))}
                  className="w-full resize-none bg-transparent outline-none text-[14.5px] sm:text-[15.5px] leading-relaxed select-text placeholder-[#92909B] dark:placeholder-slate-400 font-normal focus:ring-0 text-[#292633] dark:text-white"
                  placeholder="Edit your message..."
                />
                <div className="flex items-center justify-end gap-2 mt-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="chat-edit-cancel-btn px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!editingValue.trim()}
                    onClick={handleSaveEdit}
                    className="chat-edit-send-btn disabled:opacity-40 disabled:cursor-not-allowed px-4.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : content && content.trim().length > 0 ? (
              <div className="chat-user-bubble chat-message-text rounded-[22px] rounded-br-[6px] px-4 sm:px-5 py-3 text-[#292633] dark:text-slate-100 leading-relaxed transition-all duration-200 shadow-sm">
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            ) : null}

            {/* USER HOVER ACTIONS (ChatGPT style subtle toolbar) */}
            {!editing && (
              <div className="mt-1.5 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 px-0.5">
                <span
                  className="text-[10px] sm:text-[10.5px] text-[#686477] dark:text-slate-400 font-mono select-none mr-1"
                  title={getFullTimestamp(timestamp || Date.now())}
                >
                  {getRelativeTime(timestamp || Date.now())}
                </span>
                {content && content.trim().length > 0 && (
                  <button
                    title="Edit message"
                    aria-label="Edit message"
                    onClick={() => setEditing(true)}
                    className="h-7 w-7 rounded-lg text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 active:scale-90 transition flex items-center justify-center cursor-pointer"
                  >
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                )}
                {content && content.trim().length > 0 && (
                  <button
                    title="Copy message"
                    aria-label="Copy message"
                    onClick={handleCopy}
                    className="h-7 w-7 rounded-lg text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 active:scale-90 transition flex items-center justify-center cursor-pointer"
                  >
                    {copied ? (
                      <Check size={13} strokeWidth={2.5} className="text-[#6FA58A] dark:text-emerald-400 animate-in zoom-in-75 duration-150" />
                    ) : (
                      <Copy size={13} strokeWidth={1.75} />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================
             ASSISTANT MESSAGE ROW (ChatGPT Structure + Nyra Theme)
          ========================================================= */
          <div className="w-full flex items-start gap-2.5 sm:gap-3.5 group">
            {/* AVATAR COLUMN (Fixed on Left) */}
            <div className="shrink-0 pt-0.5 select-none">
              <div className="h-6 w-6 sm:h-7.5 sm:w-7.5 rounded-full bg-gradient-to-br from-[#E52A83] via-[#B31372] to-[#800F52] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shadow-sm transition-transform duration-200 hover:scale-105 cursor-default">
                ✦
              </div>
            </div>

            {/* ASSISTANT CONTENT COLUMN (Remaining Width Flow) */}
            <div className="flex-1 min-w-0 flex flex-col chat-assistant-container">
              {/* ASSISTANT HEADER */}
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[12px] sm:text-xs font-semibold text-[#261827] dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>Nyra</span>
                  {streaming && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E52A83] dark:bg-pink-400 animate-pulse" />
                  )}
                </span>
                <span
                  className="text-[10px] sm:text-[10.5px] text-[#6E6072] dark:text-slate-400 font-mono select-none"
                  title={getFullTimestamp(timestamp || Date.now())}
                >
                  {getRelativeTime(timestamp || Date.now())}
                </span>
              </div>

              {/* MAIN AI RESPONSE BODY */}
              <div className="w-full text-[14.5px] sm:text-[15.5px] leading-[1.68] sm:leading-[1.75] text-[#261827] dark:text-[#f1eff7] chat-assistant-body">
                {/* PDF Context Info if any */}
                {pdfName && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#E8E4EF] dark:border-pink-500/30 bg-[#F7F3FA] dark:bg-[#16091F] px-3 py-1.5 text-[#6E6072] dark:text-pink-200 text-xs shadow-sm max-w-full truncate">
                    <span>📄</span>
                    <span className="font-medium text-[#261827] dark:text-pink-100 truncate">{pdfName}</span>
                    <span className="text-[10.5px] text-[#9E93A2] dark:text-slate-400 shrink-0">({pdfPages} pages loaded)</span>
                  </div>
                )}

                {/* WEB SOURCES CITATIONS */}
                {parsedSources.length > 0 && <WebSearchCard sources={parsedSources} />}

                {/* ERROR STATE */}
                {status === 'error' && (
                  <div className="my-2 p-3 sm:p-3.5 rounded-xl border border-[#C77B7B]/30 bg-[#F9ECEC] dark:bg-rose-950/40 text-xs text-[#A85A5A] dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-[#C77B7B] dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[13px] text-[#A85A5A] dark:text-rose-200">Hmm, Nyra hit a snag.</p>
                        <p className="text-[11.5px] opacity-90 mt-0.5">Response generation encountered a network or model issue.</p>
                      </div>
                    </div>
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C77B7B]/15 hover:bg-[#C77B7B]/25 text-[#A85A5A] dark:text-rose-200 font-semibold text-xs border border-[#C77B7B]/30 transition active:scale-95 cursor-pointer shrink-0 self-end sm:self-auto"
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                )}

                {/* AI TOOL CALL BADGES */}
                {toolCalls && toolCalls.length > 0 && (
                  <div className="mb-2.5 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-400/30 text-xs text-[#B31372] dark:text-pink-200 shadow-sm backdrop-blur-sm"
                      >
                        <Sparkles size={12} className="text-[#E52A83] dark:text-pink-300 animate-pulse shrink-0" />
                        <span className="font-bold text-[#261827] dark:text-white uppercase text-[9.5px] sm:text-[10px] font-mono">Action:</span>
                        <span className="truncate max-w-[200px] sm:max-w-none">{tc.message || `Executed ${tc.name}`}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* MARKDOWN STREAMING TEXT */}
                {displayContent ? (
                  <StreamingText streaming={loading && isLast}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!match) {
                            return (
                              <code className="chat-inline-code bg-[#F4DCE9] dark:bg-[#1E0B2B] text-[#B31372] dark:text-pink-200 border border-[#E8E4EF] dark:border-pink-500/25 px-1.5 py-0.5 rounded-md font-mono text-[12.5px] sm:text-[13px] font-normal break-all sm:break-normal">
                                {highlightChildren(children, searchQuery)}
                              </code>
                            );
                          }
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                              onCodeAction={onSmartAction}
                            />
                          );
                        },
                        p({ children }) {
                          return <p className="chat-message-text chat-markdown-p mb-3 sm:mb-4 last:mb-0 text-[#261827] dark:text-[#f1eff7] leading-[1.68] sm:leading-[1.75] transition-all duration-200 break-words">{highlightChildren(children, searchQuery)}</p>;
                        },
                        h1({ children }) {
                          return <h1 className="chat-markdown-h1 text-lg sm:text-2xl font-bold text-[#261827] dark:text-white mt-4 sm:mt-5 mb-2 sm:mb-2.5 tracking-tight">{highlightChildren(children, searchQuery)}</h1>;
                        },
                        h2({ children }) {
                          return <h2 className="chat-markdown-h2 text-base sm:text-xl font-bold text-[#261827] dark:text-white mt-3.5 sm:mt-4 mb-1.5 sm:mb-2 tracking-tight">{highlightChildren(children, searchQuery)}</h2>;
                        },
                        h3({ children }) {
                          return <h3 className="chat-markdown-h3 text-[14.5px] sm:text-lg font-semibold text-[#B31372] dark:text-pink-200 mt-3 sm:mt-3.5 mb-1 sm:mb-1.5">{highlightChildren(children, searchQuery)}</h3>;
                        },
                        ul({ children }) {
                          return <ul className="list-disc pl-4.5 sm:pl-6 my-2.5 sm:my-3 space-y-1 sm:space-y-1.5 text-[#261827] dark:text-[#f1eff7]">{children}</ul>;
                        },
                        ol({ children }) {
                          return <ol className="list-decimal pl-4.5 sm:pl-6 my-2.5 sm:my-3 space-y-1 sm:space-y-1.5 text-[#261827] dark:text-[#f1eff7]">{children}</ol>;
                        },
                        li({ children }) {
                          return <li className="chat-message-text chat-markdown-li leading-[1.65] sm:leading-[1.7] pl-0.5 transition-all duration-200 text-[#261827] dark:text-[#f1eff7]">{highlightChildren(children, searchQuery)}</li>;
                        },
                        a({ href, children }) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#B31372] hover:text-[#9E1064] dark:text-pink-400 dark:hover:text-pink-300 underline underline-offset-2 font-medium transition-colors"
                            >
                              {highlightChildren(children, searchQuery)}
                            </a>
                          );
                        },
                        blockquote({ children }) {
                          return (
                            <blockquote className="chat-blockquote border-l-[3px] border-[#B31372] dark:border-pink-500 pl-3 sm:pl-4 py-1 sm:py-1.5 my-2.5 sm:my-3 text-[#6E6072] dark:text-pink-200/90 italic bg-[#B31372]/5 dark:bg-pink-500/5 rounded-r-lg">
                              {highlightChildren(children, searchQuery)}
                            </blockquote>
                          );
                        },
                        table({ children }) {
                          return (
                            <div className="chat-table-wrapper overflow-x-auto my-3 sm:my-4 rounded-xl border border-[#E8E4EF] dark:border-pink-500/25 bg-[#FFFFFF] dark:bg-[#0E0514] shadow-sm -mx-0.5 sm:mx-0 touch-pan-x">
                              <table className="w-full text-left border-collapse">{children}</table>
                            </div>
                          );
                        },
                        th({ children }) {
                          return <th className="chat-table-th border-b border-[#E8E4EF] dark:border-pink-500/25 bg-[#F7F3FA] dark:bg-[#16091F] px-3.5 sm:px-4 py-2 sm:py-2.5 font-semibold text-[#261827] dark:text-pink-100 whitespace-nowrap">{children}</th>;
                        },
                        td({ children }) {
                          return <td className="chat-table-td border-b border-[#F0EDF5] dark:border-pink-500/15 px-3.5 sm:px-4 py-2 sm:py-2.5 text-[#261827] dark:text-[#f1eff7]">{children}</td>;
                        },
                      }}
                    >
                      {displayContent}
                    </ReactMarkdown>
                  </StreamingText>
                ) : loading ? (
                  <div className="flex items-center gap-2 py-1.5 select-none animate-[fadeIn_0.15s_ease-out]">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52A83]/50 dark:bg-pink-400/50 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E52A83] dark:bg-pink-400 shadow-[0_0_8px_rgba(229,42,131,0.8)] chatgpt-thinking-dot" />
                    </span>
                    <span className="text-[13px] sm:text-[14px] text-[#7A6E8C] dark:text-pink-300/70 font-medium tracking-tight">
                      {thinkingText || 'Thinking...'}
                    </span>
                  </div>
                ) : null}

                {/* SUGGESTED FOLLOW UP PILLS (Only for non-error completed response) */}
                {!isErrorMessage && !isUser && isLast && !loading && !streaming && !hideFollowUps && suggestedFollowUps && suggestedFollowUps.length > 0 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <SuggestedFollowUps followUps={suggestedFollowUps} onSelect={onSelectFollowUp} />
                  </div>
                )}

                {/* ASSISTANT ACTION TOOLBAR (Redesigned Modern ChatGPT Style Icon Row) */}
                {!editing && displayContent && !isErrorMessage && (
                  <div className="mt-3 flex items-center gap-1 sm:gap-1.5 text-[#686477] dark:text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity duration-150 animate-[fadeIn_0.25s_ease-out] -ml-1 select-none flex-wrap">
                    {/* Copy Button */}
                    <button
                      title={copied ? "Copied to clipboard" : "Copy response"}
                      aria-label="Copy response"
                      onClick={handleCopy}
                      className={`h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                        copied
                          ? 'text-[#6FA58A] dark:text-emerald-400 bg-[#6FA58A]/15 dark:bg-emerald-500/20'
                          : 'text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15'
                      }`}
                    >
                      {copied ? (
                        <Check size={14} strokeWidth={2.5} className="animate-in zoom-in-75 duration-150" />
                      ) : (
                        <Copy size={14} strokeWidth={1.75} />
                      )}
                    </button>

                    {/* Like Button */}
                    <button
                      title="Good response"
                      aria-label="Good response"
                      onClick={handleLike}
                      className={`h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                        liked
                          ? 'text-[#6FA58A] bg-[#6FA58A]/15 dark:text-emerald-400 dark:bg-emerald-500/20 shadow-xs'
                          : 'text-[#686477] dark:text-slate-400 hover:text-[#6FA58A] dark:hover:text-emerald-400 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15'
                      }`}
                    >
                      <ThumbsUp size={14} strokeWidth={1.75} className={liked ? 'fill-current' : ''} />
                    </button>

                    {/* Dislike Button */}
                    <button
                      title="Poor response"
                      aria-label="Poor response"
                      onClick={handleDislike}
                      className={`h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                        disliked
                          ? 'text-[#C77B7B] bg-[#C77B7B]/15 dark:text-rose-400 dark:bg-rose-500/20 shadow-xs'
                          : 'text-[#686477] dark:text-slate-400 hover:text-[#C77B7B] dark:hover:text-rose-400 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15'
                      }`}
                    >
                      <ThumbsDown size={14} strokeWidth={1.75} className={disliked ? 'fill-current' : ''} />
                    </button>

                    {/* Read Aloud / Stop Speaking Button */}
                    {!loading && !streaming && (
                      isSpeaking ? (
                        <button
                          aria-label="Stop reading response"
                          title="Stop reading response"
                          onClick={onStopSpeak}
                          className="h-8 px-2.5 rounded-lg border border-[#8B6FC9]/40 bg-[#EEE8FA] dark:border-purple-400/50 dark:bg-purple-500/20 flex items-center gap-1.5 text-[11.5px] text-[#8B6FC9] dark:text-purple-300 font-medium transition active:scale-90 cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 h-3 bg-[#8B6FC9] dark:bg-purple-300 rounded-full animate-pulse" />
                            <span className="w-0.5 h-2 bg-[#8B6FC9] dark:bg-purple-300 rounded-full animate-pulse delay-75" />
                            <span className="w-0.5 h-3 bg-[#8B6FC9] dark:bg-purple-300 rounded-full animate-pulse delay-150" />
                          </div>
                          <span>Speaking</span>
                        </button>
                      ) : onSpeak ? (
                        <button
                          aria-label="Read response aloud"
                          title="Read response aloud"
                          onClick={onSpeak}
                          className="h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                        >
                          <Volume2 size={14} strokeWidth={1.75} />
                        </button>
                      ) : null
                    )}

                    {/* Regenerate Button */}
                    {onRegenerate && (
                      <button
                        aria-label="Regenerate response"
                        title="Regenerate response"
                        onClick={onRegenerate}
                        className="h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer group/regen"
                      >
                        <RotateCcw size={14} strokeWidth={1.75} className="group-hover/regen:-rotate-45 transition-transform duration-200" />
                      </button>
                    )}

                    {/* More Options Menu (ChatGPT Style '...' Popover) */}
                    <div className="relative" ref={moreMenuRef}>
                      <button
                        title="More actions"
                        aria-label="More actions"
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`h-8 w-8 sm:h-7.5 sm:w-7.5 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
                          showMoreMenu
                            ? 'bg-[#EEE8FA] dark:bg-purple-500/25 text-[#292633] dark:text-white'
                            : 'text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-purple-500/15'
                        }`}
                      >
                        <MoreHorizontal size={15} strokeWidth={1.75} />
                      </button>

                      {showMoreMenu && (
                        <div className="absolute bottom-9 left-0 w-56 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF]/98 dark:bg-[#130f24]/98 shadow-xl p-1.5 z-50 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl">
                          {/* Branch */}
                          {id && onBranch && (
                            <button
                              onClick={() => {
                                setShowMoreMenu(false);
                                onBranch(id);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
                            >
                              <GitBranch size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                              <span>Branch conversation</span>
                            </button>
                          )}

                          {/* Bookmark */}
                          {onToggleBookmark && id && (
                            <button
                              onClick={() => {
                                setShowMoreMenu(false);
                                onToggleBookmark(id);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
                            >
                              <Star size={13} className={isBookmarked ? 'fill-[#8B6FC9] text-[#8B6FC9] dark:fill-purple-400 dark:text-purple-400' : 'text-[#8B6FC9] dark:text-purple-400'} />
                              <span>{isBookmarked ? 'Remove bookmark' : 'Bookmark response'}</span>
                            </button>
                          )}

                          {/* Continue Generating */}
                          {onContinue && !loading && !streaming && (
                            <button
                              onClick={() => {
                                setShowMoreMenu(false);
                                onContinue();
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
                            >
                              <Sparkles size={13} className="text-[#8B6FC9] dark:text-purple-300" />
                              <span>Continue generating</span>
                            </button>
                          )}

                          {/* Smart Actions Sub-items */}
                          {onSmartAction && (
                            <>
                              <div className="h-[1px] bg-[#E8E4EF] dark:bg-white/[0.08] my-1" />
                              <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#686477] dark:text-slate-400 font-mono">
                                {contextualActionGroup.label}
                              </div>
                              {contextualActionGroup.actions.map((act) => {
                                const IconComp = act.icon;
                                return (
                                  <button
                                    key={act.id}
                                    onClick={() => {
                                      setShowMoreMenu(false);
                                      handleTriggerAction(act.prompt);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 text-[#292633] dark:text-slate-200 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
                                  >
                                    <IconComp size={12} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />
                                    <span className="truncate">{act.label}</span>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* FULLSCREEN LIGHTBOX FOR ATTACHED IMAGES */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#8B6FC9]/30 shadow-2xl bg-black"
            >
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
              <img src={lightboxImg} alt="Enlarged user attachment" className="max-w-full max-h-[80vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
