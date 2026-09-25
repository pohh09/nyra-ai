'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Pin,
  Trash2,
  Settings,
  Download,
  MessageSquare,
  PanelLeftClose,
  X,
  Star,
  LogOut,
  Sparkles,
  Layers,
  Compass,
  Share2,
  CheckSquare,
  Brain,
  FileText,
  Briefcase,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { applyTheme, ThemeMode } from '@/lib/theme';
import { Chat, WorkspaceProject } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';

type Props = {
  chats?: Chat[];
  currentChatId?: string | null;
  projects?: WorkspaceProject[];
  activeProjectId?: string | null;
  onSelect?: (id: string) => void;
  onNewChat?: () => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onClearChat?: (id: string) => void;
  onClearHistory?: () => void;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  onSelectProject?: (projectId: string | null) => void;
  onOpenProjectsModal?: () => void;
  onOpenSettings?: () => void;
  onOpenPromptLibrary?: () => void;
  onOpenFavorites?: () => void;
  onOpenVoiceMode?: () => void;
  onOpenExport?: () => void;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
  favoritesCount?: number;
};

type MenuState = {
  chatId: string;
  x: number;
  y: number;
};

const SECTION_ORDER = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'] as const;
const MENU_WIDTH = 180;
const MENU_HEIGHT_ESTIMATE = 200;

export default function Sidebar({
  chats = [],
  currentChatId,
  projects = [],
  activeProjectId = null,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
  onPin,
  onSelectProject,
  onOpenProjectsModal,
  onOpenSettings,
  onOpenPromptLibrary,
  onOpenFavorites,
  onOpenExport,
  onClearHistory,
  onCloseMobile,
  onToggleCollapse,
  favoritesCount = 0,
}: Props) {
  const router = useRouter();
  const { user, profile, signOut, isGuest, guestMessageCount, guestLimit } = useAuth();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [search, setSearch] = useState('');
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close context menu on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (menu) setMenu(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menu, userMenuOpen]);

  // Focus rename input on open
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  const handleSelectChat = (id: string) => {
    onSelect?.(id);
    onCloseMobile?.();
  };

  const handleNewChat = () => {
    onNewChat?.();
    onCloseMobile?.();
  };

  const openMenuAt = (chatId: string, x: number, y: number) => {
    const clampedX = Math.min(Math.max(8, x), window.innerWidth - MENU_WIDTH - 8);
    const clampedY = Math.min(Math.max(8, y), window.innerHeight - MENU_HEIGHT_ESTIMATE - 8);
    setMenu({ chatId, x: clampedX, y: clampedY });
  };

  const handleTriggerClick = (chat: Chat, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (menu?.chatId === chat.id) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    openMenuAt(chat.id, rect.right - MENU_WIDTH, rect.bottom + 4);
  };

  const handleRowContextMenu = (chat: Chat, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openMenuAt(chat.id, e.clientX, e.clientY);
  };

  const saveRename = () => {
    if (!editingChatId) return;
    const value = editingValue.trim();
    if (value) {
      onRename?.(editingChatId, value);
    }
    setEditingChatId(null);
  };

  // Group chats by date
  const getSection = (timestamp: number) => {
    const now = new Date();
    const target = new Date(timestamp);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const diff = (startOfToday - target.getTime()) / (1000 * 60 * 60 * 24);

    if (timestamp >= startOfToday) return 'Today';
    if (timestamp >= startOfYesterday) return 'Yesterday';
    if (diff < 7) return 'Previous 7 Days';
    if (diff < 30) return 'Previous 30 Days';
    return 'Older';
  };

  // Filter chats by search query AND active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const filteredChats = chats.filter((chat) => {
    // Only display conversations that have at least one message
    if (!chat.messages || chat.messages.length === 0) return false;

    if (activeProjectId) {
      if (chat.projectId !== activeProjectId) return false;
    } else {
      if (chat.projectId) return false;
    }

    if (!search.trim()) return !chat.archived;
    const query = search.toLowerCase();
    const titleMatch = chat.title.toLowerCase().includes(query);
    const messageMatch = chat.messages.some((m) => m.content.toLowerCase().includes(query));
    return (titleMatch || messageMatch) && !chat.archived;
  });

  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const unpinnedChats = filteredChats.filter((c) => !c.pinned);

  const sortedUnpinnedChats = [...unpinnedChats].sort((a, b) => {
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
  });

  const groupedChats = sortedUnpinnedChats.reduce((acc, chat) => {
    const section = getSection(chat.updatedAt ?? Date.now());
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(chat);
    return acc;
  }, {} as Record<string, Chat[]>);

  const orderedSections = SECTION_ORDER.filter((section) => groupedChats[section]?.length);
  const menuChat = menu ? chats.find((chat) => chat.id === menu.chatId) ?? null : null;

  return (
    <>
      {/* SEAMLESS TRANSPARENT CHATGPT-STYLE SIDEBAR */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent text-[#261827] dark:text-[#ede7f3] select-none">
        {/* =========================================================
            TOP HEADER: Brand / Toggle + New Chat Action
        ========================================================= */}
        <div className="px-3 pt-3.5 pb-2">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            {/* Nyra Brand Logo & Name */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] transition text-left cursor-pointer group"
              title="Start a new chat"
            >
              <div className="relative h-7.5 w-7.5 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E8E4EF] dark:border-pink-500/20">
                <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#261827] dark:text-white group-hover:text-[#B31372] dark:group-hover:text-pink-300 transition-colors">
                Nyra AI
              </span>
            </button>

            {/* Top Right: Collapse Sidebar */}
            <button
              onClick={() => {
                onCloseMobile?.();
                onToggleCollapse?.();
              }}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-[#6E6072] dark:text-zinc-400 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer active:scale-95"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* New Chat Button (ChatGPT Style) */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F3FA] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.08] text-xs font-medium text-[#261827] dark:text-white transition cursor-pointer shadow-xs group active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Plus size={15} className="text-[#E52A83] dark:text-pink-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>{activeProject ? `New chat in ${activeProject.name}` : 'New chat'}</span>
            </div>
            <span className="text-[10px] text-[#9E93A2] dark:text-zinc-400 font-mono opacity-60 group-hover:opacity-100">⌘K</span>
          </button>

          {/* Active Workspace / Project Indicator */}
          {activeProject && (
            <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#F4DCE9] dark:bg-pink-500/10 border border-[#E8E4EF] dark:border-pink-400/20 text-xs text-[#B31372] dark:text-pink-200">
              <button
                onClick={() => onOpenProjectsModal?.()}
                className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer hover:text-[#261827] dark:hover:text-white"
              >
                <Layers size={13} className="text-[#E52A83] dark:text-pink-400 shrink-0" />
                <span className="truncate font-medium">{activeProject.name}</span>
              </button>
              <button
                onClick={() => onSelectProject?.(null)}
                className="text-[10px] text-[#B31372] dark:text-pink-400 hover:text-[#261827] dark:hover:text-white font-mono px-1.5 py-0.5 rounded hover:bg-[#E7B8CF] dark:hover:bg-pink-500/20 transition cursor-pointer shrink-0 ml-1"
                title="Switch to Default Workspace"
              >
                Exit
              </button>
            </div>
          )}

          {/* Search Input (Subtle) */}
          <div className="mt-2 relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E93A2] dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F3FA] focus:bg-[#FFFFFF] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.08] border border-[#E8E4EF] dark:border-white/[0.06] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372]/50 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E93A2] hover:text-[#261827] dark:hover:text-white"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Quick Nav: Tasks, Memory, Documents, Research & Career */}
          <div className="mt-2 space-y-0.5">
            <Link
              href="/tasks"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer group"
            >
              <CheckSquare size={13} className="text-[#E52A83] dark:text-pink-400/80 group-hover:text-[#B31372] dark:group-hover:text-pink-300" />
              <span className="flex-1 text-left font-normal">Tasks</span>
            </Link>

            <Link
              href="/documents"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer group"
            >
              <FileText size={13} className="text-[#38bdf8] dark:text-sky-400/80 group-hover:text-[#0284c7] dark:group-hover:text-sky-300" />
              <span className="flex-1 text-left font-normal">Documents</span>
            </Link>

            <Link
              href="/memory"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer group"
            >
              <Brain size={13} className="text-[#c084fc] dark:text-purple-400/80 group-hover:text-[#a855f7] dark:group-hover:text-purple-300" />
              <span className="flex-1 text-left font-normal">AI Memory</span>
            </Link>

            <Link
              href="/career"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer group"
            >
              <Briefcase size={13} className="text-[#f43f5e] dark:text-rose-400/80 group-hover:text-[#e11d48] dark:group-hover:text-rose-300" />
              <span className="flex-1 text-left font-normal">Career & Resume</span>
            </Link>

            <button
              onClick={() => {
                onOpenProjectsModal?.();
                onCloseMobile?.();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] hover:text-[#261827] dark:hover:text-white transition cursor-pointer group"
            >
              <Layers size={13} className="text-[#E52A83] dark:text-pink-400/80 group-hover:text-[#B31372] dark:group-hover:text-pink-300" />
              <span className="flex-1 text-left font-normal">Workspaces & Projects</span>
              {projects.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4DCE9] dark:bg-pink-500/15 text-[#B31372] dark:text-pink-300 font-mono">
                  {projects.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            CHAT CONVERSATIONS LIST
        ========================================================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-3 scrollbar-thin">
          {/* PINNED CHATS */}
          {pinnedChats.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[11px] font-medium text-[#92909B] dark:text-zinc-400">
                Pinned
              </p>
              <div className="space-y-0.5">
                {pinnedChats.map((chat) => renderChatRow(chat))}
              </div>
            </div>
          )}

          {/* TEMPORAL SECTIONS */}
          {orderedSections.map((section) => {
            const sectionChats = groupedChats[section];
            return (
              <div key={section}>
                <p className="px-2 pb-1 text-[11px] font-medium text-[#92909B] dark:text-zinc-400">
                  {section}
                </p>
                <div className="space-y-0.5">
                  {sectionChats.map((chat) => renderChatRow(chat))}
                </div>
              </div>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="px-2 py-8 text-center text-xs text-[#92909B] dark:text-zinc-500">
              {search ? 'No matching chats found' : 'No conversations yet'}
            </div>
          )}
        </div>

        {/* =========================================================
            BOTTOM USER FOOTER: Profile & Settings (ChatGPT Style)
        ========================================================= */}
        <div className="p-2 border-t border-[#E8E4EF] dark:border-white/[0.06]">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-[#F4DCE9] dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-xs font-bold text-white shadow-xs">
                <span>{user?.email ? user.email.charAt(0).toUpperCase() : 'G'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#261827] dark:text-white">
                  {user ? (profile?.displayName || user.email?.split('@')[0] || 'User') : 'Guest User'}
                </p>
                <p className="truncate text-[10px] text-[#6E6072] dark:text-zinc-400">
                  {user ? (user.email || 'Free Plan') : `✦ Guest (${guestMessageCount}/${guestLimit} msgs)`}
                </p>
              </div>
              <MoreHorizontal size={14} className="text-[#9E93A2] shrink-0" />
            </button>

            {/* User Popover Menu */}
            {userMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute bottom-12 left-0 z-50 w-full overflow-hidden rounded-2xl border border-[#E8E4EF] dark:border-pink-500/25 bg-[#FFFFFF] dark:bg-[#12051B] p-1.5 shadow-2xl backdrop-blur-2xl animate-[fadeIn_0.1s_ease-out]"
              >
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenFavorites?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
                >
                  <Star size={13} className="text-[#E52A83] dark:text-pink-400" />
                  <span className="flex-1 text-left">Saved Messages</span>
                  {favoritesCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 font-mono font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProjectsModal?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
                >
                  <Layers size={13} className="text-[#E52A83] dark:text-pink-400" />
                  <span className="flex-1 text-left">Workspaces & Projects</span>
                  {projects.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 font-mono font-bold">
                      {projects.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    const current = (localStorage.getItem('theme') as ThemeMode) || 'dark';
                    const next: ThemeMode = current === 'light' ? 'dark' : 'light';
                    applyTheme(next);
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
                >
                  <Sun size={13} className="text-[#C49A5A]" />
                  <span>Toggle Light / Dark Theme</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
                >
                  <Settings size={13} className="text-[#E52A83] dark:text-pink-400" />
                  <span>Settings</span>
                </button>

                {(profile?.role === 'admin' || user?.email?.toLowerCase() === 'pooja@gmail.com') && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#B31372] dark:text-pink-300 hover:bg-[#F4DCE9] dark:hover:bg-pink-500/20 font-semibold transition cursor-pointer"
                  >
                    <Shield size={13} className="text-[#E52A83] dark:text-pink-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenExport?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
                >
                  <Download size={13} className="text-[#E52A83] dark:text-pink-400" />
                  <span>Export Data</span>
                </button>

                {chats && chats.length > 0 && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setConfirmClearHistory(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#C77B7B] dark:text-rose-400 hover:bg-[#F9ECEC] dark:hover:bg-rose-500/20 hover:text-[#A85A5A] dark:hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 size={13} className="text-rose-500 dark:text-rose-400" />
                    <span>Clear All History</span>
                  </button>
                )}

                {user ? (
                  <>
                    <div className="my-1 border-t border-[#E8E4EF] dark:border-white/[0.08]" />
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut?.();
                        router.push('/login');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#C77B7B] dark:text-rose-300 hover:bg-[#F9ECEC] dark:hover:bg-rose-500/20 hover:text-[#A85A5A] dark:hover:text-rose-200 transition cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-1 border-t border-[#E8E4EF] dark:border-white/[0.08]" />
                    <Link
                      href="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#B31372] dark:text-pink-300 hover:bg-[#F4DCE9] dark:hover:bg-pink-500/20 font-semibold transition cursor-pointer"
                    >
                      <Sparkles size={13} className="text-[#E52A83]" />
                      <span>Sign In / Create Account</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHAT CONTEXT MENU (3-Dots on Row) */}
      {menu && menuChat && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-50 w-[180px] overflow-hidden rounded-xl border border-[#E8E4EF] dark:border-pink-500/25 bg-[#FFFFFF] dark:bg-[#12051B] p-1 shadow-2xl backdrop-blur-2xl animate-[fadeIn_0.08s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined') {
                const shareUrl = `${window.location.origin}/share/${menuChat.id}`;
                localStorage.setItem(`nyra_share_${menuChat.id}`, JSON.stringify(menuChat));
                navigator.clipboard.writeText(shareUrl);
              }
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
          >
            <Share2 size={12} className="text-[#E52A83] dark:text-pink-400" />
            <span>Share chat</span>
          </button>

          <button
            onClick={() => {
              setEditingChatId(menuChat.id);
              setEditingValue(menuChat.title);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
          >
            <Pencil size={12} className="text-[#E52A83] dark:text-pink-400" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => {
              onPin?.(menuChat.id);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#261827] dark:text-zinc-200 hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] hover:text-[#B31372] dark:hover:text-white transition cursor-pointer"
          >
            <Pin size={12} className="text-[#E52A83] dark:text-pink-400" />
            <span>{menuChat.pinned ? 'Unpin' : 'Pin'}</span>
          </button>

          <div className="my-1 border-t border-[#E8E4EF] dark:border-white/[0.08]" />

          <button
            onClick={() => {
              setDeleteChat(menuChat);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#C77B7B] dark:text-rose-400 hover:bg-[#F9ECEC] dark:hover:bg-rose-500/20 hover:text-[#A85A5A] dark:hover:text-rose-300 transition cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.1s_ease-out]">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E4EF] dark:border-pink-500/25 bg-[#FFFFFF] dark:bg-[#12051B] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#261827] dark:text-white">Delete chat?</h3>
            <p className="mt-2 text-xs text-[#6E6072] dark:text-zinc-300 leading-relaxed">
              This will delete <strong className="text-[#261827] dark:text-white">&ldquo;{deleteChat.title}&rdquo;</strong>. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteChat(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E4EF] dark:border-white/[0.1] bg-[#F7F3FA] dark:bg-white/[0.04] hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] text-xs font-medium text-[#261827] dark:text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteChat) onDelete?.(deleteChat.id);
                  setDeleteChat(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#C77B7B] hover:bg-[#B56767] text-xs font-semibold text-white transition cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL CHATS CONFIRMATION MODAL */}
      {confirmClearHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.1s_ease-out]">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/25 bg-[#FFFFFF] dark:bg-[#12051B] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Clear all chat history?</h3>
            <p className="mt-2 text-xs text-[#6E6072] dark:text-zinc-300 leading-relaxed">
              This will permanently delete all your saved conversations ({chats.length} chat{chats.length === 1 ? '' : 's'}). This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmClearHistory(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E4EF] dark:border-white/[0.1] bg-[#F7F3FA] dark:bg-white/[0.04] hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08] text-xs font-medium text-[#261827] dark:text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory?.();
                  setConfirmClearHistory(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition cursor-pointer shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Render clean chat row item
  function renderChatRow(chat: Chat) {
    const isActive = chat.id === currentChatId;
    const isEditing = editingChatId === chat.id;
    const isMenuOpen = menu?.chatId === chat.id;

    return (
      <div
        key={chat.id}
        onContextMenu={(e) => handleRowContextMenu(chat, e)}
        className={`
          group
          relative
          flex
          items-center
          rounded-xl
          px-2.5
          py-2.5
          sm:py-2
          min-h-[38px]
          sm:min-h-[34px]
          text-xs
          transition-all
          duration-150
          cursor-pointer
          ${isActive
            ? 'bg-[#F4DCE9] dark:bg-[#1A0927] border border-[#E7B8CF] dark:border-pink-500/25 text-[#261827] dark:text-white font-semibold shadow-xs'
            : 'text-[#6E6072] dark:text-zinc-300 hover:bg-[#F4DCE9]/60 dark:hover:bg-white/[0.05] hover:text-[#261827] dark:hover:text-white'
          }
          ${isMenuOpen ? 'bg-[#F4DCE9] dark:bg-[#1A0927] text-[#261827] dark:text-white' : ''}
        `}
        onClick={() => {
          if (!isEditing) handleSelectChat(chat.id);
        }}
      >
        <div className="mr-2 shrink-0">
          {chat.pinned ? (
            <Pin size={12} className="text-[#E52A83] dark:text-pink-400 fill-[#E52A83]/40 dark:fill-pink-400/40" />
          ) : (
            <MessageSquare size={13} className={isActive ? 'text-[#E52A83] dark:text-pink-400' : 'text-[#9E93A2] dark:text-zinc-500'} />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-7">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename();
                if (e.key === 'Escape') setEditingChatId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent outline-none text-xs text-[#261827] dark:text-white border-b border-[#B31372] dark:border-pink-400 pb-0.5"
            />
          ) : (
            <p
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingChatId(chat.id);
                setEditingValue(chat.title);
              }}
              className="truncate text-xs leading-normal"
            >
              {chat.title}
            </p>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={(e) => handleTriggerClick(chat, e)}
            aria-label="Chat actions"
            className={`
              absolute
              right-1.5
              flex
              h-7
              w-7
              sm:h-6
              sm:w-6
              items-center
              justify-center
              rounded-lg
              text-[#9E93A2]
              opacity-60
              sm:opacity-0
              transition-opacity
              hover:bg-[#E7B8CF] dark:hover:bg-white/[0.1]
              hover:text-[#261827] dark:hover:text-white
              group-hover:opacity-100
              cursor-pointer
              active:scale-95
              ${isMenuOpen ? '!opacity-100 bg-[#E7B8CF] dark:bg-white/[0.1] text-[#261827] dark:text-white' : ''}
            `}
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>
    );
  }
}