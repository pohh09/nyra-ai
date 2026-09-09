'use client';

import React from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface InChatSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClose: () => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

export default function InChatSearch({
  searchQuery,
  onSearchChange,
  onClose,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
}: InChatSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      className="absolute top-2 sm:top-3 right-2 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl border border-purple-400/25 bg-[#130f24]/98 backdrop-blur-2xl shadow-2xl text-xs text-white max-w-[calc(100vw-24px)]"
    >
      <Search size={14} className="text-purple-400 ml-1 shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Find in conversation..."
        autoFocus
        className="bg-transparent outline-none text-xs text-white placeholder:text-purple-200/50 w-32 sm:w-44 md:w-56"
      />

      {searchQuery && (
        <span className="text-[10px] font-mono text-sky-300/80 px-1 border-r border-white/10 shrink-0">
          {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : '0 results'}
        </span>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onPrevMatch}
          disabled={matchCount === 0}
          className="p-1 rounded-lg hover:bg-sky-500/15 text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
          title="Previous match"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={onNextMatch}
          disabled={matchCount === 0}
          className="p-1 rounded-lg hover:bg-sky-500/15 text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
          title="Next match"
        >
          <ChevronDown size={13} />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-sky-500/15 text-slate-400 hover:text-white transition ml-1 cursor-pointer"
          title="Close search"
        >
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}
