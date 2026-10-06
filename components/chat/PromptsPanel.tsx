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
  ChevronDown,
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
  'Productivity',
  'Custom',
] as const;

export const ALL_FILTER_CATEGORIES = [
  { name: 'All', icon: '⚡' },
  { name: '⭐ Starred', icon: '⭐' },
  { name: '📌 Pinned', icon: '📌' },
  { name: 'General', icon: '⚡' },
  { name: 'Coding', icon: '💻' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Productivity', icon: '🎯' },
  { name: 'Custom', icon: '🧠' },
];

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; icon: string; color: string; desc: string }
> = {
  General: {
    label: 'General',
    icon: '⚡',
    color: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10',
    desc: 'Everyday productivity prompts',
  },
  Coding: {
    label: 'Coding',
    icon: '💻',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    desc: 'Code review, debugging & architecture',
  },
  Writing: {
    label: 'Writing',
    icon: '✍️',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
    desc: 'Essays, emails, copy & summaries',
  },
  Productivity: {
    label: 'Productivity',
    icon: '🎯',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    desc: 'Planning, synthesis & task management',
  },
  Custom: {
    label: 'Custom',
    icon: '🧠',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    desc: 'Tailored personal templates',
  },
};

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formCategory, setFormCategory] = useState<string>('General');

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

  const [variableModalPrompt, setVariableModalPrompt] = useState<string | null>(null);
  const [variableKeys, setVariableKeys] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const menuRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (activeMenuId || isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuId, isCategoryDropdownOpen]);

  useEffect(() => {
    const loaded = loadCustomPrompts(user?.id);
    setCustomPrompts(loaded || []);

    try {
      const favKey = user?.id ? `nyra_prompt_favorites_${user.id}` : 'nyra_prompt_favorites';
      const storedFavs = localStorage.getItem(favKey) || localStorage.getItem('nyra_prompt_favorites');
      if (storedFavs) setFavorites(new Set(JSON.parse(storedFavs)));

      const pinKey = user?.id ? `nyra_prompt_pinned_${user.id}` : 'nyra_prompt_pinned';
      const storedPins = localStorage.getItem(pinKey) || localStorage.getItem('nyra_prompt_pinned');
      if (storedPins) setPinned(new Set(JSON.parse(storedPins)));
    } catch (e) {
      console.error(e);
    }

    if (user?.id) {
      fetchCloudPrompts(user.id).then((cloud) => {
        if (cloud && cloud.length > 0) {
          const filtered = cloud.filter((p) => p && p.isCustom !== false);
          setCustomPrompts(filtered);
          saveCustomPrompts(filtered, user.id);
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

  const filteredPrompts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];

    return sortedPrompts.filter((p) => {
      if (selectedCategory === '⭐ Starred' && !favorites.has(p.id)) return false;
      if (selectedCategory === '📌 Pinned' && !pinned.has(p.id)) return false;

      const matchesCategory =
        selectedCategory === 'All' ||
        selectedCategory === '⭐ Starred' ||
        selectedCategory === '📌 Pinned' ||
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
  }, [sortedPrompts, selectedCategory, searchQuery, favorites, pinned]);

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
      const favKey = user?.id ? `nyra_prompt_favorites_${user.id}` : 'nyra_prompt_favorites';
      localStorage.setItem(favKey, JSON.stringify(Array.from(next)));
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
      const pinKey = user?.id ? `nyra_prompt_pinned_${user.id}` : 'nyra_prompt_pinned';
      localStorage.setItem(pinKey, JSON.stringify(Array.from(next)));
    } catch (err) {
      console.error(err);
    }
  };

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
    addToast({ type: 'success', title: 'Prompt applied to composer' });
  };

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
    addToast({ type: 'success', title: 'Template filled and applied to composer' });
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
    saveCustomPrompts(updated, user?.id);
    if (user?.id) deleteCloudPrompt(user.id, id);
    addToast({ type: 'info', title: 'Prompt deleted' });
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
    saveCustomPrompts(updatedList, user?.id);
    setSubView('list');
    setEditingId(null);
  };

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
    saveCustomPrompts(updated, user?.id);
    if (user?.id) saveCloudPrompt(user.id, newItem);
    addToast({ type: 'success', title: `"${newItem.title}" saved to library` });
    setTabMode('library');
    setSubView('list');
    setAiGeneratedPrompt(null);
    setAiGoal('');
  };

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
    saveCustomPrompts(updated, user?.id);
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

  const renderCleanStructuredPrompt = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`blank-${idx}`} className="h-1.5" />);
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
          <div key={`header-${idx}`} className="mt-2 mb-0.5 first:mt-0">
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-300 font-bold text-[10px] uppercase tracking-wider">
              {headerTitle}
            </div>
            {rest && (
              <div className="mt-0.5 text-[#261827] dark:text-zinc-200 text-xs leading-relaxed">
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
            className="flex items-start gap-1.5 ml-1 text-[#261827] dark:text-zinc-200 text-xs leading-relaxed my-0.5"
          >
            <span className="text-[#B31372] dark:text-pink-400 mt-1 text-[8px]">•</span>
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
            className="flex items-start gap-1.5 ml-1 text-[#261827] dark:text-zinc-200 text-xs leading-relaxed my-0.5"
          >
            <span className="text-[#B31372] dark:text-pink-400 font-semibold text-[11px] shrink-0">
              {numberedMatch[1]}
            </span>
            <span className="flex-1">{renderTextWithVariables(numberedMatch[2])}</span>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${idx}`} className="text-[#261827] dark:text-zinc-200 text-xs leading-relaxed my-0.5">
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
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded font-mono text-[10.5px] font-semibold bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-900/50 dark:text-pink-200 border border-[#E8E4EF] dark:border-pink-500/30"
          >
            {`{{${varName}}}`}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-[#261827] dark:text-zinc-100 select-text">
      {subView === 'list' ? (
        <div className="shrink-0 space-y-2 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0 group">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E93A2] dark:text-zinc-500 group-focus-within:text-[#B31372] dark:group-focus-within:text-pink-400 transition-colors pointer-events-none"
              />
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
                className="w-full pl-[38px] pr-8 h-[42px] sm:h-[38px] rounded-[10px] bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-500/60 focus:ring-2 focus:ring-[#B31372]/15 dark:focus:ring-pink-500/15 focus:bg-white dark:focus:bg-[#0E0514] transition shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-1 rounded-md text-[#9E93A2] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenCreate}
              className="h-[42px] sm:h-[38px] px-3 sm:px-3.5 rounded-[10px] bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              title="Create prompt manually"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Create</span>
            </button>
          </div>

          {tabMode === 'library' && (
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                className={`w-full h-[44px] sm:h-[38px] px-3.5 sm:px-3 rounded-[10px] border transition flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.99] text-xs ${
                  selectedCategory !== 'All'
                    ? 'bg-[#F4DCE9]/60 dark:bg-pink-500/15 border-[#B31372]/40 dark:border-pink-500/40 text-[#8A0E57] dark:text-pink-200 font-semibold'
                    : 'bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-[#E8E4EF] dark:border-white/[0.08] text-[#261827] dark:text-zinc-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs shrink-0">
                    {ALL_FILTER_CATEGORIES.find((c) => c.name === selectedCategory)?.icon || '⚡'}
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
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/15 shadow-2xl p-1 text-xs space-y-0.5 animate-[fadeIn_0.1s_ease-out] max-h-72 sm:max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9E93A2] dark:text-zinc-400 border-b border-[#E8E4EF]/70 dark:border-white/[0.06] mb-1 flex items-center justify-between">
                    <span>Categories</span>
                    <div className="flex items-center gap-2">
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCategoryDropdownOpen(false);
                        }}
                        className="p-1 rounded-md text-[#9E93A2] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                        title="Close"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {ALL_FILTER_CATEGORIES.map((opt) => {
                    const isSelected = selectedCategory === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(opt.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] rounded-lg text-left flex items-center justify-between transition cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-200 font-semibold'
                            : 'text-[#261827] dark:text-zinc-300 hover:bg-[#F7F3FA] dark:hover:bg-white/[0.06] hover:text-[#B31372] dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs shrink-0">{opt.icon}</span>
                          <span className="truncate">{opt.name === 'All' ? 'All Categories' : opt.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-[#B31372] dark:text-pink-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center border-b border-[#E8E4EF] dark:border-white/[0.08] pb-0.5 gap-2 text-xs overflow-x-auto scrollbar-none pt-0.5">
            <button
              onClick={() => setTabMode('library')}
              className={`py-2 sm:py-1.5 px-2.5 sm:px-2 font-medium transition cursor-pointer relative shrink-0 flex items-center gap-1.5 min-h-[38px] sm:min-h-[32px] ${
                tabMode === 'library'
                  ? 'text-[#B31372] dark:text-white font-bold'
                  : 'text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>Library</span>
              {customPrompts.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-300 font-mono font-semibold">
                  {customPrompts.length}
                </span>
              )}
              {tabMode === 'library' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B31372] dark:bg-pink-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setTabMode('ai-creator')}
              className={`py-2 sm:py-1.5 px-2.5 sm:px-2 font-medium transition cursor-pointer relative flex items-center gap-1.5 shrink-0 min-h-[38px] sm:min-h-[32px] ${
                tabMode === 'ai-creator'
                  ? 'text-[#B31372] dark:text-white font-bold'
                  : 'text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles
                size={13}
                className={tabMode === 'ai-creator' ? 'text-[#B31372] dark:text-pink-300' : 'text-[#9E93A2] dark:text-zinc-500'}
              />
              <span>AI Creator</span>
              {tabMode === 'ai-creator' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B31372] dark:bg-pink-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setTabMode('improve-prompt')}
              className={`py-2 sm:py-1.5 px-2.5 sm:px-2 font-medium transition cursor-pointer relative flex items-center gap-1.5 shrink-0 min-h-[38px] sm:min-h-[32px] ${
                tabMode === 'improve-prompt'
                  ? 'text-amber-600 dark:text-amber-300 font-bold'
                  : 'text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Wand2
                size={13}
                className={tabMode === 'improve-prompt' ? 'text-amber-600 dark:text-amber-300' : 'text-[#9E93A2] dark:text-zinc-500'}
              />
              <span>Improve</span>
              {tabMode === 'improve-prompt' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 dark:bg-amber-400 rounded-full" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 flex items-center justify-between pb-2.5 mb-2 border-b border-[#E8E4EF] dark:border-white/[0.08] px-0.5">
          <span className="text-xs sm:text-sm font-bold text-[#261827] dark:text-white">
            {editingId ? 'Edit Prompt' : 'Create New Prompt'}
          </span>
          <button
            onClick={() => setSubView('list')}
            className="p-1 text-xs text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar pt-1 pr-0.5 space-y-3 pb-4">
        {subView === 'list' && tabMode === 'library' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pt-0.5 pb-1 text-xs text-[#6E6072] dark:text-zinc-400 font-semibold border-b border-[#E8E4EF] dark:border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#261827] dark:text-white font-bold text-xs">My Prompts</span>
                {customPrompts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-300 font-mono font-semibold">
                    {customPrompts.length}
                  </span>
                )}
              </div>
              {filteredPrompts.length !== customPrompts.length && customPrompts.length > 0 && (
                <span className="text-[11px] text-[#9E93A2] dark:text-zinc-500">
                  {filteredPrompts.length} of {customPrompts.length}
                </span>
              )}
            </div>

            {customPrompts.length === 0 ? (
              <div className="py-8 sm:py-10 px-4 text-center rounded-2xl border border-dashed border-[#E8E4EF] dark:border-white/10 bg-[#FAF8FB]/60 dark:bg-white/[0.02] space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-400/25 flex items-center justify-center text-[#B31372] dark:text-pink-300 mx-auto shadow-xs">
                  <BookOpen size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#261827] dark:text-white">
                    No saved prompts yet
                  </h4>
                  <p className="text-[11.5px] text-[#6E6072] dark:text-zinc-400 leading-relaxed max-w-[260px] mx-auto">
                    Create your first prompt or let Nyra create one for you with AI.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-[280px] mx-auto">
                  <button
                    onClick={handleOpenCreate}
                    className="w-full sm:w-auto h-[38px] px-4 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Create Prompt</span>
                  </button>
                  <button
                    onClick={() => setTabMode('ai-creator')}
                    className="w-full sm:w-auto h-[38px] px-3.5 rounded-xl bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/10 text-xs font-medium text-[#261827] dark:text-zinc-200 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles size={13} className="text-[#B31372] dark:text-pink-400" />
                    <span>Generate with AI</span>
                  </button>
                </div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="py-7 px-4 text-center rounded-2xl border border-[#E8E4EF] dark:border-white/[0.08] bg-[#FAF8FB] dark:bg-white/[0.02] space-y-2.5 shadow-xs">
                <p className="text-xs font-semibold text-[#261827] dark:text-white">
                  No matching prompts found
                </p>
                <p className="text-[11.5px] text-[#6E6072] dark:text-zinc-400 max-w-[260px] mx-auto">
                  Try adjusting your search query or reset your category filter.
                </p>
                <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-2.5 py-1 text-xs text-[#B31372] dark:text-pink-300 hover:underline font-medium cursor-pointer"
                    >
                      Clear search query
                    </button>
                  )}
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="px-2.5 py-1 text-xs text-[#B31372] dark:text-pink-300 hover:underline font-medium cursor-pointer"
                    >
                      Reset category filter
                    </button>
                  )}
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
                    className={`relative p-3 sm:p-3.5 rounded-xl border transition-all group cursor-pointer flex flex-col justify-between gap-2 select-none active:scale-[0.99] ${
                      isPin
                        ? 'bg-[#FBF6FA] dark:bg-[#180C24] border-[#B31372]/40 dark:border-pink-500/40 shadow-xs'
                        : 'bg-white hover:bg-[#FAF8FB] dark:bg-[#130A1C] dark:hover:bg-[#180C24] border-[#E8E4EF] hover:border-[#B31372]/30 dark:border-white/[0.07] dark:hover:border-white/15 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isPin && (
                          <Pin size={12} className="text-[#B31372] dark:text-pink-300 fill-current shrink-0 rotate-45" />
                        )}
                        <span className="text-xs shrink-0">{catDetails.icon}</span>
                        <span className="font-semibold text-xs text-[#261827] dark:text-white group-hover:text-[#B31372] dark:group-hover:text-pink-300 transition-colors truncate">
                          {p.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleFavorite(p.id, e)}
                          className={`p-1 rounded-lg transition cursor-pointer ${
                            isFav
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-zinc-400 hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-400'
                          }`}
                          title={isFav ? 'Unstar' : 'Star favorite'}
                        >
                          <Star size={14} className={isFav ? 'fill-amber-400' : ''} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-[#6E6072] dark:text-zinc-300 group-hover:text-[#261827] dark:group-hover:text-white line-clamp-2 leading-relaxed font-normal bg-[#F7F3FA]/70 dark:bg-black/20 p-2 rounded-lg border border-[#E8E4EF]/60 dark:border-white/[0.03]">
                      {p.prompt}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E8E4EF]/70 dark:border-white/[0.06] text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#8A0E57] dark:text-pink-300 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E8E4EF] dark:border-pink-400/20">
                          {p.category || 'General'}
                        </span>
                        {vars.length > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                            <Variable size={9} />
                            <span>
                              {vars.length} var{vars.length > 1 ? 's' : ''}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : p.id)}
                            className="p-1 rounded-lg text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                            title="More options"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-1 z-30 w-36 rounded-xl bg-white dark:bg-[#1A0C26] border border-[#E8E4EF] dark:border-white/15 shadow-xl p-1 text-xs space-y-0.5 animate-[fadeIn_0.1s_ease-out]">
                              <button
                                onClick={() => handleCopyPrompt(p.id, p.prompt)}
                                className="w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-2 text-[#261827] dark:text-zinc-200 hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition cursor-pointer text-[11.5px]"
                              >
                                <Copy size={12} />
                                <span>Copy Text</span>
                              </button>
                              <button
                                onClick={() => handleTogglePin(p.id)}
                                className="w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-2 text-[#261827] dark:text-zinc-200 hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition cursor-pointer text-[11.5px]"
                              >
                                <Pin size={12} />
                                <span>{isPin ? 'Unpin' : 'Pin to top'}</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-2 text-[#261827] dark:text-zinc-200 hover:bg-[#F7F3FA] dark:hover:bg-white/[0.08] transition cursor-pointer text-[11.5px]"
                              >
                                <Edit3 size={12} />
                                <span>Edit Prompt</span>
                              </button>
                              <div className="h-[1px] bg-[#E8E4EF] dark:bg-white/10 my-0.5" />
                              <button
                                onClick={() => handleDeletePrompt(p.id)}
                                className="w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition cursor-pointer text-[11.5px]"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleUsePrompt(p.prompt)}
                          className="h-7 px-2.5 rounded-lg bg-[#F7F3FA] hover:bg-[#B31372] hover:text-white dark:bg-white/[0.06] dark:hover:bg-pink-600 text-[#261827] dark:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-xs border border-[#E8E4EF] dark:border-white/[0.06]"
                          title="Insert into chat composer"
                        >
                          <span>Use</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {subView === 'list' && tabMode === 'ai-creator' && (
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-[#261827] dark:text-white flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#B31372] dark:text-pink-300" />
                <span>What do you want to create?</span>
              </h3>
              <p className="text-[11px] text-[#6E6072] dark:text-zinc-400">
                Describe your goal and Nyra will synthesize a reusable prompt.
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Review my React components for bugs, performance and TypeScript typings..."
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-500/60 focus:bg-white dark:focus:bg-[#0E0514] transition resize-none leading-relaxed shadow-xs"
              autoFocus
            />

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300">Category</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { name: 'Coding', icon: '💻' },
                  { name: 'Writing', icon: '✍️' },
                  { name: 'Learning', icon: '📚' },
                  { name: 'Career', icon: '💼' },
                  { name: 'Image Generation', icon: '🎨' },
                  { name: 'Research', icon: '🔍' },
                ].map((c) => {
                  const isSelected = aiSelectedCategory === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setAiSelectedCategory(isSelected ? '' : c.name)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer flex items-center gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-[#B31372] text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                          : 'bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-[#E8E4EF] dark:border-white/[0.06] text-[#6E6072] dark:text-zinc-300 hover:text-[#261827] dark:hover:text-white'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {aiError && <p className="text-xs text-rose-500 dark:text-rose-400 px-0.5">{aiError}</p>}

            <button
              onClick={handleGenerateAiPrompt}
              disabled={aiLoading || !aiGoal.trim()}
              className="w-full h-9 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-xs"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Generating Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Prompt</span>
                </>
              )}
            </button>

            {aiGeneratedPrompt && (
              <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-[#150A20] border border-[#E8E4EF] dark:border-pink-500/30 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B31372] dark:text-pink-300 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>Generated Prompt</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4DCE9] text-[#8A0E57] dark:bg-pink-500/20 dark:text-pink-300 border border-[#E8E4EF] dark:border-pink-400/20">
                    {aiGeneratedPrompt.category}
                  </span>
                </div>

                <input
                  type="text"
                  value={aiGeneratedPrompt.name}
                  onChange={(e) => setAiGeneratedPrompt({ ...aiGeneratedPrompt, name: e.target.value })}
                  className="w-full bg-transparent text-xs font-bold text-[#261827] dark:text-white border-b border-transparent hover:border-[#E8E4EF] focus:border-[#B31372] outline-none pb-0.5"
                />

                <div className="border-t border-[#E8E4EF] dark:border-white/10" />

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6E6072] dark:text-zinc-400 font-medium">Prompt Content</span>
                  <button
                    type="button"
                    onClick={() => setAiEditMode(!aiEditMode)}
                    className="text-[#B31372] hover:text-[#8A0E57] dark:text-pink-300 dark:hover:text-pink-200 font-semibold underline text-[11px]"
                  >
                    {aiEditMode ? 'View Formatted' : 'Edit Text'}
                  </button>
                </div>

                {aiEditMode ? (
                  <textarea
                    rows={6}
                    value={aiGeneratedPrompt.prompt}
                    onChange={(e) => setAiGeneratedPrompt({ ...aiGeneratedPrompt, prompt: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F7F3FA] dark:bg-black/30 border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-zinc-100 outline-none focus:border-[#B31372] font-sans leading-relaxed resize-none"
                  />
                ) : (
                  <div className="max-h-56 overflow-y-auto custom-scrollbar p-2.5 rounded-xl bg-[#F7F3FA]/70 dark:bg-black/20 border border-[#E8E4EF] dark:border-white/[0.06] text-xs">
                    {renderCleanStructuredPrompt(aiGeneratedPrompt.prompt)}
                  </div>
                )}

                <div className="border-t border-[#E8E4EF] dark:border-white/10" />

                <div className="flex items-center justify-between pt-0.5 gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyPrompt('ai-gen', aiGeneratedPrompt.prompt)}
                    className="h-8 px-2.5 rounded-xl text-xs font-medium text-[#6E6072] hover:text-[#261827] dark:text-zinc-300 dark:hover:text-white hover:bg-[#F7F3FA] dark:hover:bg-white/5 border border-transparent hover:border-[#E8E4EF] dark:hover:border-white/10 transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'ai-gen' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedId === 'ai-gen' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={handleSaveAiPrompt}
                      className="h-8 px-3 rounded-xl text-xs font-semibold text-[#8A0E57] hover:text-[#261827] dark:text-pink-200 bg-[#F4DCE9] hover:bg-[#F0EAF5] dark:bg-pink-500/15 dark:hover:bg-pink-500/25 border border-[#E8E4EF] dark:border-pink-400/30 transition cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleUsePrompt(aiGeneratedPrompt.prompt)}
                      className="h-8 px-3.5 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                    >
                      <span>Use in Chat</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {subView === 'list' && tabMode === 'improve-prompt' && (
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-[#261827] dark:text-white flex items-center gap-1.5">
                <Wand2 size={13} className="text-amber-600 dark:text-amber-300" />
                <span>Improve an existing prompt</span>
              </h3>
              <p className="text-[11px] text-[#6E6072] dark:text-zinc-400">
                Paste any prompt to enhance its clarity, tone, detail, or examples.
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Write a cover letter for a frontend developer role..."
              value={improveInput}
              onChange={(e) => setImproveInput(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/[0.08] text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-500/60 focus:bg-white dark:focus:bg-[#0E0514] transition resize-none leading-relaxed shadow-xs"
              autoFocus
            />

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#6E6072] dark:text-amber-200">Improvement Style</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'detailed', label: '⚡ Detailed' },
                  { id: 'short', label: '✂️ Shorter' },
                  { id: 'professional', label: '👔 Professional' },
                  { id: 'examples', label: '💡 Examples' },
                  { id: 'clarity', label: '🔍 Clearer' },
                ].map((style) => {
                  const isSelected = improvementType === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setImprovementType(style.id as any)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-white dark:text-zinc-950 font-semibold shadow-xs'
                          : 'bg-[#F7F3FA] hover:bg-[#F0EAF5] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-[#E8E4EF] dark:border-white/[0.06] text-[#6E6072] dark:text-zinc-300 hover:text-[#261827] dark:hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {improveError && <p className="text-xs text-rose-500 dark:text-rose-400 px-0.5">{improveError}</p>}

            <button
              onClick={handleImprovePrompt}
              disabled={improveLoading || !improveInput.trim()}
              className="w-full h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-xs"
            >
              {improveLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Enhancing Prompt...</span>
                </>
              ) : (
                <>
                  <Wand2 size={13} />
                  <span>Improve Prompt</span>
                </>
              )}
            </button>

            {improvedResult && (
              <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-[#150A20] border border-amber-200 dark:border-amber-400/30 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Wand2 size={12} />
                    <span>Improved Prompt</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20">
                    {improvedResult.category}
                  </span>
                </div>

                <input
                  type="text"
                  value={improvedResult.name}
                  onChange={(e) => setImprovedResult({ ...improvedResult, name: e.target.value })}
                  className="w-full bg-transparent text-xs font-bold text-[#261827] dark:text-white border-b border-transparent hover:border-amber-200 focus:border-amber-500 outline-none pb-0.5"
                />

                {improvedResult.changesSummary && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    ✨ <strong>What was improved:</strong> {improvedResult.changesSummary}
                  </div>
                )}

                <div className="border-t border-amber-100 dark:border-white/10" />

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6E6072] dark:text-zinc-400 font-medium">Prompt Content</span>
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
                    rows={6}
                    value={improvedResult.prompt}
                    onChange={(e) => setImprovedResult({ ...improvedResult, prompt: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F7F3FA] dark:bg-black/30 border border-amber-200 dark:border-white/10 text-xs text-[#261827] dark:text-zinc-100 outline-none focus:border-amber-500 font-sans leading-relaxed resize-none"
                  />
                ) : (
                  <div className="max-h-56 overflow-y-auto custom-scrollbar p-2.5 rounded-xl bg-amber-50/40 dark:bg-black/20 border border-amber-100 dark:border-white/[0.06] text-xs">
                    {renderCleanStructuredPrompt(improvedResult.prompt)}
                  </div>
                )}

                <div className="border-t border-[#E8E4EF] dark:border-white/10" />

                <div className="flex items-center justify-between pt-0.5 gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyPrompt('improved-gen', improvedResult.prompt)}
                    className="h-8 px-2.5 rounded-xl text-xs font-medium text-[#6E6072] hover:text-[#261827] dark:text-zinc-300 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-white/5 border border-transparent hover:border-amber-200 dark:hover:border-white/10 transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'improved-gen' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedId === 'improved-gen' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={handleSaveImprovedPrompt}
                      className="h-8 px-3 rounded-xl text-xs font-semibold text-[#8A0E57] hover:text-[#261827] dark:text-pink-200 bg-[#F4DCE9] hover:bg-[#F0EAF5] dark:bg-pink-500/15 dark:hover:bg-pink-500/25 border border-[#E8E4EF] dark:border-pink-400/30 transition cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleUsePrompt(improvedResult.prompt)}
                      className="h-8 px-3.5 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                    >
                      <span>Use in Chat</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {subView === 'manual-create' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g. React 19 & TypeScript Code Reviewer"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372] transition"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#F7F3FA] dark:bg-[#150A20] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white outline-none focus:border-[#B31372] transition cursor-pointer"
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
                <label className="text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300">
                  Prompt Instructions *
                </label>
                <span className="text-[10px] text-[#B31372] dark:text-pink-400 font-mono">
                  Supports {'{{variables}}'}
                </span>
              </div>
              <textarea
                rows={6}
                placeholder="Enter prompt instructions... Tip: you can use {{role}} or {{topic}} as dynamic placeholders."
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2.5 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372] transition resize-none leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1.5">
              <button
                onClick={() => setSubView('list')}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualPrompt}
                className="h-9 px-4 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
              >
                {editingId ? 'Update Prompt' : 'Save to Library'}
              </button>
            </div>
          </div>
        )}
      </div>

      {variableModalPrompt && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-[24px] sm:rounded-2xl bg-white dark:bg-[#150A20] border-t sm:border border-[#E8E4EF] dark:border-white/15 p-5 shadow-2xl space-y-3.5 text-[#261827] dark:text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-white/10 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F4DCE9] dark:bg-pink-500/20 text-[#8A0E57] dark:text-pink-300 flex items-center justify-center">
                  <Variable size={14} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#261827] dark:text-white">Fill Prompt Variables</h4>
                  <p className="text-[10.5px] text-[#6E6072] dark:text-zinc-400">Customize template placeholders</p>
                </div>
              </div>
              <button
                onClick={() => setVariableModalPrompt(null)}
                className="p-1 rounded-lg text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-0.5 flex-1">
              {variableKeys.map((key) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-[#6E6072] dark:text-zinc-300 capitalize mb-1">
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
                    className="w-full h-9 px-3 rounded-xl bg-[#F7F3FA] dark:bg-white/[0.04] border border-[#E8E4EF] dark:border-white/10 text-xs text-[#261827] dark:text-white placeholder:text-[#9E93A2] dark:placeholder:text-zinc-500 outline-none focus:border-[#B31372]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#E8E4EF] dark:border-white/10 shrink-0">
              <button
                onClick={() => setVariableModalPrompt(null)}
                className="h-8.5 px-3.5 rounded-xl text-xs font-semibold text-[#6E6072] hover:text-[#261827] dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVariables}
                className="h-8.5 px-4 rounded-xl bg-[#B31372] hover:bg-[#9E1064] dark:bg-pink-600 dark:hover:bg-pink-500 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
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
