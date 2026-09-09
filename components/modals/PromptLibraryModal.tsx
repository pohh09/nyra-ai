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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { PromptItem } from '@/lib/types';
import { loadCustomPrompts, saveCustomPrompts } from '@/lib/storage';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchCloudPrompts, saveCloudPrompt, deleteCloudPrompt } from '@/lib/supabase/chatService';

export const PROMPT_CATEGORIES = [
  'All',
  'General',
  'Coding',
  'Writing',
  'Research',
  'Career',
  'Other',
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

    // Load only user-created prompts (zero built-in prompts)
    const userPrompts = loadCustomPrompts();
    setPrompts(userPrompts || []);

    if (user?.id) {
      fetchCloudPrompts(user.id).then((cloudPrompts) => {
        if (cloudPrompts) {
          const filtered = cloudPrompts.filter(
            (p) => p && p.isCustom !== false && !['p1', 'p2', 'p3', 'p4', 'b1', 'b2', 'b3', 'b4'].includes(p.id)
          );
          setPrompts(filtered);
          saveCustomPrompts(filtered);
        }
      });
    }

    // Handle "Save Input as Prompt" flow from chat composer
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
    return prompts.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const promptMatch = p.prompt?.toLowerCase().includes(q);
      const catMatch = p.category?.toLowerCase().includes(q);

      return titleMatch || promptMatch || catMatch;
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
    saveCustomPrompts(updatedList);
    setViewMode('library');
    setEditingId(null);
  };

  // Delete prompt
  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = prompts.filter((p) => p.id !== id);
    setPrompts(updatedList);
    saveCustomPrompts(updatedList);

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
      console.error('AI Prompt Generation Error:', err);
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
    saveCustomPrompts(updatedList);

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
      <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Right-Side Screen Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full sm:w-[480px] md:w-[540px] lg:w-[580px] max-w-[100vw] h-full border-l border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#0e0a1d] p-4 sm:p-5 md:p-6 shadow-[-20px_0_50px_rgba(41,38,51,0.06)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#292633] dark:text-white pointer-events-auto"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3 sm:pb-4 mb-3 sm:mb-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/30 flex items-center justify-center text-[#8B6FC9] dark:text-purple-400 shadow-sm shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#292633] dark:text-white truncate">Prompts & Starters</h2>
                <p className="text-[11px] sm:text-xs text-[#686477] dark:text-slate-400 truncate">Explore, customize & use prompts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {viewMode === 'library' && (
                <>
                  <button
                    onClick={() => setViewMode('ai-creator')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EEE8FA] hover:bg-[#E8E4EF] border border-[#E8E4EF] dark:bg-purple-500/15 dark:hover:bg-purple-500/25 dark:border-purple-400/30 text-[#8B6FC9] dark:text-purple-200 hover:text-[#795BB8] dark:hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles size={13} className="text-[#8B6FC9] dark:text-purple-300" />
                    <span className="hidden sm:inline">AI Creator</span>
                    <span className="sm:hidden">AI</span>
                  </button>

                  <button
                    onClick={handleOpenCreate}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#8B6FC9]/20"
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">New Prompt</span>
                    <span className="sm:hidden">New</span>
                  </button>
                </>
              )}

              {viewMode !== 'library' && (
                <button
                  onClick={() => setViewMode('library')}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#686477] hover:text-[#292633] dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
                >
                  Back
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-white/10 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* =========================================================
              VIEW 1: AI PROMPT CREATOR
          ========================================================= */}
          {viewMode === 'ai-creator' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-[#EEE8FA] dark:bg-sky-500/10 border border-[#E8E4EF] dark:border-sky-400/20 flex items-start gap-3">
                  <Sparkles size={18} className="text-[#8B6FC9] dark:text-sky-300 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-[#8B6FC9] dark:text-sky-200">Create a prompt with AI</h3>
                    <p className="text-[11.5px] text-[#686477] dark:text-slate-300 mt-0.5 leading-relaxed">
                      Describe your objective, role persona, and desired output structure. AI will synthesize a production-grade reusable prompt for your library.
                    </p>
                  </div>
                </div>

                {/* Main Goal / Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#8B6FC9] dark:text-sky-300 mb-1.5">
                    What do you want the prompt to do? *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I need a prompt to review my React components for performance, bugs, clean hooks usage, and TypeScript typings..."
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] dark:focus:border-sky-400 transition resize-none leading-relaxed"
                    autoFocus
                  />
                </div>

                {/* Optional Structured Prompt Dimensions Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedParams((v) => !v)}
                    className="text-[11.5px] font-semibold text-[#8B6FC9] dark:text-sky-400 hover:text-[#795BB8] dark:hover:text-sky-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders size={12} />
                    <span>{showAdvancedParams ? 'Hide Details' : 'Add Role, Output Format & Constraints (Optional)'}</span>
                  </button>

                  {showAdvancedParams && (
                    <div className="mt-2.5 space-y-3 p-3.5 rounded-2xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/20">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#292633] dark:text-slate-300 mb-1">
                          Role / Persona / Tone
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Staff Frontend Engineer, Analytical & Direct"
                          value={aiRoleTone}
                          onChange={(e) => setAiRoleTone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#0a1835] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#292633] dark:text-slate-300 mb-1">
                          Desired Output Format
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Structured markdown with summary, bug table, code diffs, and action list"
                          value={aiDesiredOutput}
                          onChange={(e) => setAiDesiredOutput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#0a1835] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#292633] dark:text-slate-300 mb-1">
                          Constraints & Framework Context
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. React 19, TypeScript strict mode, Next.js App Router"
                          value={aiConstraints}
                          onChange={(e) => setAiConstraints(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#0a1835] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Action Button */}
                <div className="pt-1">
                  <button
                    onClick={handleGenerateAiPrompt}
                    disabled={aiLoading || !aiGoal.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white font-bold text-xs shadow-md shadow-[#8B6FC9]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-white" />
                        <span>Generating Prompt with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-white" />
                        <span>Generate Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Error State */}
                {aiError && (
                  <div className="p-3 rounded-xl bg-[#F9ECEC] dark:bg-rose-500/15 border border-[#C77B7B]/30 dark:border-rose-400/30 text-[#A85A5A] dark:text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertCircle size={15} className="text-[#C77B7B] dark:text-rose-400 shrink-0" />
                    <span className="flex-1">{aiError}</span>
                  </div>
                )}

                {/* Generated Prompt Preview Card (MUST NOT auto-save) */}
                {aiGeneratedPrompt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl border border-[#E8E4EF] dark:border-sky-400/30 bg-[#F5F3F9] dark:bg-[#060e1e] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#292633] dark:text-white">{aiGeneratedPrompt.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#EEE8FA] dark:bg-sky-500/15 border border-[#E8E4EF] dark:border-sky-500/20 text-[#8B6FC9] dark:text-sky-300 font-mono">
                          {aiGeneratedPrompt.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPrompt('ai-gen', aiGeneratedPrompt.prompt)}
                          className="px-2 py-1 rounded-lg text-[#686477] hover:text-[#292633] dark:text-slate-300 dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] transition text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'ai-gen' ? (
                            <>
                              <Check size={11} className="text-[#6FA58A] dark:text-emerald-400" />
                              <span className="text-[#6FA58A] dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#0a1835]/80 border border-[#E8E4EF] dark:border-white/[0.04] text-xs text-[#292633] dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto scrollbar-thin">
                      {aiGeneratedPrompt.prompt}
                    </div>

                    {/* Actions: Edit, Regenerate, Test Prompt, Save to Library */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E8E4EF] dark:border-white/[0.06] flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleEditAiPrompt}
                          className="px-2.5 py-1 rounded-lg text-xs text-[#686477] hover:text-[#292633] dark:text-slate-300 dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={handleGenerateAiPrompt}
                          disabled={aiLoading}
                          className="px-2.5 py-1 rounded-lg text-xs text-[#686477] hover:text-[#8B6FC9] dark:text-slate-300 dark:hover:text-sky-300 hover:bg-[#EEE8FA] dark:hover:bg-sky-500/15 transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          <span>Regenerate</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTestAiPrompt}
                          className="px-3 py-1.5 rounded-xl bg-[#EEE8FA] hover:bg-[#E8E4EF] dark:bg-white/[0.08] dark:hover:bg-white/[0.15] border border-[#E8E4EF] dark:border-white/10 text-[#8B6FC9] dark:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Insert into composer to test immediately"
                        >
                          <Play size={11} className="text-[#8B6FC9] fill-[#8B6FC9] dark:text-sky-300 dark:fill-sky-300" />
                          <span>Test Prompt</span>
                        </button>

                        <button
                          onClick={handleSaveAiPromptToLibrary}
                          className="px-4 py-1.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold shadow-md shadow-[#8B6FC9]/20 transition cursor-pointer"
                        >
                          Save to Library
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E8E4EF] dark:border-sky-400/15 mt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('library')}
                  className="px-4 py-2 rounded-xl text-xs text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              VIEW 2: MANUAL CREATE / EDIT PROMPT
          ========================================================= */}
          {viewMode === 'manual-create' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin"
            >
              <div>
                <label className="block text-xs font-semibold text-[#8B6FC9] dark:text-sky-300 mb-1.5">
                  Prompt Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code Reviewer, Resume Polish, Bug Finder"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B6FC9] dark:text-sky-300 mb-1.5">
                  Prompt *
                </label>
                <textarea
                  rows={6}
                  placeholder="Type or paste the prompt text here..."
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition resize-none leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686477] dark:text-slate-300 mb-1.5">
                  Category (Optional)
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/25 text-xs text-[#292633] dark:text-white outline-none focus:border-[#8B6FC9] transition cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Coding">Coding</option>
                  <option value="Writing">Writing</option>
                  <option value="Research">Research</option>
                  <option value="Career">Career</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E4EF] dark:border-sky-400/15">
                <button
                  type="button"
                  onClick={() => setViewMode('library')}
                  className="px-4 py-2 rounded-xl text-xs text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  className="px-5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold shadow-md shadow-[#8B6FC9]/25 transition cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Save Prompt'}
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              VIEW 3: PROMPTS LIBRARY (User-Created Only)
          ========================================================= */}
          {viewMode === 'library' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Controls: Search + Categories */}
              <div className="space-y-3 mb-4 shrink-0">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92909B] dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search prompts by name, text, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F5F3F9] dark:bg-[#060e1e] border border-[#E8E4EF] dark:border-sky-400/20 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {PROMPT_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-[#EEE8FA] dark:bg-sky-500/25 border border-[#8B6FC9]/50 text-[#8B6FC9] dark:text-sky-200 shadow-sm'
                            : 'bg-[#F5F3F9] hover:bg-[#EEE8FA]/60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-[#E8E4EF] dark:border-white/[0.08] text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompts Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {prompts.length === 0 ? (
                  /* EMPTY STATE FOR BRAND-NEW USER */
                  <div className="py-14 text-center text-[#686477] dark:text-slate-400 text-xs">
                    <BookOpen size={36} className="mx-auto text-[#8B6FC9] dark:text-sky-400/60 mb-3" />
                    <h3 className="text-sm font-bold text-[#292633] dark:text-white">Your prompt library is empty</h3>
                    <p className="mt-1 text-xs text-[#686477] dark:text-slate-400 max-w-sm mx-auto">
                      Create your own reusable prompts or let AI create one for you.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 rounded-xl bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.1] text-[#292633] dark:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus size={13} />
                        <span>Create Prompt</span>
                      </button>
                      <button
                        onClick={() => setViewMode('ai-creator')}
                        className="px-4 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#8B6FC9]/25"
                      >
                        <Sparkles size={13} className="text-white" />
                        <span>AI Prompt Creator</span>
                      </button>
                    </div>
                  </div>
                ) : filteredPrompts.length === 0 ? (
                  /* NO SEARCH / FILTER MATCHES */
                  <div className="py-12 text-center text-[#686477] dark:text-slate-400 text-xs">
                    <p className="font-semibold text-[#292633] dark:text-white">No prompts found.</p>
                    <p className="mt-1 text-[11px]">Try adjusting your search or category filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-3 text-xs text-[#8B6FC9] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Clear search & filters
                    </button>
                  </div>
                ) : (
                  /* PROMPT CARDS */
                  filteredPrompts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl border border-[#E8E4EF] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#060e1e] hover:border-[#8B6FC9]/30 transition-all flex flex-col gap-2 group shadow-sm"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#292633] dark:text-white truncate">{p.title}</h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#EEE8FA] dark:bg-sky-500/15 border border-[#E8E4EF] dark:border-sky-500/20 text-[#8B6FC9] dark:text-sky-300 font-mono shrink-0">
                            {p.category || 'General'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleCopyPrompt(p.id, p.prompt, e)}
                          className="p-1.5 rounded-lg text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] transition cursor-pointer shrink-0"
                          title="Copy prompt text"
                        >
                          {copiedId === p.id ? (
                            <Check size={13} className="text-[#6FA58A] dark:text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                      {/* Prompt Content Preview */}
                      <p className="text-[11.5px] text-[#686477] dark:text-slate-300 line-clamp-2 leading-relaxed bg-[#F5F3F9] dark:bg-[#0a1835]/70 p-2.5 rounded-xl border border-[#E8E4EF] dark:border-white/[0.04] font-sans">
                        {p.prompt}
                      </p>

                      {/* Card Actions: Use, Edit, Delete */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E4EF] dark:border-white/[0.05]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-[#686477] hover:text-[#8B6FC9] dark:text-slate-400 dark:hover:text-sky-300 hover:bg-[#EEE8FA] dark:hover:bg-sky-500/15 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => handleDeletePrompt(p.id, e)}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-[#686477] hover:text-[#C77B7B] hover:bg-[#F9ECEC] dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleUsePrompt(p.prompt)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#EEE8FA] hover:bg-[#8B6FC9] hover:text-white border border-[#E8E4EF] dark:bg-sky-500/20 dark:hover:bg-sky-500/35 dark:border-sky-400/35 text-[#8B6FC9] dark:text-sky-200 dark:hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title="Insert prompt into chat composer"
                        >
                          <span>Use</span>
                          <ArrowRight size={12} className="text-[#8B6FC9] group-hover:text-white dark:text-sky-300" />
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
    </AnimatePresence>
  );
}
