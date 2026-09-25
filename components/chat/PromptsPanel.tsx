'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Loader2,
  X,
  Star,
  BookOpen,
  Pin,
  Wand2,
  Variable,
  MoreVertical,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { PromptItem } from '@/lib/types';
import { loadCustomPrompts, saveCustomPrompts } from '@/lib/storage';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchCloudPrompts, saveCloudPrompt, deleteCloudPrompt } from '@/lib/supabase/chatService';

export const PROMPT_CATEGORIES = [
  'All',
  'Coding',
  'Writing',
  'Image Generation',
  'Learning',
  'Career',
  'Research',
  'Custom',
  'General',
] as const;

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; icon: string; color: string; desc: string }
> = {
  Coding: { label: 'Coding', icon: '💻', color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', desc: 'Code review, debugging & refactoring' },
  Writing: { label: 'Writing', icon: '✍️', color: 'text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20', desc: 'Essays, copywriting, emails & summaries' },
  'Image Generation': { label: 'Image Generation', icon: '🎨', color: 'text-fuchsia-500 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/20', desc: 'Midjourney, DALL-E & visual art' },
  Learning: { label: 'Learning', icon: '📚', color: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', desc: 'Tutorials, explanations & study guides' },
  Career: { label: 'Career', icon: '💼', color: 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', desc: 'Resumes, cover letters & interview prep' },
  Research: { label: 'Research', icon: '🔍', color: 'text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20', desc: 'Deep synthesis & data analysis' },
  Custom: { label: 'Custom', icon: '🧠', color: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20', desc: 'Tailored templates & workflows' },
  General: { label: 'General', icon: '⚡', color: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10', desc: 'Everyday productivity prompts' },
};

const STARTER_PROMPTS: PromptItem[] = [
  {
    id: 'starter_1',
    title: 'React 19 & TypeScript Code Reviewer',
    prompt: 'Review the following {{framework}} code thoroughly for runtime bugs, race conditions, memory leaks, and hook dependency issues. Provide clean refactored solutions:\n\n{{code_snippet}}',
    category: 'Coding',
    isCustom: true,
  },
  {
    id: 'starter_2',
    title: 'Executive Brief Synthesizer',
    prompt: 'Synthesize a structured executive summary highlighting the key takeaways, core metrics, actionable items, and strategic considerations for:\n\n{{document_or_topic}}',
    category: 'Writing',
    isCustom: true,
  },
  {
    id: 'starter_3',
    title: 'Photorealistic Architectural Prompt',
    prompt: 'A photorealistic architectural visualization of a {{building_type}} surrounded by {{environment}}, 8k resolution, cinematic golden hour lighting, architectural digest style, volumetric fog, shot on 35mm lens.',
    category: 'Image Generation',
    isCustom: true,
  },
  {
    id: 'starter_4',
    title: 'Technical Step-by-Step Tutor',
    prompt: 'Explain the core principles and step-by-step logic behind {{technical_concept}} in simple, intuitive terms for a beginner, with practical real-world analogies and code examples.',
    category: 'Learning',
    isCustom: true,
  },
  {
    id: 'starter_5',
    title: 'Tailored Senior Job Cover Letter',
    prompt: 'Write a compelling, professional cover letter for a {{role}} position at {{company}}. Highlight achievements in leadership, architecture, and delivering high-impact business outcomes.',
    category: 'Career',
    isCustom: true,
  },
];

interface PromptsPanelProps {
  onSelectPrompt: (promptText: string) => void;
  onClose?: () => void;
  initialPromptToSave?: string;
}

type TabMode = 'library' | 'ai-creator' | 'improve-prompt';
type SubViewMode = 'list' | 'manual-create';

export default function PromptsPanel({
  onSelectPrompt,
  onClose,
  initialPromptToSave,
}: PromptsPanelProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [customPrompts, setCustomPrompts] = useState<PromptItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [tabMode, setTabMode] = useState<TabMode>('library');
  const [subView, setSubView] = useState<SubViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Manual Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formCategory, setFormCategory] = useState<string>('General');

  // AI Prompt Creator State
  const [aiGoal, setAiGoal] = useState('');
  const [aiSelectedCategory, setAiSelectedCategory] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedPrompt, setAiGeneratedPrompt] = useState<{
    name: string;
    prompt: string;
    category: string;
  } | null>(null);
  const [aiEditMode, setAiEditMode] = useState(false);

  // Improve Prompt State
  const [improveInput, setImproveInput] = useState('');
  const [improvementType, setImprovementType] = useState<
    'detailed' | 'short' | 'professional' | 'examples' | 'clarity'
  >('detailed');
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improvedResult, setImprovedResult] = useState<{
    name: string;
    prompt: string;
    originalPrompt: string;
    category: string;
    changesSummary: string;
  } | null>(null);
  const [improveEditMode, setImproveEditMode] = useState(false);

  // Variables Filler Modal State
  const [variableModalPrompt, setVariableModalPrompt] = useState<string | null>(null);
  const [variableKeys, setVariableKeys] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Close card action menu on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuId]);

  // Load custom prompts, favorites & pinned from storage
  useEffect(() => {
    const loaded = loadCustomPrompts();
    setCustomPrompts(loaded || []);

    try {
      const storedFavs = localStorage.getItem('nyra_prompt_favorites');
      if (storedFavs) setFavorites(new Set(JSON.parse(storedFavs)));

      const storedPins = localStorage.getItem('nyra_prompt_pinned');
      if (storedPins) setPinned(new Set(JSON.parse(storedPins)));
    } catch (e) {
      console.error(e);
    }

    if (user?.id) {
      fetchCloudPrompts(user.id).then((cloud) => {
        if (cloud && cloud.length > 0) {
          const filtered = cloud.filter((p) => p && p.isCustom !== false);
          setCustomPrompts(filtered);
          saveCustomPrompts(filtered);
        }
      });
    }

    if (initialPromptToSave) {
      setFormTitle('');
      setFormPrompt(initialPromptToSave);
      setFormCategory('General');
      setEditingId(null);
      setSubView('manual-create');
      setTabMode('library');
    } else {
      setSubView('list');
      setAiGeneratedPrompt(null);
      setImprovedResult(null);
    }
  }, [initialPromptToSave, user?.id]);

  // Combined prompts sorted by Pinned > Favorites > Recent
  const sortedPrompts = useMemo(() => {
    return [...customPrompts].sort((a, b) => {
      const aPin = pinned.has(a.id);
      const bPin = pinned.has(b.id);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;

      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      return 0;
    });
  }, [customPrompts, favorites, pinned]);

  // Filtered prompts by category & search query
  const filteredPrompts = useMemo(() => {
    return sortedPrompts.filter((p) => {
      if (selectedCategory === '⭐ Starred' && !favorites.has(p.id)) return false;
      if (selectedCategory === '📌 Pinned' && !pinned.has(p.id)) return false;

      const matchesCategory =
        selectedCategory === 'All' ||
        selectedCategory === '⭐ Starred' ||
        selectedCategory === '📌 Pinned' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.prompt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  }, [sortedPrompts, selectedCategory, searchQuery, favorites, pinned]);

  // Extract {{variables}} from prompt string
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([a-zA-Z0-9_\-\s]+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
    try {
      localStorage.setItem('nyra_prompt_favorites', JSON.stringify(Array.from(next)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = new Set(pinned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinned(next);
    try {
      localStorage.setItem('nyra_prompt_pinned', JSON.stringify(Array.from(next)));
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger prompt usage (handles {{variable}} templates)
  const handleUsePrompt = (promptText: string) => {
    const vars = extractVariables(promptText);
    if (vars.length > 0) {
      setVariableModalPrompt(promptText);
      setVariableKeys(vars);
      const initialMap: Record<string, string> = {};
      vars.forEach((v) => (initialMap[v] = ''));
      setVariableValues(initialMap);
      return;
    }

    onSelectPrompt(promptText);
    onClose?.();
    addToast({ type: 'success', title: 'Prompt applied to chat composer' });
  };

  // Submit filled variables
  const handleConfirmVariables = () => {
    if (!variableModalPrompt) return;
    let finalPrompt = variableModalPrompt;
    for (const [key, val] of Object.entries(variableValues)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      finalPrompt = finalPrompt.replace(regex, val.trim() || `[${key}]`);
    }

    setVariableModalPrompt(null);
    onSelectPrompt(finalPrompt);
    onClose?.();
    addToast({ type: 'success', title: 'Template filled and inserted into chat' });
  };

  const handleCopyPrompt = (id: string, text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
      addToast({ type: 'info', title: 'Copied prompt to clipboard' });
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormPrompt('');
    setFormCategory('General');
    setSubView('manual-create');
    setTabMode('library');
  };

  const handleOpenEdit = (p: PromptItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    setEditingId(p.id);
    setFormTitle(p.title);
    setFormPrompt(p.prompt);
    setFormCategory(p.category || 'General');
    setSubView('manual-create');
    setTabMode('library');
  };

  const handleDeletePrompt = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    const updated = customPrompts.filter((p) => p.id !== id);
    setCustomPrompts(updated);
    saveCustomPrompts(updated);
    if (user?.id) deleteCloudPrompt(user.id, id);
    addToast({ type: 'info', title: 'Prompt deleted' });
  };

  const handleLoadStarters = () => {
    const updated = [...customPrompts, ...STARTER_PROMPTS];
    setCustomPrompts(updated);
    saveCustomPrompts(updated);
    addToast({ type: 'success', title: 'Loaded starter templates' });
  };

  const handleSaveManualPrompt = () => {
    if (!formTitle.trim()) {
      addToast({ type: 'error', title: 'Please enter a prompt title' });
      return;
    }
    if (!formPrompt.trim()) {
      addToast({ type: 'error', title: 'Please enter prompt content' });
      return;
    }

    let updatedList: PromptItem[];
    if (editingId) {
      updatedList = customPrompts.map((item) =>
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
      const newItem: PromptItem = {
        id: `custom_${Date.now()}`,
        title: formTitle.trim(),
        prompt: formPrompt.trim(),
        category: formCategory,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newItem, ...customPrompts];
      if (user?.id) saveCloudPrompt(user.id, newItem);
      addToast({ type: 'success', title: 'Prompt saved to library' });
    }

    setCustomPrompts(updatedList);
    saveCustomPrompts(updatedList);
    setSubView('list');
    setEditingId(null);
  };

  // AI Prompt Creator
  const handleGenerateAiPrompt = async () => {
    if (!aiGoal.trim()) {
      addToast({ type: 'error', title: 'Please describe what you want the prompt to do' });
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiEditMode(false);

    try {
      const res = await fetch('/api/prompt-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          goal: aiGoal.trim(),
          category: aiSelectedCategory || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setAiGeneratedPrompt({
        name: data.name || 'Custom Prompt',
        prompt: data.prompt || '',
        category: data.category || aiSelectedCategory || 'General',
      });
      addToast({ type: 'success', title: 'Prompt synthesized by AI!' });
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed');
      addToast({ type: 'error', title: err.message || 'Generation failed' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiPrompt = () => {
    if (!aiGeneratedPrompt) return;
    const newItem: PromptItem = {
      id: `custom_${Date.now()}`,
      title: aiGeneratedPrompt.name.trim(),
      prompt: aiGeneratedPrompt.prompt.trim(),
      category: aiGeneratedPrompt.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...customPrompts];
    setCustomPrompts(updated);
    saveCustomPrompts(updated);
    if (user?.id) saveCloudPrompt(user.id, newItem);
    addToast({ type: 'success', title: `"${newItem.title}" saved to library` });
    setTabMode('library');
    setSubView('list');
    setAiGeneratedPrompt(null);
    setAiGoal('');
  };

  // AI Prompt Improver
  const handleImprovePrompt = async () => {
    if (!improveInput.trim()) {
      addToast({ type: 'error', title: 'Please enter a prompt to improve' });
      return;
    }

    setImproveLoading(true);
    setImproveError(null);
    setImproveEditMode(false);

    try {
      const res = await fetch('/api/prompt-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve',
          prompt: improveInput.trim(),
          improvementType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to improve prompt');
      }

      setImprovedResult({
        name: data.name || 'Enhanced Prompt',
        prompt: data.prompt || '',
        originalPrompt: improveInput.trim(),
        category: data.category || 'General',
        changesSummary: data.changesSummary || 'Enhanced structure, role clarity, and output rules.',
      });
      addToast({ type: 'success', title: 'Prompt improved!' });
    } catch (err: any) {
      setImproveError(err.message || 'Prompt improvement failed');
      addToast({ type: 'error', title: err.message || 'Improvement failed' });
    } finally {
      setImproveLoading(false);
    }
  };

  const handleSaveImprovedPrompt = () => {
    if (!improvedResult) return;
    const newItem: PromptItem = {
      id: `custom_${Date.now()}`,
      title: improvedResult.name.trim(),
      prompt: improvedResult.prompt.trim(),
      category: improvedResult.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...customPrompts];
    setCustomPrompts(updated);
    saveCustomPrompts(updated);
    if (user?.id) saveCloudPrompt(user.id, newItem);
    addToast({ type: 'success', title: `"${newItem.title}" saved to library` });
    setTabMode('library');
    setSubView('list');
    setImprovedResult(null);
    setImproveInput('');
  };

  const getCategoryDetails = (cat?: string) => {
    return CATEGORY_DETAILS[cat || 'General'] || CATEGORY_DETAILS.General;
  };

  // Clean formatted rendering of structured prompt content
  const renderCleanStructuredPrompt = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`blank-${idx}`} className="h-2" />);
        return;
      }

      const headerMatch = trimmed.match(
        /^(?:###\s*|\*\*\s*|\b)(ROLE|GOAL|OBJECTIVE|INSTRUCTIONS|REQUIREMENTS|CONSTRAINTS|OUTPUT|OUTPUT FORMAT|GUIDELINES|CONTEXT|EXAMPLES|DELIVERABLES)(?:\*\*|:|\s*:)/i
      );

      if (headerMatch) {
        const headerTitle = headerMatch[1].toUpperCase();
        const rest = trimmed
          .replace(
            /^(?:###\s*|\*\*\s*|\b)(?:ROLE|GOAL|OBJECTIVE|INSTRUCTIONS|REQUIREMENTS|CONSTRAINTS|OUTPUT|OUTPUT FORMAT|GUIDELINES|CONTEXT|EXAMPLES|DELIVERABLES)(?:\*\*|:|\s*:)\s*/i,
            ''
          )
          .trim();

        elements.push(
          <div key={`header-${idx}`} className="mt-2.5 mb-1 first:mt-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider">
              {headerTitle}
            </div>
            {rest && (
              <div className="mt-1 text-zinc-700 dark:text-zinc-200 text-[12px] leading-relaxed">
                {renderTextWithVariables(rest)}
              </div>
            )}
          </div>
        );
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const bulletText = trimmed.replace(/^[-*•]\s+/, '');
        elements.push(
          <div
            key={`bullet-${idx}`}
            className="flex items-start gap-2 ml-1 text-zinc-700 dark:text-zinc-200 text-[12px] leading-relaxed my-0.5"
          >
            <span className="text-purple-600 dark:text-purple-400 mt-1 text-[8px]">•</span>
            <span className="flex-1">{renderTextWithVariables(bulletText)}</span>
          </div>
        );
        return;
      }

      const numberedMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
      if (numberedMatch) {
        elements.push(
          <div
            key={`num-${idx}`}
            className="flex items-start gap-2 ml-1 text-zinc-700 dark:text-zinc-200 text-[12px] leading-relaxed my-0.5"
          >
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px] shrink-0">
              {numberedMatch[1]}
            </span>
            <span className="flex-1">{renderTextWithVariables(numberedMatch[2])}</span>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${idx}`} className="text-zinc-700 dark:text-zinc-200 text-[12px] leading-relaxed my-1">
          {renderTextWithVariables(trimmed)}
        </p>
      );
    });

    return elements;
  };

  const renderTextWithVariables = (text: string) => {
    const cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^###+\s*/, '');
    const parts = cleaned.split(/(\{\{[a-zA-Z0-9_\-\s]+\}\})/g);

    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const varName = part.slice(2, -2).trim();
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded font-mono text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-300/80 dark:border-purple-500/30"
          >
            {`{{${varName}}}`}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-zinc-900 dark:text-white select-text">
      {/* =========================================================
          TOP CONTROLS: Search + Create & Segmented Switcher
      ========================================================= */}
      {subView === 'list' ? (
        <div className="shrink-0 space-y-2.5 pb-2">
          {/* Search Bar + Create Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-8 h-10 rounded-xl bg-purple-50/70 dark:bg-white/[0.05] border border-purple-200/80 dark:border-white/10 text-xs sm:text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 focus:bg-white dark:focus:bg-black/50 transition shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenCreate}
              className="h-10 px-3.5 sm:px-3 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              title="Create prompt manually"
            >
              <Plus size={15} />
              <span>Create</span>
            </button>
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div className="flex items-center border-b border-purple-100 dark:border-white/10 pb-0.5 gap-2 sm:gap-4 text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setTabMode('library')}
              className={`py-2 px-1.5 font-medium transition cursor-pointer relative shrink-0 flex items-center gap-1.5 ${
                tabMode === 'library'
                  ? 'text-[#8B6FC9] dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>Library</span>
              {customPrompts.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-mono font-semibold">
                  {customPrompts.length}
                </span>
              )}
              {tabMode === 'library' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B6FC9] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setTabMode('ai-creator')}
              className={`py-2 px-1.5 font-medium transition cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
                tabMode === 'ai-creator'
                  ? 'text-[#8B6FC9] dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles size={13} className={tabMode === 'ai-creator' ? 'text-[#8B6FC9] dark:text-purple-300' : 'text-zinc-400'} />
              <span>✦ AI Creator</span>
              {tabMode === 'ai-creator' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B6FC9] dark:bg-purple-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setTabMode('improve-prompt')}
              className={`py-2 px-1.5 font-medium transition cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
                tabMode === 'improve-prompt'
                  ? 'text-amber-600 dark:text-amber-300 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Wand2 size={13} className={tabMode === 'improve-prompt' ? 'text-amber-600 dark:text-amber-300' : 'text-zinc-400'} />
              <span>✨ Improve</span>
              {tabMode === 'improve-prompt' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 dark:bg-amber-400 rounded-full" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 flex items-center justify-between pb-3 mb-2 border-b border-purple-100 dark:border-white/10 px-1">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            {editingId ? 'Edit Prompt' : 'Create New Prompt'}
          </span>
          <button
            onClick={() => setSubView('list')}
            className="p-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* =========================================================
          SCROLLABLE ACTIVE TAB CONTENT AREA
      ========================================================= */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar pt-1 pr-0.5 space-y-3 pb-8">
        {/* TAB 1: PROMPT LIBRARY */}
        {subView === 'list' && tabMode === 'library' && (
          <div className="space-y-3">
            {/* Category Filter Chips Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              {[
                'All',
                '⭐ Starred',
                '📌 Pinned',
                'Coding',
                'Writing',
                'Image Generation',
                'Learning',
                'Career',
                'Research',
                'Custom',
              ].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition whitespace-nowrap cursor-pointer shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-[#8B6FC9] text-white font-semibold shadow-xs'
                        : 'bg-purple-50/80 hover:bg-purple-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-purple-200/60 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Prompt Cards List */}
            {filteredPrompts.length === 0 ? (
              <div className="py-8 sm:py-10 px-4 sm:px-6 text-center rounded-2xl border border-purple-200/70 dark:border-white/10 bg-purple-50/30 dark:bg-white/[0.02] space-y-3.5 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-400/25 flex items-center justify-center text-[#8B6FC9] dark:text-purple-300 mx-auto shadow-xs">
                  <BookOpen size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    {searchQuery || selectedCategory !== 'All'
                      ? 'No matching prompts found'
                      : 'Your prompt library is empty'}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[300px] mx-auto">
                    {searchQuery || selectedCategory !== 'All'
                      ? 'Try adjusting your search query or category filter.'
                      : 'Create your first prompt, let AI generate one, or load starter templates.'}
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5 max-w-[260px] mx-auto">
                  <button
                    onClick={handleOpenCreate}
                    className="w-full h-11 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-[#6B52A3] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:border-white/10 dark:text-white transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Plus size={15} />
                    <span>Create Custom Prompt</span>
                  </button>
                  <button
                    onClick={() => setTabMode('ai-creator')}
                    className="w-full h-11 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-semibold transition cursor-pointer active:scale-95 shadow-md shadow-[#8B6FC9]/25 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} />
                    <span>✦ AI Prompt Creator</span>
                  </button>
                  <button
                    onClick={handleLoadStarters}
                    className="w-full py-1.5 text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200 underline transition cursor-pointer font-medium"
                  >
                    Load Starter Templates
                  </button>
                </div>
              </div>
            ) : (
              filteredPrompts.map((p) => {
                const isFav = favorites.has(p.id);
                const isPin = pinned.has(p.id);
                const vars = extractVariables(p.prompt);
                const catDetails = getCategoryDetails(p.category);
                const isMenuOpen = activeMenuId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleUsePrompt(p.prompt)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all group cursor-pointer flex flex-col justify-between gap-2.5 select-none active:scale-[0.99] ${
                      isPin
                        ? 'bg-purple-50/70 dark:bg-[#18112e] border-[#8B6FC9]/70 dark:border-purple-500/40 shadow-xs'
                        : 'bg-white hover:bg-purple-50/40 dark:bg-[#140e24] dark:hover:bg-[#1a1230] border-[#E8E4EF] hover:border-[#8B6FC9]/40 dark:border-white/[0.08] dark:hover:border-white/20 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Title + Pin/Star Icons */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isPin && <Pin size={13} className="text-[#8B6FC9] dark:text-purple-300 fill-current shrink-0 rotate-45" />}
                        <span className="text-sm shrink-0">{catDetails.icon}</span>
                        <span className="font-semibold text-[13.5px] sm:text-xs text-zinc-900 dark:text-white group-hover:text-[#8B6FC9] dark:group-hover:text-purple-300 transition-colors truncate">
                          {p.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleFavorite(p.id, e)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isFav
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-zinc-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400'
                          }`}
                          title={isFav ? 'Unstar' : 'Star favorite'}
                        >
                          <Star size={15} className={isFav ? 'fill-amber-400' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Prompt Text Preview */}
                    <p className="text-[12.5px] sm:text-[12px] text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white line-clamp-2 leading-relaxed font-normal">
                      {p.prompt}
                    </p>

                    {/* Bottom Row: Category & Variables + Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-purple-100/80 dark:border-white/[0.06] text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-purple-800 dark:text-purple-300 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/20">
                          {p.category || 'General'}
                        </span>
                        {vars.length > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-300 text-[10.5px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                            <Variable size={10} />
                            <span>{vars.length} var{vars.length > 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* More Actions Dropdown Menu */}
                        <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-white hover:bg-purple-100 dark:hover:bg-white/10 transition cursor-pointer"
                            title="More options"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-1 z-30 w-40 rounded-xl bg-white dark:bg-[#1a1236] border border-purple-200 dark:border-white/15 shadow-2xl p-1 text-xs space-y-0.5 animate-[fadeIn_0.1s_ease-out]">
                              <button
                                onClick={() => handleCopyPrompt(p.id, p.prompt)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-500/20 transition cursor-pointer"
                              >
                                <Copy size={13} />
                                <span>Copy Text</span>
                              </button>
                              <button
                                onClick={() => handleTogglePin(p.id)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-500/20 transition cursor-pointer"
                              >
                                <Pin size={13} />
                                <span>{isPin ? 'Unpin' : 'Pin to top'}</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-500/20 transition cursor-pointer"
                              >
                                <Edit3 size={13} />
                                <span>Edit Prompt</span>
                              </button>
                              <div className="h-[1px] bg-purple-100 dark:bg-white/10 my-0.5" />
                              <button
                                onClick={() => handleDeletePrompt(p.id)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition cursor-pointer"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Primary Use Button */}
                        <button
                          onClick={() => handleUsePrompt(p.prompt)}
                          className="h-8 px-3.5 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                          title="Insert into chat composer"
                        >
                          <span>Use</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SIMPLIFIED AI PROMPT CREATOR */}
        {subView === 'list' && tabMode === 'ai-creator' && (
          <div className="space-y-3.5">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#8B6FC9] dark:text-purple-300" />
                <span>What do you want to create?</span>
              </h3>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                Describe your goal and Nyra will create a reusable prompt.
              </p>
            </div>

            {/* Main Input */}
            <textarea
              rows={4}
              placeholder="Create a prompt for reviewing my React application for bugs, performance and accessibility..."
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-2xl bg-purple-50/60 dark:bg-white/[0.04] border border-purple-200/80 dark:border-white/10 text-xs sm:text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 focus:bg-white dark:focus:bg-black/50 transition resize-none leading-relaxed shadow-xs"
              autoFocus
            />

            {/* Compact Category Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-purple-200">Category</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { name: 'Coding', icon: '💻' },
                  { name: 'Writing', icon: '✍️' },
                  { name: 'Learning', icon: '📚' },
                  { name: 'Career', icon: '💼' },
                  { name: 'Image Generation', icon: '🎨', short: 'Image' },
                  { name: 'Research', icon: '🔍' },
                ].map((c) => {
                  const isSelected = aiSelectedCategory === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setAiSelectedCategory(isSelected ? '' : c.name)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-[#8B6FC9] text-white font-semibold shadow-xs'
                          : 'bg-purple-50/80 hover:bg-purple-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-purple-200/60 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.short || c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {aiError && <p className="text-xs text-rose-500 dark:text-rose-400 px-1">{aiError}</p>}

            {/* Generate Button (Full Width Primary Action) */}
            <button
              onClick={handleGenerateAiPrompt}
              disabled={aiLoading || !aiGoal.trim()}
              className="w-full h-11 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] disabled:opacity-50 text-white text-xs sm:text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-md shadow-[#8B6FC9]/25"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>✦ Generate Prompt</span>
                </>
              )}
            </button>

            {/* Redesigned Generated Prompt Preview Card */}
            {aiGeneratedPrompt && (
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#160f2a] border border-purple-200 dark:border-purple-400/30 space-y-3 shadow-xs dark:shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>✦ Generated Prompt</span>
                  </span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-400/20">
                    {aiGeneratedPrompt.category}
                  </span>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={aiGeneratedPrompt.name}
                  onChange={(e) => setAiGeneratedPrompt({ ...aiGeneratedPrompt, name: e.target.value })}
                  className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white border-b border-transparent hover:border-purple-200 focus:border-purple-500 outline-none pb-0.5"
                />

                <div className="border-t border-purple-100 dark:border-white/10" />

                {/* Structured Prompt Content View / Raw Toggle */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Prompt Content</span>
                  <button
                    type="button"
                    onClick={() => setAiEditMode(!aiEditMode)}
                    className="text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200 font-semibold underline text-[11px]"
                  >
                    {aiEditMode ? 'View Formatted' : 'Edit Text'}
                  </button>
                </div>

                {aiEditMode ? (
                  <textarea
                    rows={8}
                    value={aiGeneratedPrompt.prompt}
                    onChange={(e) => setAiGeneratedPrompt({ ...aiGeneratedPrompt, prompt: e.target.value })}
                    className="w-full p-3 rounded-xl bg-purple-50/50 dark:bg-black/40 border border-purple-200 dark:border-white/10 text-[12px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-purple-500 font-sans leading-relaxed resize-none"
                  />
                ) : (
                  <div className="max-h-72 overflow-y-auto custom-scrollbar p-3 rounded-xl bg-purple-50/40 dark:bg-black/30 border border-purple-100 dark:border-white/[0.06] text-[12px]">
                    {renderCleanStructuredPrompt(aiGeneratedPrompt.prompt)}
                  </div>
                )}

                <div className="border-t border-purple-100 dark:border-white/10" />

                {/* Action Buttons: Copy, Use in Chat (Primary), Save */}
                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyPrompt('ai-gen', aiGeneratedPrompt.prompt)}
                    className="h-9 px-3 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 border border-transparent hover:border-purple-200 dark:hover:border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'ai-gen' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedId === 'ai-gen' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleSaveAiPrompt}
                      className="h-9 px-3.5 rounded-xl text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-200 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/15 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-400/30 transition cursor-pointer"
                    >
                      Save to Library
                    </button>
                    <button
                      onClick={() => handleUsePrompt(aiGeneratedPrompt.prompt)}
                      className="h-9 px-4 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Use in Chat</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMPROVE PROMPT */}
        {subView === 'list' && tabMode === 'improve-prompt' && (
          <div className="space-y-3.5">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Wand2 size={14} className="text-amber-600 dark:text-amber-300" />
                <span>Improve an existing prompt</span>
              </h3>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                Paste any prompt to enhance its clarity, tone, detail, or examples.
              </p>
            </div>

            {/* Main Input */}
            <textarea
              rows={4}
              placeholder="e.g. make a website, write a cover letter, analyze quarterly sales data..."
              value={improveInput}
              onChange={(e) => setImproveInput(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-2xl bg-purple-50/60 dark:bg-white/[0.04] border border-purple-200/80 dark:border-white/10 text-xs sm:text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 focus:bg-white dark:focus:bg-black/50 transition resize-none leading-relaxed shadow-xs"
              autoFocus
            />

            {/* Quick Improvement Style Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-amber-200">Improvement Style</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'detailed', label: '⚡ More detailed' },
                  { id: 'short', label: '✂️ Shorter' },
                  { id: 'professional', label: '👔 Professional' },
                  { id: 'examples', label: '💡 Add examples' },
                  { id: 'clarity', label: '🔍 Improve clarity' },
                ].map((style) => {
                  const isSelected = improvementType === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setImprovementType(style.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-white dark:text-slate-950 font-semibold shadow-xs'
                          : 'bg-purple-50/80 hover:bg-purple-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-purple-200/60 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {improveError && <p className="text-xs text-rose-500 dark:text-rose-400 px-1">{improveError}</p>}

            {/* Improve Button */}
            <button
              onClick={handleImprovePrompt}
              disabled={improveLoading || !improveInput.trim()}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-md shadow-amber-500/20"
            >
              {improveLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Enhancing Prompt...</span>
                </>
              ) : (
                <>
                  <Wand2 size={15} />
                  <span>✨ Improve Prompt</span>
                </>
              )}
            </button>

            {/* Improved Result Card */}
            {improvedResult && (
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#160f2a] border border-amber-200 dark:border-amber-400/30 space-y-3 shadow-xs dark:shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Wand2 size={13} />
                    <span>✨ Improved Prompt</span>
                  </span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20">
                    {improvedResult.category}
                  </span>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={improvedResult.name}
                  onChange={(e) => setImprovedResult({ ...improvedResult, name: e.target.value })}
                  className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white border-b border-transparent hover:border-amber-200 focus:border-amber-500 outline-none pb-0.5"
                />

                {/* What was improved callout */}
                {improvedResult.changesSummary && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 text-[11.5px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    ✨ <strong>What was improved:</strong> {improvedResult.changesSummary}
                  </div>
                )}

                <div className="border-t border-amber-100 dark:border-white/10" />

                {/* Structured Prompt Content View / Raw Toggle */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Prompt Content</span>
                  <button
                    type="button"
                    onClick={() => setImproveEditMode(!improveEditMode)}
                    className="text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200 font-semibold underline text-[11px]"
                  >
                    {improveEditMode ? 'View Formatted' : 'Edit Text'}
                  </button>
                </div>

                {improveEditMode ? (
                  <textarea
                    rows={8}
                    value={improvedResult.prompt}
                    onChange={(e) => setImprovedResult({ ...improvedResult, prompt: e.target.value })}
                    className="w-full p-3 rounded-xl bg-purple-50/50 dark:bg-black/40 border border-amber-200 dark:border-white/10 text-[12px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500 font-sans leading-relaxed resize-none"
                  />
                ) : (
                  <div className="max-h-72 overflow-y-auto custom-scrollbar p-3 rounded-xl bg-amber-50/40 dark:bg-black/30 border border-amber-100 dark:border-white/[0.06] text-[12px]">
                    {renderCleanStructuredPrompt(improvedResult.prompt)}
                  </div>
                )}

                <div className="border-t border-purple-100 dark:border-white/10" />

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyPrompt('improved-gen', improvedResult.prompt)}
                    className="h-9 px-3 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-white/5 border border-transparent hover:border-amber-200 dark:hover:border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'improved-gen' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedId === 'improved-gen' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleSaveImprovedPrompt}
                      className="h-9 px-3.5 rounded-xl text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-200 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/15 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-400/30 transition cursor-pointer"
                    >
                      Save to Library
                    </button>
                    <button
                      onClick={() => handleUsePrompt(improvedResult.prompt)}
                      className="h-9 px-4 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Use in Chat</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANUAL CREATE / EDIT PROMPT FORM */}
        {subView === 'manual-create' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-purple-200 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g. React 19 & TypeScript Code Reviewer"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-purple-50/60 dark:bg-white/[0.04] border border-purple-200/80 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] transition"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-purple-200 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-purple-50/60 dark:bg-[#140e28] border border-purple-200/80 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none focus:border-[#8B6FC9] transition cursor-pointer"
              >
                {PROMPT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-purple-200">
                  Prompt Instructions *
                </label>
                <span className="text-[10px] text-[#8B6FC9] dark:text-purple-300/80 font-mono">
                  Supports {'{{variables}}'}
                </span>
              </div>
              <textarea
                rows={7}
                placeholder="Enter prompt instructions... Tip: you can use {{role}} or {{topic}} as dynamic placeholders."
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                className="w-full min-h-[140px] px-3.5 py-3 rounded-xl bg-purple-50/60 dark:bg-white/[0.04] border border-purple-200/80 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] transition resize-none leading-relaxed font-sans text-[12.5px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSubView('list')}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualPrompt}
                className="h-10 px-5 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
              >
                {editingId ? 'Update Prompt' : 'Save to Library'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          PROMPT VARIABLES FILLER MODAL
      ========================================================= */}
      {variableModalPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-[#140e26] border-t sm:border border-purple-200 dark:border-white/15 p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-900 dark:text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 flex items-center justify-center">
                  <Variable size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Fill Prompt Variables</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Customize template placeholders</p>
                </div>
              </div>
              <button
                onClick={() => setVariableModalPrompt(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
              {variableKeys.map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200 capitalize mb-1">
                    {key.replace(/[_-]/g, ' ')}
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. value for ${key}`}
                    value={variableValues[key] || ''}
                    onChange={(e) =>
                      setVariableValues({
                        ...variableValues,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3.5 rounded-xl bg-purple-50/70 dark:bg-white/[0.04] border border-purple-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100 dark:border-white/10 shrink-0">
              <button
                onClick={() => setVariableModalPrompt(null)}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVariables}
                className="h-10 px-5 rounded-xl bg-[#8B6FC9] hover:bg-[#7D5FB9] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
              >
                Insert into Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
