'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, ArrowRight, Trash2, Search, Sparkles } from 'lucide-react';
import { Chat, Msg } from '@/lib/types';
import { getRelativeTime } from '@/lib/formatTimestamp';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onNavigateToMessage: (chatId: string, messageId: string) => void;
}

export default function FavoritesModal({
  isOpen,
  onClose,
  chats,
  bookmarkedIds,
  onToggleBookmark,
  onNavigateToMessage,
}: FavoritesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Aggregate all bookmarked messages across all chats
  const bookmarkedItems: Array<{
    chatId: string;
    chatTitle: string;
    message: Msg;
  }> = [];

  chats.forEach((chat) => {
    chat.messages.forEach((msg) => {
      if (bookmarkedIds.includes(msg.id)) {
        bookmarkedItems.push({
          chatId: chat.id,
          chatTitle: chat.title || 'Untitled Conversation',
          message: msg,
        });
      }
    });
  });

  // Filter by search query
  const filteredItems = searchQuery.trim()
    ? bookmarkedItems.filter(
        (item) =>
          item.message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.chatTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarkedItems;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl max-h-[88dvh] flex flex-col rounded-[22px] sm:rounded-[28px] border border-[#E8E4EF] dark:border-purple-500/20 bg-white dark:bg-[#0E0B1A] text-[#292633] dark:text-white shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E8E4EF] dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#0E0B1A]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 sm:h-10 w-9 sm:w-10 rounded-xl sm:rounded-2xl bg-[#EEE8FA] dark:bg-[#8B6FC9]/15 border border-[#E8E4EF] dark:border-[#8B6FC9]/30 flex items-center justify-center text-[#8B6FC9] dark:text-[#C4B5FD] shadow-xs shrink-0">
                <Star size={18} className="fill-[#8B6FC9]/30 dark:fill-[#C4B5FD]/30 text-[#8B6FC9] dark:text-[#C4B5FD]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-[#292633] dark:text-white flex items-center gap-2 truncate">
                  <span>Saved Messages</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#EEE8FA] dark:bg-[#8B6FC9]/20 text-[#8B6FC9] dark:text-[#C4B5FD] font-mono font-semibold border border-[#E8E4EF] dark:border-[#8B6FC9]/30 shrink-0">
                    {bookmarkedItems.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[#686477] dark:text-zinc-400 mt-0.5 truncate">
                  Bookmarked responses from across your conversations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-[#E8E4EF] dark:border-white/10 bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-[#686477] hover:text-[#292633] dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>

          {/* Search Bar if multiple items */}
          {bookmarkedItems.length > 2 && (
            <div className="px-5 sm:px-6 pt-3.5 sm:pt-4 bg-white dark:bg-[#0E0B1A]">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-[#92909B] dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search saved messages or chat titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#E8E4EF] dark:border-white/[0.08] bg-[#F5F3F9] dark:bg-white/[0.04] text-xs sm:text-sm text-[#292633] dark:text-white placeholder:text-[#92909B] dark:placeholder:text-zinc-500 outline-none focus:border-[#8B6FC9] dark:focus:border-[#8B6FC9] focus:bg-white dark:focus:bg-white/[0.06] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-1 rounded-full text-[#92909B] hover:text-[#292633] dark:text-zinc-500 dark:hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List of Favorites */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-3.5 scrollbar-thin bg-white dark:bg-[#0E0B1A]">
            {filteredItems.length === 0 ? (
              <div className="py-12 sm:py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#EEE8FA] dark:bg-[#8B6FC9]/15 border border-[#E8E4EF] dark:border-[#8B6FC9]/30 mx-auto flex items-center justify-center text-[#8B6FC9] dark:text-[#C4B5FD] mb-3">
                  <Star size={22} className="text-[#8B6FC9] dark:text-[#C4B5FD] fill-[#8B6FC9]/25 dark:fill-[#C4B5FD]/25" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#292633] dark:text-white">
                  {searchQuery ? 'No matching saved messages' : 'No saved messages yet'}
                </h3>
                <p className="text-xs text-[#686477] dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? `No messages found matching "${searchQuery}". Try a different search term.`
                    : 'Click the star or bookmark button on any message in chat to save it here for quick reference.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.message.id}
                  className="group relative rounded-2xl border border-[#E8E4EF] dark:border-white/[0.08] bg-[#F9F8FD] dark:bg-white/[0.03] hover:bg-[#F3EEFA]/70 dark:hover:bg-white/[0.06] hover:border-[#8B6FC9]/40 dark:hover:border-purple-500/30 p-3.5 sm:p-4.5 transition-all duration-200 shadow-xs"
                >
                  {/* Origin Thread Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MessageSquare size={13} className="text-[#8B6FC9] dark:text-[#C4B5FD] shrink-0" />
                      <span className="text-xs sm:text-[13px] font-semibold text-[#292633] dark:text-zinc-200 truncate">
                        {item.chatTitle}
                      </span>
                      {item.message.timestamp && (
                        <span className="text-[10px] sm:text-[11px] text-[#92909B] dark:text-zinc-500 shrink-0 ml-1">
                          • {getRelativeTime(item.message.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onToggleBookmark(item.message.id)}
                        className="h-7 w-7 rounded-lg border border-[#E8E4EF] dark:border-white/10 bg-white hover:bg-rose-50 dark:bg-white/[0.05] dark:hover:bg-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/30 text-[#686477] hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-300 flex items-center justify-center transition cursor-pointer active:scale-95"
                        title="Remove from saved"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        onClick={() => onNavigateToMessage(item.chatId, item.message.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E8E4EF] dark:border-[#8B6FC9]/30 bg-[#EEE8FA] hover:bg-[#8B6FC9] hover:text-white dark:bg-[#8B6FC9]/20 dark:hover:bg-[#8B6FC9] text-[#8B6FC9] dark:text-[#E9D5FF] dark:hover:text-white text-xs font-semibold transition cursor-pointer active:scale-95"
                      >
                        <span>Jump to chat</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Message Content Snippet */}
                  <p
                    onClick={() => onNavigateToMessage(item.chatId, item.message.id)}
                    className="text-xs sm:text-[13px] text-[#292633] dark:text-zinc-200 leading-relaxed line-clamp-4 cursor-pointer hover:text-[#8B6FC9] dark:hover:text-white transition font-sans bg-white dark:bg-[#07050E] p-3 rounded-xl border border-[#E8E4EF] dark:border-white/[0.06]"
                  >
                    {item.message.content || 'Attached file or image prompt'}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        item.message.role === 'user'
                          ? 'bg-[#EEE8FA] dark:bg-[#8B6FC9]/20 text-[#8B6FC9] dark:text-[#C4B5FD] border border-[#E8E4EF] dark:border-[#8B6FC9]/30'
                          : 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25'
                      }`}
                    >
                      {item.message.role === 'user' ? 'User Prompt' : 'AI Response'}
                    </span>
                    {item.message.modelId && (
                      <span className="text-[10px] text-[#92909B] dark:text-zinc-500 font-mono">
                        {item.message.modelId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-[#E8E4EF] dark:border-white/[0.08] bg-[#F8F7FB] dark:bg-[#0A0714] flex items-center justify-between text-xs text-[#686477] dark:text-zinc-400">
            <span className="text-[11px] sm:text-xs">Saved messages are preserved in your local session.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-[#E8E4EF] dark:border-white/10 bg-white hover:bg-[#EEE8FA] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#292633] dark:text-white font-medium text-xs sm:text-sm transition cursor-pointer active:scale-95"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
