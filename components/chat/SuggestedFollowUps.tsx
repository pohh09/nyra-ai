'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SuggestedFollowUpsProps {
  suggestions?: string[];
  followUps?: string[];
  onSelect?: (prompt: string) => void;
}

export default function SuggestedFollowUps({ suggestions, followUps, onSelect }: SuggestedFollowUpsProps) {
  const items = suggestions || followUps || [];
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mt-3.5 flex flex-wrap items-center gap-2 pt-0.5"
    >
      {items.slice(0, 3).map((item, idx) => (
        <motion.button
          key={idx}
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect?.(item)}
          className="suggested-followup-pill group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF] dark:bg-[#160f2b] hover:bg-[#EEE8FA] dark:hover:bg-[#251947] hover:border-[#8B6FC9]/50 dark:hover:border-purple-400/60 text-[12px] text-[#292633] dark:text-purple-200 hover:text-[#8B6FC9] dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="text-[10px] text-[#8B6FC9] dark:text-purple-400 opacity-80 group-hover:opacity-100 transition-colors">✦</span>
          <span className="font-normal">{item}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
