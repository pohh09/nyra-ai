'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Brain,
  CheckSquare,
  Sparkles,
  Search,
  Briefcase,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  FolderOpen,
  Zap,
  TrendingUp,
  Settings,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { getTasks, toggleTaskStatus, createTask, syncTasksWithCloud, setTaskActiveUser } from '@/lib/services/taskService';
import { getMemories, createMemory, syncMemoriesWithCloud, setMemoryActiveUser } from '@/lib/services/memoryService';
import { TaskItem, MemoryItem, Chat } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickMemoryText, setQuickMemoryText] = useState('');
  const [showQuickAddMemory, setShowQuickAddMemory] = useState(false);

  useEffect(() => {
    // Load workspace data
    setTasks(getTasks());
    setMemories(getMemories());

    if (user?.id) {
      setTaskActiveUser(user.id);
      setMemoryActiveUser(user.id);
      syncTasksWithCloud(user.id).then((cloud) => {
        if (cloud) setTasks(cloud);
      });
      syncMemoriesWithCloud(user.id).then((cloud) => {
        if (cloud) setMemories(cloud);
      });
    } else {
      setTaskActiveUser(null);
      setMemoryActiveUser(null);
    }

    try {
      const storedChats = localStorage.getItem('nyra_chats');
      if (storedChats) {
        const parsed = JSON.parse(storedChats);
        if (Array.isArray(parsed)) {
          setRecentChats(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      console.error('Failed to load recent chats', e);
    }

    // Listen for custom workspace updates
    const handleTasksUpdate = (e: any) => setTasks(e.detail || getTasks());
    const handleMemoriesUpdate = (e: any) => setMemories(e.detail || getMemories());

    window.addEventListener('nyra_tasks_updated', handleTasksUpdate);
    window.addEventListener('nyra_memories_updated', handleMemoriesUpdate);

    return () => {
      window.removeEventListener('nyra_tasks_updated', handleTasksUpdate);
      window.removeEventListener('nyra_memories_updated', handleMemoriesUpdate);
    };
  }, [user?.id]);

  const handleToggleTask = (id: string) => {
    const updated = toggleTaskStatus(id);
    if (updated) {
      setTasks(getTasks());
      addToast({
        type: 'success',
        title: updated.status === 'completed' ? 'Task marked complete' : 'Task restored to To-Do',
      });
    }
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    createTask({ title: quickTaskTitle.trim(), priority: 'medium' });
    setQuickTaskTitle('');
    setTasks(getTasks());
    addToast({ type: 'success', title: 'Task added to workspace' });
  };

  const handleAddQuickMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMemoryText.trim()) return;

    createMemory({ content: quickMemoryText.trim(), category: 'preference' });
    setQuickMemoryText('');
    setShowQuickAddMemory(false);
    setMemories(getMemories());
    addToast({ type: 'success', title: 'Memory stored in Nyra AI brain' });
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen bg-[#FAF8FB] dark:bg-[#050505] text-[#261827] dark:text-white flex flex-col selection:bg-[#F4DCE9] selection:text-[#B31372] dark:selection:text-pink-200 transition-colors duration-200">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,42,131,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(229,42,131,0.18),transparent_75%)]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-[#E7B8CF] dark:border-pink-500/15 bg-white/80 dark:bg-[#16091F]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E52A83] to-[#B31372] flex items-center justify-center text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-base tracking-tight text-[#261827] dark:text-white group-hover:text-[#B31372] dark:group-hover:text-pink-200 transition-colors">
              NYRA <span className="text-xs font-mono text-[#B31372] dark:text-pink-400 font-semibold px-2 py-0.5 rounded-full bg-[#F4DCE9] dark:bg-pink-500/15 border border-[#E7B8CF] dark:border-pink-500/25 ml-1">Workspace</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/chat-ui"
            className="px-3.5 py-1.5 rounded-full bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-[#8B6FC9]/25 cursor-pointer active:scale-95"
          >
            <MessageSquare size={13} />
            <span>Open AI Chat</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[linear-gradient(180deg,#1c1335_0%,#130c26_35%,#0a0715_100%)] border border-[#E8E4EF] dark:border-purple-400/25 shadow-[0_4px_24px_rgba(41,38,51,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/30 text-[#8B6FC9] dark:text-purple-300 text-xs font-semibold mb-1">
              <Zap size={12} className="text-[#8B6FC9] dark:text-purple-400 animate-pulse" />
              <span>Full-Stack AI Productivity Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292633] dark:text-white tracking-tight">
              Welcome back to your AI Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#686477] dark:text-slate-300 max-w-2xl leading-relaxed">
              Chat with streaming multimodal intelligence, index and query documents with RAG, store persistent memories, and manage tasks through natural AI workflows.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <Link
              href="/chat-ui"
              className="px-5 py-2.5 rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-md shadow-[#8B6FC9]/25 cursor-pointer active:scale-95"
            >
              <MessageSquare size={15} />
              <span>Start New Chat</span>
            </Link>
          </div>
        </div>

        {/* Workspace Metrics Cards */}
        <div className="grid grid-cols-1 2xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Active Tasks', value: pendingTasks.length, icon: <CheckSquare size={16} />, color: 'from-[#8B6FC9] to-[#7E9AC7]', href: '/tasks' },
            { label: 'Stored Memories', value: memories.length, icon: <Brain size={16} />, color: 'from-[#8B6FC9] to-[#6B52A3]', href: '/memory' },
            { label: 'Total Conversations', value: recentChats.length, icon: <MessageSquare size={16} />, color: 'from-[#7E9AC7] to-[#8B6FC9]', href: '/chat-ui' },
            { label: 'Indexed Documents', value: '3 Ready', icon: <FileText size={16} />, color: 'from-[#6FA58A] to-[#7E9AC7]', href: '/documents' },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#130d28]/90 border border-[#E8E4EF] dark:border-purple-400/20 hover:border-[#8B6FC9] dark:hover:border-purple-400/45 shadow-[0_2px_12px_rgba(41,38,51,0.03)] transition-all group backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#686477] dark:text-slate-300 group-hover:text-[#292633] dark:group-hover:text-white transition-colors">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                  {card.icon}
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#292633] dark:text-white tracking-tight">
                {card.value}
              </div>
            </Link>
          ))}
        </div>

        {/* Studio Launchers Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8B6FC9] dark:text-purple-200 tracking-wider uppercase font-mono">
              AI Workspaces & Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                title: 'AI Chat Studio',
                desc: 'Conversational reasoning, code generation, vision, and split tools.',
                icon: <MessageSquare className="text-[#8B6FC9]" size={18} />,
                href: '/chat-ui',
                badge: 'Live Streaming',
              },
              {
                title: 'Document Intelligence & RAG',
                desc: 'PDF chunk extraction, vector search, semantic embeddings, and source citations.',
                icon: <FileText className="text-[#7E9AC7]" size={18} />,
                href: '/documents',
                badge: 'Vector Search',
              },
              {
                title: 'Personal AI Memory',
                desc: 'Persistent knowledge, preferences, and automated context injection.',
                icon: <Brain className="text-[#8B6FC9]" size={18} />,
                href: '/memory',
                badge: 'Auto-Recall',
              },
              {
                title: 'Task Management & Tools',
                desc: 'Kanban tasks, AI tool calling, automated due dates, and natural language creation.',
                icon: <CheckSquare className="text-[#6FA58A]" size={18} />,
                href: '/tasks',
                badge: 'Tool Calling',
              },
              {
                title: 'Research Workspace',
                desc: 'Multi-stage deep research, web query synthesis, structured briefs, and saved sessions.',
                icon: <Search className="text-[#C49A5A]" size={18} />,
                href: '/research',
                badge: 'Synthesis',
              },
              {
                title: 'AI Career & Resume Suite',
                desc: 'Resume parsing, ATS scoring, Job Description gap analysis, and tailored cover letters.',
                icon: <Briefcase className="text-[#C77B7B]" size={18} />,
                href: '/career',
                badge: 'Career AI',
              },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="p-5 rounded-2xl bg-white dark:bg-[linear-gradient(180deg,#170f2e_0%,#100a22_100%)] border border-[#E8E4EF] dark:border-purple-400/20 hover:border-[#8B6FC9] dark:hover:border-purple-400/45 shadow-[0_2px_12px_rgba(41,38,51,0.03)] transition-all group flex flex-col justify-between gap-4 backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/25 flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#F5F3F9] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/25 text-[#686477] dark:text-purple-300 font-mono">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#292633] dark:text-white group-hover:text-[#8B6FC9] dark:group-hover:text-purple-200 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-[#686477] dark:text-slate-300 mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#8B6FC9] dark:text-purple-300 group-hover:text-[#795BB8] dark:group-hover:text-white transition-colors pt-2 border-t border-[#E8E4EF] dark:border-white/[0.06]">
                  <span>Open Workspace</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Split: Recent Tasks & Active Memories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TASK MANAGER WIDGET */}
          <div className="p-5 sm:p-6 rounded-[22px] bg-white dark:bg-[#120c26]/90 border border-[#E8E4EF] dark:border-purple-400/20 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-[#6FA58A]" />
                <h3 className="text-sm font-bold text-[#292633] dark:text-white">Active Tasks</h3>
                <span className="text-xs text-[#8B6FC9] dark:text-purple-300 font-mono">({pendingTasks.length})</span>
              </div>
              <Link href="/tasks" className="text-xs text-[#8B6FC9] dark:text-purple-300 hover:text-[#795BB8] dark:hover:text-white font-semibold">
                View All →
              </Link>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddQuickTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new task (or ask Nyra in chat)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F7FB] dark:bg-black/40 border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-400 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 transition"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#EEE8FA] hover:bg-[#E4DCF5] dark:bg-purple-500/25 dark:hover:bg-purple-500/40 border border-[#E8E4EF] dark:border-purple-400/35 text-[#8B6FC9] dark:text-purple-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </form>

            {/* Task List Preview */}
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-[#92909B] dark:text-slate-400 text-center py-4">No tasks found. Create one above!</p>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      task.status === 'completed'
                        ? 'bg-[#F5F3F9] dark:bg-white/[0.02] border-[#E8E4EF] dark:border-white/[0.06] text-[#92909B] dark:text-slate-400'
                        : 'bg-[#F8F7FB] dark:bg-[#181030]/80 border-[#E8E4EF] dark:border-purple-400/15 text-[#292633] dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-[#8B6FC9] hover:text-[#795BB8] dark:text-purple-400 dark:hover:text-purple-300 transition cursor-pointer shrink-0"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={16} className="text-[#6FA58A]" />
                        ) : (
                          <Circle size={16} className="text-[#92909B]" />
                        )}
                      </button>
                      <span className={`text-xs truncate ${task.status === 'completed' ? 'line-through text-[#92909B] dark:text-slate-400' : 'font-medium'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.priority && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono ${
                            task.priority === 'high'
                              ? 'bg-[#F9ECEC] text-[#A85A5A] border border-[#ECCECE]'
                              : task.priority === 'medium'
                              ? 'bg-[#F9F4EB] text-[#9C773E] border border-[#EFE2CC]'
                              : 'bg-[#F5F3F9] text-[#686477] border border-[#E8E4EF]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI MEMORIES WIDGET */}
          <div className="p-5 sm:p-6 rounded-[22px] bg-white dark:bg-[#120c26]/90 border border-[#E8E4EF] dark:border-purple-400/20 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-[#8B6FC9]" />
                <h3 className="text-sm font-bold text-[#292633] dark:text-white">Stored AI Memories</h3>
                <span className="text-xs text-[#8B6FC9] dark:text-purple-300 font-mono">({memories.length})</span>
              </div>
              <Link href="/memory" className="text-xs text-[#8B6FC9] dark:text-purple-300 hover:text-[#795BB8] dark:hover:text-white font-semibold">
                Manage All →
              </Link>
            </div>

            {/* Quick Add Form Toggle */}
            {showQuickAddMemory ? (
              <form onSubmit={handleAddQuickMemory} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="e.g. Always respond in TypeScript with clean interfaces..."
                  value={quickMemoryText}
                  onChange={(e) => setQuickMemoryText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F7FB] dark:bg-black/40 border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-400 outline-none focus:border-[#8B6FC9] dark:focus:border-purple-400 transition resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddMemory(false)}
                    className="px-3 py-1 text-xs text-[#686477] dark:text-slate-300 hover:text-[#292633] dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold"
                  >
                    Save Memory
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowQuickAddMemory(true)}
                className="w-full py-2 rounded-xl border border-dashed border-[#E8E4EF] hover:border-[#8B6FC9] dark:border-purple-400/30 dark:hover:border-purple-400/60 bg-[#F8F7FB] hover:bg-[#EEE8FA] dark:bg-purple-500/5 dark:hover:bg-purple-500/15 text-xs text-[#686477] hover:text-[#292633] dark:text-purple-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>Teach Nyra a new preference</span>
              </button>
            )}

            {/* Memory Snippets Preview */}
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {memories.length === 0 ? (
                <p className="text-xs text-[#92909B] dark:text-slate-400 text-center py-4">No memories stored yet.</p>
              ) : (
                memories.slice(0, 4).map((mem) => (
                  <div
                    key={mem.id}
                    className="p-2.5 rounded-xl bg-[#F8F7FB] dark:bg-[#181030]/80 border border-[#E8E4EF] dark:border-purple-400/15 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 font-mono uppercase">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-[#6FA58A] font-mono">Active</span>
                    </div>
                    <p className="text-[11.5px] text-[#292633] dark:text-zinc-300 leading-snug line-clamp-2">
                      {mem.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
