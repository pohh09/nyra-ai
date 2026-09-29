'use client';

import React from 'react';

export default function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 select-none" role="status" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="nyra-thinking-dot w-1.5 h-1.5 bg-gradient-to-r from-[#B31372] to-[#E52A83] dark:from-pink-500 dark:to-purple-300 rounded-full shadow-[0_0_6px_rgba(229,42,131,0.4)]"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}