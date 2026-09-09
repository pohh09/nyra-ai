'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  X,
  Loader2,
  Send,
  Copy,
  Check,
  HelpCircle,
  BookOpen,
  FileCheck,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getIndexedDocuments,
  indexDocument,
  deleteDocument,
  searchSimilarChunks,
  formatChunksForRAGPrompt,
  extractTargetPageNumbers,
  SearchResultChunk,
} from '@/lib/services/ragService';
import { extractPdfText } from '@/lib/extractPdfText';
import { DocumentRecord } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

const EXAMPLE_QUESTIONS = [
  '✨ Give me a 3-bullet point summary',
  '🔍 What are the most important takeaways?',
  '📋 What action items or key dates are mentioned?',
  '💡 Explain this document to me in simple terms',
];

export default function DocumentsPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Question & Answer state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [retrievedSources, setRetrievedSources] = useState<SearchResultChunk[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const docs = getIndexedDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !selectedDocId) {
      setSelectedDocId(docs[0].id);
    }

    const handleUpdate = (e: any) => {
      const updated = e.detail || getIndexedDocuments();
      setDocuments(updated);
    };
    window.addEventListener('nyra_docs_updated', handleUpdate);
    return () => window.removeEventListener('nyra_docs_updated', handleUpdate);
  }, []);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0] || null;
  }, [documents, selectedDocId]);

  const filteredDocs = useMemo(() => {
    if (!searchDocQuery.trim()) return documents;
    const q = searchDocQuery.toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [documents, searchDocQuery]);

  // Clean raw answer string (stripping accidental repeated [Page X] markers or raw metadata)
  const cleanedAnswer = useMemo(() => {
    if (!answer) return '';
    return answer
      .replace(/\[Page\s*\d+(?:\s*of\s*\d+)?\]/gi, '')
      .replace(/\n##\s*Source[\s\S]*$/i, '')
      .trim();
  }, [answer]);

  // Split content for collapsible detailed explanation
  const { hasDetailSection, primaryContent, detailedContent } = useMemo(() => {
    if (!cleanedAnswer) return { hasDetailSection: false, primaryContent: '', detailedContent: '' };

    const detailHeaderRegex = /\n(?=##\s*(?:Important Details|Additional Details|Details|Deep Dive|Further Context))/i;
    if (detailHeaderRegex.test(cleanedAnswer)) {
      const parts = cleanedAnswer.split(detailHeaderRegex);
      return {
        hasDetailSection: true,
        primaryContent: parts[0].trim(),
        detailedContent: parts.slice(1).join('\n\n').trim(),
      };
    }

    const sectionParts = cleanedAnswer.split(/\n(?=##\s+)/);
    if (sectionParts.length > 2 && cleanedAnswer.length > 700) {
      return {
        hasDetailSection: true,
        primaryContent: sectionParts.slice(0, 2).join('\n\n').trim(),
        detailedContent: sectionParts.slice(2).join('\n\n').trim(),
      };
    }

    return { hasDetailSection: false, primaryContent: cleanedAnswer, detailedContent: '' };
  }, [cleanedAnswer]);

  // Handle File Upload & Reading
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadMessage(`Reading "${file.name}"...`);

    try {
      let extracted = '';
      let pages = 1;
      let pageMap: any[] | undefined = undefined;

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const result = await extractPdfText(file);
        extracted = result.text;
        pages = result.pages;
        pageMap = result.pageMap;
      } else {
        extracted = await file.text();
        pages = Math.max(1, Math.ceil(extracted.length / 2000));
      }

      if (!extracted || extracted.trim().length === 0) {
        throw new Error('No readable text found in this file. Please make sure it is not a scanned image.');
      }

      setUploadMessage('Processing document knowledge & building page index...');

      const result = indexDocument({
        name: file.name,
        size: file.size,
        text: extracted,
        pages,
        pageMap,
      });

      const updatedDocs = getIndexedDocuments();
      setDocuments(updatedDocs);
      setSelectedDocId(result.document.id);

      addToast({
        type: 'success',
        title: `Ready! "${file.name}" (${pages} pages) indexed for search.`,
      });
      setAnswer(null);
      setQuestion('');
      setIsExpanded(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: `Upload failed: ${err.message || 'Could not read document'}`,
      });
    } finally {
      setIsUploading(false);
      setUploadMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, name: string) => {
    deleteDocument(id);
    const updated = getIndexedDocuments();
    setDocuments(updated);
    if (selectedDocId === id) {
      setSelectedDocId(updated[0]?.id || null);
    }
    setAnswer(null);
    setIsExpanded(false);
    addToast({ type: 'info', title: `Removed "${name}"` });
  };

  // Ask Question based on document
  const handleAskQuestion = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    if (!activeDoc && documents.length === 0) {
      addToast({ type: 'info', title: 'Please upload a document first' });
      return;
    }

    setIsAnswering(true);
    setAnswer('');
    setQuestion(q);
    setIsExpanded(false);

    try {
      const targetPages = extractTargetPageNumbers(q);

      // Find relevant sections in document (Exact page retrieval for page queries, or hybrid semantic for general queries)
      const matchingPassages = searchSimilarChunks(q, {
        documentId: activeDoc ? activeDoc.id : undefined,
        document: activeDoc || undefined,
        topK: 6,
      });

      setRetrievedSources(matchingPassages);

      if (matchingPassages.length === 0) {
        setIsAnswering(false);
        if (targetPages.length > 0) {
          const pageStr = targetPages.join(', ');
          const maxPages = activeDoc?.pages || 1;
          const isOutOfBounds = targetPages.some((p) => p > maxPages);
          if (isOutOfBounds) {
            setAnswer(`Page ${pageStr} was not found in "${activeDoc?.name || 'this document'}" (this document only has ${maxPages} page${maxPages > 1 ? 's' : ''}).`);
          } else {
            setAnswer(`Page ${pageStr} is present in "${activeDoc?.name || 'this document'}", but contains no readable text (it may be a scanned image or empty page).`);
          }
        } else {
          setAnswer(`The document "${activeDoc?.name || 'selected'}" does not contain relevant information answering this question.`);
        }
        return;
      }

      const documentContext = formatChunksForRAGPrompt(matchingPassages);
      const distinctPages = Array.from(new Set(matchingPassages.map((m) => m.chunk.pageNumber))).sort((a, b) => a - b);
      const isExactPageQuery = targetPages.length > 0 && matchingPassages.every((m) => m.isPageMatch);

      const prompt = `You are an expert, beginner-friendly document assistant.
Answer the user's question accurately using ONLY the provided document excerpts below.

${documentContext}

USER'S QUESTION:
${q}

OUTPUT FORMAT INSTRUCTIONS:
Structure your response in clear, beautifully formatted sections using this exact markdown hierarchy:

## Quick Answer
Provide a short, direct answer in 2-3 simple sentences giving immediate clarity and the core answer.

## Key Points
### 1. [First Main Point / Action Item]
Explain clearly.
- [Specific detail or step]
- [Specific detail or step]

### 2. [Second Main Point / Action Item]
Explain clearly.
- [Specific detail or step]
- [Specific detail or step]

## Important Details
(Include any additional details, tips, numbers, or context if helpful).

CRITICAL RULES:
1. Use simple, scannable, beginner-friendly language.
2. DO NOT repeat the page number (e.g., do NOT write "[Page ${distinctPages[0] || 1}]") across the answer text. The UI automatically displays the page source in a dedicated header and footer.
3. ${isExactPageQuery ? `The user explicitly asked about Page ${distinctPages.join(', ')}. Summarize and explain the EXACT content found on Page ${distinctPages.join(', ')}.` : 'Ground every fact strictly in the provided document excerpts above. Never invent facts.'}
4. Do NOT output raw metadata or repeated citations.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          modelId: 'balanced',
          mode: 'document_qa',
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let streamed = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        setAnswer(streamed);
      }
    } catch (err: any) {
      setAnswer(`Sorry, I ran into an issue finding that answer: ${err.message || 'Connection error'}`);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    addToast({ type: 'success', title: 'Answer copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-page-root min-h-screen w-full bg-[#f8f6fc] dark:bg-[#07050d] text-zinc-900 dark:text-slate-100 flex flex-col p-3 sm:p-6 md:p-8 select-text transition-colors duration-200">
      {/* Full Screen Main Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-5 pb-16">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/chat-ui"
            className="docs-nav-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-white/[0.04] hover:bg-purple-200 dark:hover:bg-white/[0.08] border border-purple-200 dark:border-purple-400/20 text-xs font-medium text-purple-800 dark:text-zinc-300 hover:text-purple-950 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={13} className="text-purple-600 dark:text-purple-400" />
            <span>Back to Chat</span>
          </Link>

          <span className="text-xs text-purple-600 dark:text-purple-300/80 font-medium flex items-center gap-1.5 font-mono">
            <Sparkles size={12} className="text-purple-500" />
            <span>Document AI Assistant</span>
          </span>
        </div>

        {/* Page Title & Simple Guidance */}
        <div className="space-y-1 pt-1">
          <h1 className="docs-header-title text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span className="docs-icon-container flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-400/25 text-purple-600 dark:text-purple-400">
              <FileText size={20} />
            </span>
            <span>Documents</span>
          </h1>
          <p className="docs-header-desc text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Upload any document to ask questions, extract key takeaways, or get simple answers instantly.
          </p>
        </div>

        {/* 3-Step Simple Flow Visual Bar */}
        <div className="docs-step-bar grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-purple-50/60 dark:bg-white/[0.02] border border-purple-200/80 dark:border-purple-400/15 text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
          <div className="flex items-center gap-2.5 px-2">
            <div className="docs-step-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-200/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold font-mono text-[11px]">
              1
            </div>
            <span><strong>Upload</strong> a PDF or text file</span>
          </div>
          <div className="flex items-center gap-2.5 px-2">
            <div className="docs-step-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-200/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold font-mono text-[11px]">
              2
            </div>
            <span><strong>Ask</strong> any question in plain English</span>
          </div>
          <div className="flex items-center gap-2.5 px-2">
            <div className="docs-step-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-200/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold font-mono text-[11px]">
              3
            </div>
            <span><strong>Get</strong> clear answers with key points</span>
          </div>
        </div>

        {/* Main Workspace Layout (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Document Upload & Library (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`docs-upload-box p-5 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer select-none ${
                isDraggingOver
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-500/15 scale-[1.01]'
                  : 'border-purple-200 dark:border-purple-400/20 hover:border-purple-400 dark:hover:border-purple-400/40 bg-purple-50/40 dark:bg-white/[0.02] hover:bg-purple-50 dark:hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="docs-icon-container flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                {isUploading ? (
                  <Loader2 size={24} className="animate-spin text-purple-600 dark:text-purple-400" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>

              <div>
                <p className="docs-item-title text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                  {isUploading ? uploadMessage : 'Upload Document'}
                </p>
                <p className="docs-item-meta text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Click or drag PDF, TXT, or Markdown here
                </p>
              </div>
            </div>

            {/* Document Library Section */}
            <div className="docs-card rounded-3xl bg-white dark:bg-[#130c26]/80 border border-purple-200 dark:border-purple-400/20 p-4 space-y-3 shadow-sm dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300/90 font-mono">
                  Your Documents ({documents.length})
                </h3>
              </div>

              {/* Documents List */}
              {documents.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <BookOpen size={24} className="text-zinc-400 dark:text-zinc-600 mx-auto" />
                  <p className="docs-item-meta text-xs text-zinc-500 dark:text-zinc-400">No documents uploaded yet.</p>
                  <p className="docs-item-meta text-[11px] text-zinc-400 dark:text-zinc-500">Upload a file above to get started.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-0.5">
                  {filteredDocs.map((doc) => {
                    const isSelected = activeDoc?.id === doc.id;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setAnswer(null);
                        }}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group select-none ${
                          isSelected
                            ? 'docs-item-active bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-400/50 text-purple-950 dark:text-white shadow-sm'
                            : 'docs-item-inactive bg-purple-50/40 dark:bg-white/[0.02] hover:bg-purple-50 dark:hover:bg-white/[0.05] border-purple-100 dark:border-white/[0.05] text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <FileText
                            size={16}
                            className={`shrink-0 ${
                              isSelected
                                ? 'text-purple-600 dark:text-purple-300'
                                : 'text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-white'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="docs-item-title text-xs font-semibold truncate leading-snug">
                              {doc.name}
                            </p>
                            <p className="docs-item-meta text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {doc.pages ? `${doc.pages} page${doc.pages > 1 ? 's' : ''}` : 'Text document'} • {Math.round(doc.size / 1024)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-500/30 text-purple-800 dark:text-purple-200 font-semibold uppercase tracking-wider">
                              Active
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id, doc.name);
                            }}
                            className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-white/[0.08] transition opacity-60 group-hover:opacity-100 cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Q&A Question & Answer Workspace (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Active Document Header Card */}
            {activeDoc ? (
              <div className="docs-card p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#130c26]/90 border border-purple-200 dark:border-purple-400/25 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-400/15 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="docs-icon-container flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 shrink-0">
                      <FileCheck size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium font-mono uppercase tracking-wider">
                        Active Document
                      </p>
                      <h2 className="docs-header-title text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                        {activeDoc.name}
                      </h2>
                    </div>
                  </div>

                  <span className="docs-item-meta text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                    {activeDoc.pages} page(s) ready for questions
                  </span>
                </div>

                {/* Example Quick Questions */}
                <div className="space-y-2">
                  <p className="docs-item-meta text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-purple-600 dark:text-purple-500" />
                    Try an example question or ask anything below:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXAMPLE_QUESTIONS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => handleAskQuestion(ex.replace(/^[^\w]+/, ''))}
                        className="docs-example-btn text-left px-3 py-2 rounded-2xl bg-purple-50/60 dark:bg-white/[0.03] hover:bg-purple-100 dark:hover:bg-purple-500/15 border border-purple-200/60 dark:border-purple-400/15 hover:border-purple-300 dark:hover:border-purple-400/35 text-xs text-zinc-800 dark:text-zinc-200 hover:text-purple-950 dark:hover:text-white transition cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate">{ex}</span>
                        <ChevronRight size={12} className="text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskQuestion(question);
                  }}
                  className="relative flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    placeholder="Ask any question about this document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="docs-input w-full pl-4 pr-24 py-3 rounded-2xl bg-purple-50/50 dark:bg-white/[0.04] hover:bg-purple-50/80 dark:hover:bg-white/[0.06] focus:bg-white dark:focus:bg-white/[0.08] border border-purple-200 dark:border-purple-400/25 focus:border-purple-500 dark:focus:border-purple-400/60 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isAnswering || !question.trim()}
                    className="absolute right-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    {isAnswering ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <span>Ask</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="docs-card p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#130c26]/60 border border-purple-200 dark:border-purple-400/20 shadow-sm dark:shadow-xl space-y-3 transition-colors">
                <div className="docs-icon-container flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 mx-auto">
                  <UploadCloud size={24} />
                </div>
                <h3 className="docs-header-title text-base font-bold text-zinc-900 dark:text-white">No Document Selected</h3>
                <p className="docs-header-desc text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Upload a PDF or text file on the left to start asking questions and receiving clear, structured answers.
                </p>
              </div>
            )}

            {/* Answer Display Section */}
            <AnimatePresence>
              {(isAnswering || answer) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="docs-answer-card p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#140e28]/95 border border-purple-200 dark:border-purple-400/30 shadow-sm dark:shadow-2xl space-y-4 transition-colors"
                >
                  {/* Clean Answer Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-purple-100 dark:border-purple-400/15 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                          <Sparkles size={13} />
                        </span>
                        <h3 className="docs-answer-title text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                          Answer from your document
                        </h3>
                      </div>

                      {/* Clean source badge right under header */}
                      {retrievedSources.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-400/30 shadow-sm">
                            <FileText size={11} className="text-purple-600 dark:text-purple-400" />
                            <span>
                              Page {Array.from(new Set(retrievedSources.map((s) => s.chunk.pageNumber))).sort((a, b) => a - b).join(', ')}
                            </span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider">
                              · {retrievedSources.some((s) => s.isPageMatch) ? 'Exact page match' : 'Semantic match'}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {answer && (
                      <button
                        onClick={handleCopyAnswer}
                        className="docs-copy-btn self-start sm:self-center inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-purple-50 hover:bg-purple-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-purple-200 dark:border-white/[0.08] transition cursor-pointer shadow-sm"
                        title="Copy answer"
                      >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {/* Clean Structured Answer Content */}
                  <div className="docs-text-body space-y-3 pt-1">
                    {isAnswering && !answer && (
                      <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-300 py-6">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-xs sm:text-sm font-medium">Finding answers in document...</span>
                      </div>
                    )}

                    {answer && (
                      <div className="space-y-3">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h2({ children }) {
                              const text = String(children || '').toLowerCase();
                              const isQuick = text.includes('quick answer');
                              const isKey = text.includes('key point');
                              const isDetail = text.includes('detail') || text.includes('covers') || text.includes('important');

                              return (
                                <div className={`my-3.5 first:mt-0 ${isQuick ? 'p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/15 border-l-4 border-purple-500 dark:border-purple-400 my-2' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    {isQuick && <Sparkles size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />}
                                    {isKey && <CheckCircle2 size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />}
                                    {isDetail && <BookOpen size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />}
                                    <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-200 font-mono">
                                      {children}
                                    </h2>
                                  </div>
                                </div>
                              );
                            },
                            h3({ children }) {
                              return (
                                <h3 className="text-xs sm:text-[13.5px] font-semibold text-zinc-900 dark:text-white mt-3 mb-1 flex items-center gap-1.5">
                                  <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                                  <span>{children}</span>
                                </h3>
                              );
                            },
                            p({ children }) {
                              return (
                                <p className="text-xs sm:text-[13.5px] leading-relaxed text-zinc-700 dark:text-zinc-300 my-1.5">
                                  {children}
                                </p>
                              );
                            },
                            ul({ children }) {
                              return <ul className="space-y-1.5 my-2 pl-1">{children}</ul>;
                            },
                            ol({ children }) {
                              return <ol className="space-y-1.5 my-2 pl-4 list-decimal text-xs sm:text-[13.5px] text-zinc-700 dark:text-zinc-200">{children}</ol>;
                            },
                            li({ children }) {
                              return (
                                <li className="flex items-start gap-2 text-xs sm:text-[13.5px] text-zinc-700 dark:text-zinc-200 leading-relaxed">
                                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 dark:bg-purple-400 mt-2 shrink-0 shadow-sm" />
                                  <div className="flex-1">{children}</div>
                                </li>
                              );
                            },
                            strong({ children }) {
                              return <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>;
                            },
                            code({ children }) {
                              return (
                                <code className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-200 font-mono text-[11px] border border-purple-200 dark:border-purple-400/25">
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {isExpanded || !hasDetailSection ? cleanedAnswer : primaryContent}
                        </ReactMarkdown>

                        {/* Collapsible Toggle for Long Document Answers */}
                        {hasDetailSection && (
                          <div className="pt-2">
                            <button
                              onClick={() => setIsExpanded(!isExpanded)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-500/15 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-400/30 text-xs font-semibold text-purple-800 dark:text-purple-200 hover:text-purple-950 dark:hover:text-white transition cursor-pointer"
                            >
                              <span>{isExpanded ? 'Show less' : 'Show detailed explanation'}</span>
                              <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clean Grounded Source Reference Footer */}
                  {answer && retrievedSources.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-purple-100 dark:border-purple-400/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>
                          <strong className="text-zinc-700 dark:text-zinc-300">Source:</strong> Page {Array.from(new Set(retrievedSources.map((s) => s.chunk.pageNumber))).sort((a, b) => a - b).join(', ')} of <span className="text-purple-700 dark:text-purple-300 font-medium">{activeDoc?.name}</span>
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-300 font-mono font-medium">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>{retrievedSources.some((s) => s.isPageMatch) ? 'Exact page retrieval' : 'Semantic relevance match'}</span>
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
