'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Edit3,
  ArrowLeft,
  X,
  Shield,
  Briefcase,
  Target,
  Sliders,
  FolderGit2,
  User,
  RotateCcw,
  Sparkles,
  Check,
  LucideIcon,
} from 'lucide-react';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  toggleMemory,
  isMemoryMasterEnabled,
  setMemoryMasterEnabled,
  resetDefaultMemories,
  syncMemoriesWithCloud,
  setMemoryActiveUser,
} from '@/lib/services/memoryService';
import { MemoryItem, MemoryCategory } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';

const MEMORY_CATEGORIES: { id: MemoryCategory; label: string; icon: LucideIcon }[] = [
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'goal', label: 'Goals', icon: Target },
  { id: 'preference', label: 'Preferences', icon: Sliders },
  { id: 'project', label: 'Projects', icon: FolderGit2 },
  { id: 'personal', label: 'Personal', icon: User },
];

const CATEGORY_COLORS: Record<MemoryCategory, { bg: string; text: string; border: string }> = {
  career: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-400/25',
  },
  goal: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-400/25',
  },
  preference: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-400/25',
  },
  project: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-400/25',
  },
  technical: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
    border: 'border-cyan-400/25',
  },
  personal: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
    border: 'border-rose-400/25',
  },
};

export default function MemoryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [masterEnabled, setMasterEnabled] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<MemoryCategory>('career');
  const [formReason, setFormReason] = useState('');

  // Delete confirmation
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);

  useEffect(() => {
    setMemories(getMemories());
    setMasterEnabled(isMemoryMasterEnabled());

    if (user?.id) {
      setMemoryActiveUser(user.id);
      syncMemoriesWithCloud(user.id).then((cloud) => {
        if (cloud) setMemories(cloud);
      });
    } else {
      setMemoryActiveUser(null);
    }

    const handleUpdate = (e: any) => setMemories(e.detail || getMemories());
    const handleMasterUpdate = (e: any) => setMasterEnabled(e.detail ?? isMemoryMasterEnabled());

    window.addEventListener('nyra_memories_updated', handleUpdate);
    window.addEventListener('nyra_memory_master_toggled', handleMasterUpdate);

    return () => {
      window.removeEventListener('nyra_memories_updated', handleUpdate);
      window.removeEventListener('nyra_memory_master_toggled', handleMasterUpdate);
    };
  }, [user?.id]);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        (m.title && m.title.toLowerCase().includes(q)) ||
        m.content.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.reason && m.reason.toLowerCase().includes(q))
      );
    });
  }, [memories, selectedCategory, searchQuery]);

  const activeCount = memories.filter((m) => m.enabled).length;

  const handleToggleMaster = () => {
    const next = !masterEnabled;
    setMasterEnabled(next);
    setMemoryMasterEnabled(next);
    addToast({
      type: next ? 'success' : 'info',
      title: next ? 'AI Memory is On' : 'AI Memory is Paused',
      description: next
        ? 'NYRA will use remembered context in future chats.'
        : 'NYRA will not use or update memories until turned back on.',
    });
  };

  const handleOpenCreate = (presetCategory?: MemoryCategory) => {
    setEditingMemory(null);
    setFormTitle(presetCategory ? presetCategory.charAt(0).toUpperCase() + presetCategory.slice(1) : 'Career');
    setFormContent('');
    setFormCategory(presetCategory || 'career');
    setFormReason('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setFormTitle(mem.title || mem.category.charAt(0).toUpperCase() + mem.category.slice(1));
    setFormContent(mem.content);
    setFormCategory(mem.category);
    setFormReason(mem.reason || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      addToast({ type: 'error', title: 'Please enter what NYRA should remember' });
      return;
    }

    const titleToSave = formTitle.trim() || formCategory.charAt(0).toUpperCase() + formCategory.slice(1);
    const reasonToSave = formReason.trim() || 'Added manually by you';

    if (editingMemory) {
      updateMemory(editingMemory.id, {
        title: titleToSave,
        content: formContent.trim(),
        category: formCategory,
        reason: reasonToSave,
      });
      addToast({ type: 'success', title: 'Memory updated' });
    } else {
      createMemory({
        title: titleToSave,
        content: formContent.trim(),
        category: formCategory,
        reason: reasonToSave,
      });
      addToast({ type: 'success', title: 'New memory saved' });
    }

    setMemories(getMemories());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMemory(id);
    setMemories(getMemories());
    setDeletingMemoryId(null);
    addToast({ type: 'info', title: 'Memory removed' });
  };

  const handleToggleSingle = (id: string) => {
    const updated = toggleMemory(id);
    if (updated) {
      setMemories(getMemories());
      addToast({
        type: 'info',
        title: updated.enabled ? 'Memory active' : 'Memory paused',
      });
    }
  };

  const handleRestoreExamples = () => {
    const fresh = resetDefaultMemories();
    setMemories(fresh);
    addToast({ type: 'success', title: 'Example memories restored' });
  };

  return (
    <div className="memory-page-root min-h-screen w-full bg-[#FAF8FB] dark:bg-[#050505] text-[#261827] dark:text-slate-100 flex flex-col p-3 sm:p-6 md:p-8 select-text transition-colors duration-200">
      {/* Centered Workspace Container Matching Tasks & Documents */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-5 pb-16">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/chat-ui"
            className="memory-nav-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-purple-400/20 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={13} className="text-purple-400" />
            <span>Back to Chat</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 ${
                masterEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 memory-badge-active'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 memory-badge-paused'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${masterEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
              <span>{masterEnabled ? `${activeCount} Active ${activeCount === 1 ? 'Memory' : 'Memories'}` : 'Memory Paused'}</span>
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 pt-1">
          <p className="text-[11px] uppercase tracking-wider text-purple-400 font-medium font-mono">
            Personalized Help
          </p>
          <h1 className="memory-header-title text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Brain size={26} className="text-purple-500" />
            <span>AI Memory</span>
          </h1>
          <p className="memory-header-desc text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed pt-0.5">
            NYRA remembers useful information you share to provide more personalized help in future conversations.
          </p>
        </div>

        {/* Master Control Card */}
        <div className="memory-card rounded-2xl sm:rounded-3xl bg-[#130c26]/90 border border-purple-400/25 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-purple-400" />
              <h2 className="memory-card-title text-sm font-bold text-white">Full User Control</h2>
            </div>
            <p className="memory-text-subtle text-xs text-zinc-300 leading-relaxed max-w-xl">
              {masterEnabled
                ? 'AI Memory is active. You can edit, pause, or delete any memory below anytime.'
                : 'AI Memory is currently paused. NYRA will not use or update your saved memories until you turn it back on.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="memory-card-title text-xs font-semibold text-zinc-300">
              {masterEnabled ? 'Active' : 'Paused'}
            </span>
            <button
              type="button"
              onClick={handleToggleMaster}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                masterEnabled ? 'bg-purple-600' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={masterEnabled}
              aria-label="Turn AI Memory on or off"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  masterEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Search, Filter & Add Toolbar */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400/60" />
              <input
                type="text"
                placeholder="Search what NYRA remembers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="memory-input w-full pl-9 pr-8 py-2 rounded-xl bg-[#140e28] border border-purple-400/20 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400/60 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Add Memory Button */}
            <button
              onClick={() => handleOpenCreate()}
              className="memory-btn-primary w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus size={14} />
              <span>Add Memory</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 border ${
                selectedCategory === 'all'
                  ? 'memory-tab-active bg-purple-500 border-purple-400 text-white shadow-sm'
                  : 'memory-tab-inactive bg-purple-950/40 border-purple-400/20 text-purple-200 hover:bg-purple-900/60'
              }`}
            >
              All
            </button>
            {MEMORY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'memory-tab-active bg-purple-500 border-purple-400 text-white shadow-sm'
                      : 'memory-tab-inactive bg-purple-950/40 border-purple-400/20 text-purple-200 hover:bg-purple-900/60'
                  }`}
                >
                  <Icon size={12} className={isSelected ? 'text-white' : 'text-purple-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Cards Grid */}
        <div className="space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="memory-card p-10 text-center rounded-3xl bg-[#120c26]/60 border border-purple-400/15 backdrop-blur-md space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="memory-card-title text-sm font-bold text-white mb-1">
                  {searchQuery ? 'No matching memories found' : 'No memories saved yet'}
                </h3>
                <p className="memory-text-subtle text-xs text-zinc-400 max-w-md mx-auto">
                  {searchQuery
                    ? 'Try searching with different keywords or clear the search filter.'
                    : 'NYRA learns what you share in conversation, or you can add custom memories here anytime.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenCreate()}
                  className="memory-btn-primary px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-md"
                >
                  + Add Memory
                </button>
                {memories.length === 0 && (
                  <button
                    onClick={handleRestoreExamples}
                    className="memory-btn-secondary px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    <span>Load Example Memories</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const catConfig = CATEGORY_COLORS[mem.category] || CATEGORY_COLORS.preference;
              const displayTitle = mem.title || mem.category.charAt(0).toUpperCase() + mem.category.slice(1);

              return (
                <div
                  key={mem.id}
                  className={`memory-card p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    mem.enabled
                      ? 'bg-[linear-gradient(180deg,#181030_0%,#110a24_100%)] border-purple-400/20 hover:border-purple-400/40 shadow-sm'
                      : 'bg-[#100b21]/60 border-purple-400/10 opacity-60'
                  }`}
                >
                  {/* Card Header: Topic & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="memory-card-title text-xs font-bold uppercase tracking-wider text-purple-300">
                          {displayTitle}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize border ${catConfig.bg} ${catConfig.text} ${catConfig.border} memory-badge-${mem.category}`}
                        >
                          {mem.category}
                        </span>
                      </div>

                      {/* Memory Content */}
                      <p className="memory-card-content text-sm sm:text-[15px] font-semibold text-white leading-snug pt-0.5">
                        {mem.content}
                      </p>
                    </div>

                    {/* Quick Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleSingle(mem.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          mem.enabled
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 memory-badge-active'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300 memory-badge-paused'
                        }`}
                        title={mem.enabled ? 'Click to pause this memory' : 'Click to enable this memory'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${mem.enabled ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                        <span>{mem.enabled ? 'Active' : 'Paused'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(mem)}
                        className="memory-action-btn p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                        title="Edit memory"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => setDeletingMemoryId(mem.id)}
                        className="memory-action-btn p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete memory"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: Why Saved Context */}
                  <div className="memory-border-subtle pt-2 border-t border-purple-400/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-zinc-400 memory-text-subtle">
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-400 font-medium">Why NYRA remembers this:</span>
                      <span className="memory-text-subtle italic">{mem.reason || 'Added manually by you'}</span>
                    </div>

                    <span className="text-[10px] text-zinc-500 memory-text-subtle font-mono">
                      {new Date(mem.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="memory-modal-card relative w-full max-w-lg rounded-3xl bg-[linear-gradient(180deg,#1c1335_0%,#120c26_100%)] border border-purple-400/30 p-6 shadow-2xl space-y-4"
            >
              <div className="memory-border-subtle flex items-center justify-between pb-3 border-b border-purple-400/15">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                    <Brain size={14} />
                  </div>
                  <h3 className="memory-modal-title text-base font-bold text-white">
                    {editingMemory ? 'Edit Memory' : 'Add Memory'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="memory-action-btn text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Topic / Header */}
                <div>
                  <label className="memory-modal-label block text-xs font-semibold text-purple-200 mb-1">
                    Topic / Header <span className="memory-text-subtle font-normal">(e.g. Career, Goal, Preferences)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Career, Goal, Coding Style"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="memory-textarea w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-400/25 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition"
                  />
                </div>

                {/* Memory Content */}
                <div>
                  <label className="memory-modal-label block text-xs font-semibold text-purple-200 mb-1">
                    What should NYRA remember? *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Full Stack Developer, or Learning AI development..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="memory-textarea w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-400/25 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition resize-none leading-relaxed"
                    autoFocus
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="memory-modal-label block text-xs font-semibold text-purple-200 mb-1">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MEMORY_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat.id);
                            if (!formTitle || MEMORY_CATEGORIES.some((c) => c.label === formTitle)) {
                              setFormTitle(cat.label);
                            }
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-purple-500/20 border-purple-400 text-white font-semibold memory-tab-active'
                              : 'memory-category-card-inactive bg-black/30 border-purple-400/15 text-zinc-400 hover:text-white hover:bg-black/50'
                          }`}
                        >
                          <Icon size={13} className={isSelected ? 'text-purple-300' : 'text-zinc-500'} />
                          <span className="text-[11px] truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Why Saved */}
                <div>
                  <label className="memory-modal-label block text-xs font-semibold text-purple-200 mb-1">
                    Why was this saved? <span className="memory-text-subtle font-normal">(Optional context)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Added to tailor future code answers to my background"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="memory-textarea w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-400/25 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="memory-border-subtle flex items-center justify-end gap-2 pt-3 border-t border-purple-400/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="memory-btn-secondary px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="memory-btn-primary px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-600/30 active:scale-95"
                  >
                    {editingMemory ? 'Save Changes' : 'Save Memory'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <AnimatePresence>
        {deletingMemoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMemoryId(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="memory-dialog-card relative w-full max-w-sm rounded-2xl bg-[#170f2f] border border-rose-500/30 p-5 shadow-2xl space-y-3"
            >
              <h3 className="memory-dialog-title text-sm font-bold text-white">Delete Memory?</h3>
              <p className="memory-dialog-desc text-xs text-zinc-300 leading-relaxed">
                NYRA will forget this information and will no longer use it in future conversations.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingMemoryId(null)}
                  className="memory-btn-secondary px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Keep Memory
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingMemoryId)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
