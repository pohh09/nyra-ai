'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PLAYFUL_STARTER_PROMPTS } from '@/lib/personality';

export default function EmptyState({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center mt-20 space-y-6 px-4 select-none">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B6FC9] to-[#795BB8] dark:from-purple-600 dark:to-indigo-600 flex items-center justify-center text-2xl text-white shadow-md shadow-[#8B6FC9]/25 cursor-default"
      >
        ✦
      </motion.div>

      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#292633] dark:text-white tracking-tight">
          What’s on your mind?
        </h1>
        <p className="text-sm text-[#686477] dark:text-zinc-400 mt-1">
          Ready when you are — let’s make something great.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
        {PLAYFUL_STARTER_PROMPTS.slice(0, 4).map((p) => (
          <motion.button
            key={p.title}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.prompt)}
            className="text-xs text-left p-3.5 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF] dark:bg-purple-950/20 hover:bg-[#F5F3F9] dark:hover:bg-purple-900/30 text-[#292633] dark:text-white shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="font-semibold text-[13px] flex items-center gap-1.5">
                <span>{p.icon}</span>
                <span>{p.title}</span>
              </span>
              <span className="text-[11px] text-[#8B6FC9] dark:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                ↗
              </span>
            </div>
            <p className="text-[11px] text-[#686477] dark:text-purple-300/60 line-clamp-1">
              {p.desc}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}