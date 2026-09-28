'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  ArrowRight,
  X,
  Trash2,
  Edit3,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle,
  Play,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { PromptItem } from '@/lib/types';
import { loadCustomPrompts, saveCustomPrompts } from '@/lib/storage';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchCloudPrompts, saveCloudPrompt, deleteCloudPrompt } from '@/lib/supabase/chatService';

export const PROMPT_CATEGORIES = [
  { name: 'All', icon: '⚡' },
  { name: 'Coding', icon: '💻' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Image Generation', icon: '🎨' },
  { name: 'Learning', icon: '📚' },
  { name: 'Research', icon: '🔍' },
  { name: 'Career', icon: '💼' },
  { name: 'General', icon: '⚡' },
  { name: 'Other', icon: '💡' },
] as const;

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
  initialPromptToSave?: string;
}

type ViewMode = 'library' | 'manual-create' | 'ai-creator';

export default function PromptLibraryModal({
  isOpen,
  onClose,
  onSelectPrompt,
  initialPromptToSave,
}: PromptLibraryModalProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isCategoryDropdownOpen]);

  // Manual Form State (Create / Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formCategory, setFormCategory] = useState<string>('General');

  // AI Prompt Creator State
  const [aiGoal, setAiGoal] = useState('');
  const [aiRoleTone, setAiRoleTone] = useState('');
  const [aiDesiredOutput, setAiDesiredOutput] = useState('');
  const [aiConstraints, setAiConstraints] = useState('');
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedPrompt, setAiGeneratedPrompt] = useState<{
    name: string;
    prompt: string;
    category: string;
  } | null>(null);

  // Load user prompts on modal open
  useEffect(() => {
    if (!isOpen) return;

    const userPrompts = loadCustomPrompts(user?.id);
    setPrompts(userPrompts || []);

    if (user?.id) {
      fetchCloudPrompts(user.id).then((cloudPrompts) => {
        if (cloudPrompts) {
          const filtered = cloudPrompts.filter((p) => p && p.isCustom !== false);
          setPrompts(filtered);
          saveCustomPrompts(filtered, user.id);
        }
      });
    }

    if (initialPromptToSave) {
      setFormTitle('');
      setFormPrompt(initialPromptToSave);
      setFormCategory('General');
      setEditingId(null);
      setViewMode('manual-create');
    } else {
      setViewMode('library');
      setAiGeneratedPrompt(null);
      setAiError(null);
    }
  }, [isOpen, initialPromptToSave, user?.id]);

  // Filter user prompts by category and search
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];

    return prompts.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesCategory) return false;

      if (terms.length === 0) return true;

      const title = (p.title || '').toLowerCase();
      const prompt = (p.prompt || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();

      return terms.every(
        (term) => title.includes(term) || prompt.includes(term) || cat.includes(term)
      );
    });
  }, [prompts, selectedCategory, searchQuery]);

  // Open manual creation form
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormPrompt('');
    setFormCategory('General');
    setViewMode('manual-create');
  };

  // Open manual edit form
  const handleOpenEdit = (p: PromptItem) => {
    setEditingId(p.id);
    setFormTitle(p.title);
    setFormPrompt(p.prompt);
    setFormCategory(p.category || 'General');
    setViewMode('manual-create');
  };

  // Save manual prompt
  const handleSavePrompt = () => {
    if (!formTitle.trim()) {
      addToast({ type: 'error', title: 'Please enter a prompt name' });
      return;
    }
    if (!formPrompt.trim()) {
      addToast({ type: 'error', title: 'Please enter prompt text' });
      return;
    }

    let updatedList: PromptItem[];

    if (editingId) {
      updatedList = prompts.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: formTitle.trim(),
              prompt: formPrompt.trim(),
              category: formCategory,
              updatedAt: new Date().toISOString(),
            }
          : item
      );
      addToast({ type: 'success', title: 'Prompt updated' });
    } else {
      const newPrompt: PromptItem = {
        id: `custom_${Date.now()}`,
        title: formTitle.trim(),
        prompt: formPrompt.trim(),
        category: formCategory,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newPrompt, ...prompts];
      addToast({ type: 'success', title: 'Prompt saved to library' });

      if (user?.id) {
        saveCloudPrompt(user.id, newPrompt);
      }
    }

    setPrompts(updatedList);
    saveCustomPrompts(updatedList, user?.id);
    setViewMode('library');
    setEditingId(null);
  };

  // Delete prompt
  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = prompts.filter((p) => p.id !== id);
    setPrompts(updatedList);
    saveCustomPrompts(updatedList, user?.id);

    if (user?.id) {
      deleteCloudPrompt(user.id, id);
    }
    addToast({ type: 'info', title: 'Prompt deleted' });
  };

  // Copy prompt text
  const handleCopyPrompt = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast({ type: 'success', title: 'Copied to clipboard' });
    }
  };

  // Use prompt -> Inserts into chat composer without auto-sending
  const handleUsePrompt = (promptText: string) => {
    onSelectPrompt(promptText);
    onClose();
    addToast({ type: 'info', title: 'Prompt inserted into composer' });
  };

  // Generate prompt with AI
  const handleGenerateAiPrompt = async () => {
    if (!aiGoal.trim()) {
      addToast({ type: 'error', title: 'Please describe what you want the prompt to do' });
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiGeneratedPrompt(null);

    try {
      const res = await fetch('/api/prompt-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          goal: aiGoal.trim(),
          roleTone: aiRoleTone.trim() || undefined,
          desiredOutput: aiDesiredOutput.trim() || undefined,
          constraints: aiConstraints.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setAiGeneratedPrompt({
        name: data.name || 'Custom Prompt',
        prompt: data.prompt || '',
        category: data.category || 'General',
      });
      addToast({ type: 'success', title: 'AI Prompt generated!' });
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed. Please try again.');
      addToast({ type: 'error', title: err.message || 'AI generation failed' });
    } finally {
      setAiLoading(false);
    }
  };

  // Save AI-generated prompt to library
  const handleSaveAiPromptToLibrary = () => {
    if (!aiGeneratedPrompt) return;

    const newPrompt: PromptItem = {
      id: `custom_${Date.now()}`,
      title: aiGeneratedPrompt.name.trim(),
      prompt: aiGeneratedPrompt.prompt.trim(),
      category: aiGeneratedPrompt.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newPrompt, ...prompts];
    setPrompts(updatedList);
    saveCustomPrompts(updatedList, user?.id);

    if (user?.id) {
      saveCloudPrompt(user.id, newPrompt);
    }

    addToast({ type: 'success', title: `"${newPrompt.title}" saved to library` });
    setViewMode('library');
    setAiGeneratedPrompt(null);
    setAiGoal('');
    setAiRoleTone('');
    setAiDesiredOutput('');
    setAiConstraints('');
  };

  // Test AI-generated prompt in composer immediately
  const handleTestAiPrompt = () => {
    if (!aiGeneratedPrompt) return;
    onSelectPrompt(aiGeneratedPrompt.prompt);
    onClose();
    addToast({ type: 'info', title: 'Prompt inserted into composer for testing' });
  };

  // Edit AI-generated prompt in manual form before saving
  const handleEditAiPrompt = () => {
    if (!aiGeneratedPrompt) return;
    setEditingId(null);
    setFormTitle(aiGeneratedPrompt.name);
    setFormPrompt(aiGeneratedPrompt.prompt);
    setFormCategory(aiGeneratedPrompt.category);
    setViewMode('manual-create');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Right-Side Screen Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-10 w-full sm:w-[440px] md:w-[480px] lg:w-[520px] max-w-[100vw] h-full border-l border-[#E8E4EF] dark:border-white/[0.08] bg-white dark:bg-[#0E0514] p-4 sm:p-5 shadow-[-16px_0_40px_rgba(0,0,0,0.15)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#261827] dark:text-zinc-100 pointer-events-auto backdrop-blur-xl"
          >
            {/* Clean Header */}
            <div className="flex items-start justify-between border-b border-[#E8E4EF] dark:border-white/[0.08] pt-1 pb-3 mb-3 shrink-0">
              <div className="min-w-0 pr-2">
                <h2 className="text-base font-bold text-[#261827] dark:text-white tracking-tight leading-tight">
                  Prompts
                </h2>
                <p className="text-xs text-[#6E6072] dark:text-zinc-400 mt-0.5 font-normal leading-normal">
                  Create, save and reuse your prompts.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                {viewMode === 'library' && (
                  <>
                    <button
                      onClick={() => setViewMode('ai-creator')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F7F3FA] hover:bg-[#F0EAF5] border border-[#E8E4EF] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:border-white/10 text-[#261827] dark:text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} className="text-[#B31372] dark:text-pink-400" />
                      <span>AI Creator</span>
                    </button>

                    <button
                      onClick={handleOpenCreate}
                      className="px-3 py-1.5 rounded-lg bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Create</span>
                    </button>
                  </>
                )}

                {viewMode !== 'library' && (
                  <button
                    onClick={() => setViewMode('library')}
                    className="px-3 py-1.5 rounded-lg bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#6E6072] hover:text-[#261827] dark:text-zinc-300 dark:hover:text-white transition cursor-pointer"
                  >
                    Back
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* VIEW 1: AI PROMPT CREATOR */}
            {viewMode === 'ai-creator' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 scrollbar-thin flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAF8FB] dark:bg-white/[0.03] border border-[#E8E4EF] dark:border-white/[0.08] flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#B31372] dark:text-pink-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-[#261827] dark:text-white">Create a prompt with AI</h3>
                      <p className="text-[11px] text-[#6E6072] dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Describe your objective and AI will synthesize a production-grade reusable prompt for your library.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#261827] dark:text-zinc-300 mb-1">
                      What do you want the prompt to do? *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. I need a prompt to review my React components for performance, bugs, and TypeScript typings..."
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-500/60 transition resize-none leading-relaxed shadow-xs"
                      autoFocus
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedParams((v) => !v)}
                      className="text-[11.5px] font-semibold text-[#B31372] dark:text-pink-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sliders size={12} />
                      <span>{showAdvancedParams ? 'Hide Details' : 'Add Role, Output Format & Constraints (Optional)'}</span>
                    </button>

                    {showAdvancedParams && (
                      <div className="mt-2 space-y-2.5 p-3 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.03] border border-[#E8E4EF] dark:border-white/[0.06]">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                            Role / Persona / Tone
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Staff Frontend Engineer, Analytical & Direct"
                            value={aiRoleTone}
                            onChange={(e) => setAiRoleTone(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white outline-none focus:border-[#B31372]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                            Desired Output Format
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Structured markdown with summary, bug table, code diffs"
                            value={aiDesiredOutput}
                            onChange={(e) => setAiDesiredOutput(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white outline-none focus:border-[#B31372]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                            Constraints & Context
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. React 19, TypeScript strict mode, Next.js App Router"
                            value={aiConstraints}
                            onChange={(e) => setAiConstraints(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white outline-none focus:border-[#B31372]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-0.5">
                    <button
                      onClick={handleGenerateAiPrompt}
                      disabled={aiLoading || !aiGoal.trim()}
                      className="w-full h-9 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" />
                          <span>Generating Prompt...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-white" />
                          <span>Generate Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-500 dark:text-rose-400 shrink-0" />
                      <span className="flex-1">{aiError}</span>
                    </div>
                  )}

                  {aiGeneratedPrompt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl border border-[#E8E4EF] dark:border-pink-500/30 bg-white dark:bg-[#150A20] space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#261827] dark:text-white">{aiGeneratedPrompt.name}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-500/20 text-[#8A0E57] dark:text-pink-300 font-mono">
                            {aiGeneratedPrompt.category}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyPrompt('ai-gen', aiGeneratedPrompt.prompt)}
                          className="px-2 py-1 rounded-lg text-[#6E6072] hover:text-[#261827] dark:text-zinc-300 dark:hover:text-white hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'ai-gen' ? (
                            <>
                              <Check size={11} className="text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F7F3FA] dark:bg-black/30 border border-[#E8E4EF] dark:border-white/[0.04] text-xs text-[#261827] dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin">
                        {aiGeneratedPrompt.prompt}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E4EF] dark:border-white/[0.06] flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleEditAiPrompt}
                            className="px-2 py-1 rounded-lg text-xs text-[#6E6072] hover:text-[#261827] dark:text-zinc-300 dark:hover:text-white hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={handleGenerateAiPrompt}
                            disabled={aiLoading}
                            className="px-2 py-1 rounded-lg text-xs text-[#6E6072] hover:text-[#B31372] dark:text-zinc-300 dark:hover:text-pink-300 hover:bg-[#F7F3FA] dark:hover:bg-pink-500/15 transition flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={11} />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleTestAiPrompt}
                            className="px-2.5 py-1 rounded-lg bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.08] dark:hover:bg-white/[0.15] border border-[#E8E4EF] dark:border-white/10 text-xs font-semibold text-[#261827] dark:text-white transition flex items-center gap-1 cursor-pointer"
                          >
                            <Play size={10} className="fill-current text-[#B31372] dark:text-pink-300" />
                            <span>Test</span>
                          </button>

                          <button
                            onClick={handleSaveAiPromptToLibrary}
                            className="px-3 py-1 rounded-lg bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            Save to Library
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-[#E8E4EF] dark:border-white/[0.08] mt-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('library')}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: MANUAL CREATE / EDIT PROMPT */}
            {viewMode === 'manual-create' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-thin"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                    Prompt Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Code Reviewer, Resume Polish"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372] transition shadow-xs"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                    Prompt *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type or paste prompt text here... supports {{variables}}"
                    value={formPrompt}
                    onChange={(e) => setFormPrompt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372] transition resize-none leading-relaxed font-sans shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F3FA] dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white outline-none focus:border-[#B31372] transition cursor-pointer shadow-xs"
                  >
                    <option value="General">General</option>
                    <option value="Coding">Coding</option>
                    <option value="Writing">Writing</option>
                    <option value="Research">Research</option>
                    <option value="Career">Career</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#E8E4EF] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setViewMode('library')}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    className="px-4 py-1.5 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    {editingId ? 'Save Changes' : 'Save Prompt'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: PROMPTS LIBRARY */}
            {viewMode === 'library' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Controls: Search + Categories */}
                <div className="space-y-2.5 mb-3 shrink-0">
                  {/* Search Bar */}
                  <div className="relative group">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E93A2] dark:text-zinc-500 group-focus-within:text-[#B31372] dark:group-focus-within:text-pink-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      role="searchbox"
                      aria-label="Search prompts"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          if (searchQuery) setSearchQuery('');
                          else (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="w-full pl-[38px] pr-8 h-[38px] rounded-[10px] bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-500/60 focus:ring-2 focus:ring-[#B31372]/15 dark:focus:ring-pink-500/15 focus:bg-white dark:focus:bg-[#0E0514] transition shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category Dropdown Filter Popover */}
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                      className={`w-full h-[38px] px-3 rounded-[10px] border transition flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.99] text-xs ${
                        selectedCategory !== 'All'
                          ? 'bg-[#F4DCE9]/50 dark:bg-pink-500/10 border-[#B31372]/40 dark:border-pink-500/40 text-[#8A0E57] dark:text-pink-200 font-semibold'
                          : 'bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-[#E8E4EF] dark:border-white/[0.08] text-[#261827] dark:text-zinc-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs shrink-0">
                          {PROMPT_CATEGORIES.find((c) => c.name === selectedCategory)?.icon || '⚡'}
                        </span>
                        <span className="truncate">
                          {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <ChevronDown
                          size={14}
                          className={`text-[#6E6072] dark:text-zinc-400 transition-transform duration-200 ${
                            isCategoryDropdownOpen ? 'rotate-180 text-[#B31372] dark:text-pink-400' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/15 shadow-xl p-1 text-xs space-y-0.5 animate-[fadeIn_0.1s_ease-out] max-h-60 overflow-y-auto custom-scrollbar">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9E93A2] dark:text-zinc-400 border-b border-[#E8E4EF]/70 dark:border-white/[0.06] mb-1 flex items-center justify-between">
                          <span>Categories</span>
                          {selectedCategory !== 'All' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory('All');
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="text-[#B31372] dark:text-pink-300 hover:underline capitalize font-normal text-[10.5px] cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {PROMPT_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategory === cat.name;
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.name);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-200 font-semibold'
                                  : 'text-[#261827] dark:text-zinc-200 hover:bg-[#F7F3FA] dark:hover:bg-white/[0.06]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs shrink-0">{cat.icon}</span>
                                <span className="truncate">{cat.name === 'All' ? 'All Categories' : cat.name}</span>
                              </div>
                              {isSelected && (
                                <Check size={14} className="text-[#B31372] dark:text-pink-400 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Prompts Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
                  {prompts.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl border border-[#E8E4EF] dark:border-white/[0.08] bg-[#FAF8FB] dark:bg-white/[0.02] space-y-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-400/25 flex items-center justify-center text-[#B31372] dark:text-pink-300 mx-auto">
                        <BookOpen size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-[#261827] dark:text-white">Your prompt library is empty</h3>
                        <p className="text-[11px] text-[#6E6072] dark:text-zinc-400 max-w-xs mx-auto">
                          Create your own reusable prompts or let AI create one for you.
                        </p>
                      </div>
                      <div className="pt-1 flex items-center justify-center gap-2">
                        <button
                          onClick={handleOpenCreate}
                          className="px-3 py-1.5 rounded-xl bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.1] text-[#261827] dark:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus size={13} />
                          <span>Create</span>
                        </button>
                        <button
                          onClick={() => setViewMode('ai-creator')}
                          className="px-3 py-1.5 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Sparkles size={13} className="text-white" />
                          <span>AI Creator</span>
                        </button>
                      </div>
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="py-8 text-center text-[#6E6072] dark:text-zinc-400 text-xs">
                      <p className="font-semibold text-[#261827] dark:text-white">No prompts found.</p>
                      <p className="mt-0.5 text-[11px]">Try adjusting your search or category filter.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}
                        className="mt-2 text-xs text-[#B31372] dark:text-pink-300 hover:underline cursor-pointer"
                      >
                        Clear search & filters
                      </button>
                    </div>
                  ) : (
                    filteredPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-[#E8E4EF] dark:border-white/[0.07] bg-white hover:bg-[#FAF8FB] dark:bg-[#130A1C] dark:hover:bg-[#180C24] hover:border-[#B31372]/30 transition-all flex flex-col gap-1.5 group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#261827] dark:text-white truncate">{p.title}</h4>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-500/20 text-[#8A0E57] dark:text-pink-300 font-mono shrink-0">
                              {p.category || 'General'}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleCopyPrompt(p.id, p.prompt, e)}
                            className="p-1 rounded-lg text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition cursor-pointer shrink-0"
                            title="Copy prompt text"
                          >
                            {copiedId === p.id ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>

                        <p className="text-[11.5px] text-[#6E6072] dark:text-zinc-300 line-clamp-2 leading-relaxed bg-[#F7F3FA]/70 dark:bg-black/20 p-2 rounded-lg border border-[#E8E4EF]/60 dark:border-white/[0.03] font-sans">
                          {p.prompt}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#E8E4EF]/70 dark:border-white/[0.05]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-2 py-1 rounded-lg text-[11px] text-[#6E6072] hover:text-[#B31372] dark:text-zinc-400 dark:hover:text-pink-300 hover:bg-[#F7F3FA] dark:hover:bg-pink-500/15 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 size={11} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeletePrompt(p.id, e)}
                              className="px-2 py-1 rounded-lg text-[11px] text-[#6E6072] hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleUsePrompt(p.prompt)}
                            className="px-3 py-1 rounded-lg bg-[#F7F3FA] hover:bg-[#B31372] hover:text-white border border-[#E8E4EF] dark:bg-white/[0.08] dark:hover:bg-pink-600 dark:border-white/10 text-[#261827] dark:text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                            title="Insert prompt into chat composer"
                          >
                            <span>Use</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
