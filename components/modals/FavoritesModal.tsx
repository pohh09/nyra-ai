'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, ArrowRight, Trash2, ExternalLink, Sparkles } from 'lucide-react';
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl max-h-[88dvh] flex flex-col rounded-[22px] sm:rounded-[28px] border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF] dark:bg-[#130f24]/98 text-[#292633] dark:text-white shadow-2xl backdrop-blur-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#E8E4EF] dark:border-purple-400/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/30 flex items-center justify-center text-[#8B6FC9] dark:text-purple-400 shadow-sm shrink-0">
                <Star size={18} className="fill-[#8B6FC9]/40 text-[#8B6FC9] dark:text-purple-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-[#292633] dark:text-white flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>Saved & Favorites</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 font-mono font-medium border border-[#E8E4EF] dark:border-purple-400/30 shrink-0">
                    {bookmarkedItems.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[#686477] dark:text-slate-400 mt-0.5 truncate">
                  Bookmarked messages from across your conversations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-[#686477] hover:text-[#292633] dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search Bar if multiple items */}
          {bookmarkedItems.length > 2 && (
            <div className="px-4 sm:px-6 pt-3 sm:pt-4">
              <input
                type="text"
                placeholder="Search favorite messages or chat titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/40 text-xs text-[#292633] dark:text-white placeholder:text-[#92909B] dark:placeholder:text-slate-400 outline-none focus:border-[#8B6FC9] transition"
              />
            </div>
          )}

          {/* List of Favorites */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5 scrollbar-thin">
            {filteredItems.length === 0 ? (
              <div className="py-14 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/10 border border-[#E8E4EF] dark:border-purple-400/20 mx-auto flex items-center justify-center text-[#8B6FC9] dark:text-purple-300 mb-3">
                  <Star size={20} className="text-[#8B6FC9] dark:text-purple-400/60" />
                </div>
                <h3 className="text-sm font-semibold text-[#292633] dark:text-white">No saved messages yet</h3>
                <p className="text-xs text-[#686477] dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the star icon <Star size={11} className="inline text-[#8B6FC9] dark:text-purple-400 fill-[#8B6FC9]/30" /> on any assistant or user response in a conversation to save it here for quick access.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.message.id}
                  className="group relative rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/30 hover:bg-[#EEE8FA]/60 dark:hover:bg-purple-900/40 hover:border-[#8B6FC9]/40 dark:hover:border-purple-400/40 p-4 transition-all duration-200 shadow-sm backdrop-blur-sm"
                >
                  {/* Origin Thread Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MessageSquare size={13} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />
                      <span className="text-xs font-semibold text-[#292633] dark:text-purple-200 truncate">
                        {item.chatTitle}
                      </span>
                      {item.message.timestamp && (
                        <span className="text-[10px] text-[#92909B] dark:text-slate-500 ml-1">
                          • {getRelativeTime(item.message.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onToggleBookmark(item.message.id)}
                        className="h-7 w-7 rounded-lg border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF] hover:bg-[#F9ECEC] dark:bg-purple-500/10 dark:hover:bg-rose-500/20 hover:border-[#C77B7B]/40 dark:hover:border-rose-400/40 text-[#686477] hover:text-[#A85A5A] dark:text-purple-400 dark:hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        onClick={() => onNavigateToMessage(item.chatId, item.message.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E8E4EF] dark:border-purple-400/30 bg-[#EEE8FA] hover:bg-[#8B6FC9] hover:text-white dark:bg-purple-500/20 dark:hover:bg-purple-500/30 text-[#8B6FC9] dark:text-purple-100 dark:hover:text-white text-xs font-semibold transition cursor-pointer"
                      >
                        <span>Jump to chat</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Message Content Snippet */}
                  <p
                    onClick={() => onNavigateToMessage(item.chatId, item.message.id)}
                    className="text-xs text-[#292633] dark:text-slate-200 leading-relaxed line-clamp-4 cursor-pointer hover:text-[#8B6FC9] dark:hover:text-white transition font-mono bg-[#FFFFFF] dark:bg-black/20 p-2.5 rounded-xl border border-[#E8E4EF] dark:border-purple-500/10"
                  >
                    {item.message.content || 'Attached file or image prompt'}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      item.message.role === 'user'
                        ? 'bg-[#EEE8FA] dark:bg-purple-500/15 text-[#8B6FC9] dark:text-purple-300 border border-[#E8E4EF] dark:border-purple-400/20'
                        : 'bg-[#F5F3F9] dark:bg-indigo-500/15 text-[#7E9AC7] dark:text-indigo-300 border border-[#E8E4EF] dark:border-indigo-400/20'
                    }`}>
                      {item.message.role === 'user' ? 'User Prompt' : 'AI Response'}
                    </span>
                    {item.message.modelId && (
                      <span className="text-[10px] text-[#92909B] dark:text-slate-400 font-mono">
                        {item.message.modelId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-black/30 flex items-center justify-between text-xs text-[#686477] dark:text-slate-400">
            <span>Favorites are preserved locally & synced to your account.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] hover:bg-[#EEE8FA] dark:bg-purple-500/15 dark:hover:bg-purple-500/25 text-[#292633] dark:text-purple-200 font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
