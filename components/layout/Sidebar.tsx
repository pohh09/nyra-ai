'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  onCloseMobile,
  onToggleCollapse,
  favoritesCount = 0,
}: Props) {
  const { user, profile, signOut } = useAuth();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [search, setSearch] = useState('');
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null);
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
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent text-[#292633] dark:text-[#ede7f3] select-none">
        {/* =========================================================
            TOP HEADER: Brand / Toggle + New Chat Action
        ========================================================= */}
        <div className="px-3 pt-3.5 pb-2">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            {/* Nyra Brand Logo & Name */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] transition text-left cursor-pointer group"
              title="Start a new chat"
            >
              <div className="relative h-7 w-7 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E8E4EF] dark:border-white/10">
                <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#292633] dark:text-white group-hover:text-[#8B6FC9] dark:group-hover:text-purple-200 transition-colors">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#686477] dark:text-zinc-400 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* New Chat Button (ChatGPT Style) */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F3F9] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-[#E8E4EF] dark:border-white/[0.08] text-xs font-medium text-[#292633] dark:text-white transition cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-[#8B6FC9] dark:text-purple-300 group-hover:rotate-90 transition-transform duration-200" />
              <span>{activeProject ? `New chat in ${activeProject.name}` : 'New chat'}</span>
            </div>
            <span className="text-[10px] text-[#92909B] dark:text-zinc-400 font-mono opacity-60 group-hover:opacity-100">⌘K</span>
          </button>

          {/* Active Workspace / Project Indicator */}
          {activeProject && (
            <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#EEE8FA] dark:bg-purple-500/10 border border-[#E8E4EF] dark:border-purple-400/20 text-xs text-[#6B52A3] dark:text-purple-200">
              <button
                onClick={() => onOpenProjectsModal?.()}
                className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer hover:text-[#292633] dark:hover:text-white"
              >
                <Layers size={13} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />
                <span className="truncate font-medium">{activeProject.name}</span>
              </button>
              <button
                onClick={() => onSelectProject?.(null)}
                className="text-[10px] text-[#6B52A3] dark:text-purple-400 hover:text-[#292633] dark:hover:text-white font-mono px-1.5 py-0.5 rounded hover:bg-[#E2D8F7] dark:hover:bg-purple-500/20 transition cursor-pointer shrink-0 ml-1"
                title="Switch to Default Workspace"
              >
                Exit
              </button>
            </div>
          )}

          {/* Search Input (Subtle) */}
          <div className="mt-2 relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92909B] dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F5F3F9] focus:bg-[#FFFFFF] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.08] border border-[#E8E4EF] dark:border-white/[0.06] text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-zinc-500 outline-none focus:border-[#8B6FC9]/50 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92909B] hover:text-[#292633] dark:hover:text-white"
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
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#686477] dark:text-zinc-300 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer group"
            >
              <CheckSquare size={13} className="text-[#8B6FC9] dark:text-purple-400/80 group-hover:text-[#795BB8] dark:group-hover:text-purple-300" />
              <span className="flex-1 text-left font-normal">Tasks</span>
            </Link>

            <Link
              href="/documents"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#686477] dark:text-zinc-300 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer group"
            >
              <FileText size={13} className="text-[#7E9AC7] dark:text-sky-400/80 group-hover:text-[#6888B8] dark:group-hover:text-sky-300" />
              <span className="flex-1 text-left font-normal">Documents</span>
            </Link>

            <Link
              href="/memory"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#686477] dark:text-zinc-300 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer group"
            >
              <Brain size={13} className="text-[#9F88D4] dark:text-violet-400/80 group-hover:text-[#8B6FC9] dark:group-hover:text-violet-300" />
              <span className="flex-1 text-left font-normal">AI Memory</span>
            </Link>

            <Link
              href="/career"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#686477] dark:text-zinc-300 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer group"
            >
              <Briefcase size={13} className="text-[#C77B7B] dark:text-rose-400/80 group-hover:text-[#B56767] dark:group-hover:text-rose-300" />
              <span className="flex-1 text-left font-normal">Career & Resume</span>
            </Link>

            <button
              onClick={() => {
                onOpenProjectsModal?.();
                onCloseMobile?.();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#686477] dark:text-zinc-300 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] hover:text-[#292633] dark:hover:text-white transition cursor-pointer group"
            >
              <Layers size={13} className="text-[#8B6FC9] dark:text-sky-400/80 group-hover:text-[#795BB8] dark:group-hover:text-sky-300" />
              <span className="flex-1 text-left font-normal">Workspaces & Projects</span>
              {projects.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EEE8FA] dark:bg-sky-500/15 text-[#6B52A3] dark:text-sky-300 font-mono">
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
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-[#EEE8FA] dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B6FC9] text-xs font-bold text-white shadow-xs">
                <span>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#292633] dark:text-white">
                  {profile?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
                </p>
                <p className="truncate text-[10px] text-[#686477] dark:text-zinc-400">
                  {user ? user.email : 'Free Plan'}
                </p>
              </div>
              <MoreHorizontal size={14} className="text-[#92909B] shrink-0" />
            </button>

            {/* User Popover Menu */}
            {userMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute bottom-12 left-0 z-50 w-full overflow-hidden rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF] dark:bg-[#130f24] p-1.5 shadow-2xl backdrop-blur-2xl animate-[fadeIn_0.1s_ease-out]"
              >
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenFavorites?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
                >
                  <Star size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span className="flex-1 text-left">Saved Messages</span>
                  {favoritesCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EEE8FA] dark:bg-purple-500/20 text-[#6B52A3] dark:text-purple-300 font-mono font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProjectsModal?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
                >
                  <Layers size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span className="flex-1 text-left">Workspaces & Projects</span>
                  {projects.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EEE8FA] dark:bg-purple-500/20 text-[#6B52A3] dark:text-purple-300 font-mono font-bold">
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
                >
                  <Sun size={13} className="text-[#C49A5A]" />
                  <span>Toggle Light / Dark Theme</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
                >
                  <Settings size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenExport?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
                >
                  <Download size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span>Export Data</span>
                </button>

                {user && (
                  <>
                    <div className="my-1 border-t border-[#E8E4EF] dark:border-white/[0.08]" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut?.();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#C77B7B] dark:text-rose-300 hover:bg-[#F9ECEC] dark:hover:bg-rose-500/20 hover:text-[#A85A5A] dark:hover:text-rose-200 transition cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Log out</span>
                    </button>
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
          className="fixed z-50 w-[180px] overflow-hidden rounded-xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24] p-1 shadow-2xl backdrop-blur-2xl animate-[fadeIn_0.08s_ease-out]"
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
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
          >
            <Share2 size={12} className="text-[#8B6FC9] dark:text-purple-400" />
            <span>Share chat</span>
          </button>

          <button
            onClick={() => {
              setEditingChatId(menuChat.id);
              setEditingValue(menuChat.title);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
          >
            <Pencil size={12} className="text-[#8B6FC9] dark:text-purple-400" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => {
              onPin?.(menuChat.id);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#292633] dark:text-zinc-200 hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] hover:text-[#6B52A3] dark:hover:text-white transition cursor-pointer"
          >
            <Pin size={12} className="text-[#8B6FC9] dark:text-purple-400" />
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
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF] dark:bg-[#130f24] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#292633] dark:text-white">Delete chat?</h3>
            <p className="mt-2 text-xs text-[#686477] dark:text-zinc-300 leading-relaxed">
              This will delete <strong className="text-[#292633] dark:text-white">&ldquo;{deleteChat.title}&rdquo;</strong>. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteChat(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E4EF] dark:border-white/[0.1] bg-[#F5F3F9] dark:bg-white/[0.04] hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] text-xs font-medium text-[#292633] dark:text-zinc-300 transition cursor-pointer"
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
          rounded-lg
          px-2.5
          py-2
          text-xs
          transition-all
          duration-150
          cursor-pointer
          ${isActive
            ? 'bg-purple-100/80 dark:bg-white/[0.09] text-purple-950 dark:text-white font-medium shadow-sm'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-purple-50/70 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white'
          }
          ${isMenuOpen ? 'bg-purple-100 dark:bg-white/[0.08] text-purple-950 dark:text-white' : ''}
        `}
        onClick={() => {
          if (!isEditing) handleSelectChat(chat.id);
        }}
      >
        <div className="mr-2 shrink-0">
          {chat.pinned ? (
            <Pin size={12} className="text-purple-600 dark:text-purple-400 fill-purple-600/40 dark:fill-purple-400/40" />
          ) : (
            <MessageSquare size={13} className={isActive ? 'text-purple-600 dark:text-purple-300' : 'text-zinc-400 dark:text-zinc-500'} />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-6">
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
              className="w-full bg-transparent outline-none text-xs text-zinc-900 dark:text-white border-b border-purple-500 dark:border-purple-400 pb-0.5"
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
              h-6
              w-6
              items-center
              justify-center
              rounded-md
              text-zinc-400
              opacity-0
              transition-opacity
              hover:bg-purple-200/50 dark:hover:bg-white/[0.1]
              hover:text-zinc-800 dark:hover:text-white
              group-hover:opacity-100
              cursor-pointer
              ${isMenuOpen ? 'opacity-100 bg-purple-200/50 dark:bg-white/[0.1] text-zinc-900 dark:text-white' : ''}
            `}
          >
            <MoreHorizontal size={13} />
          </button>
        )}
      </div>
    );
  }
}