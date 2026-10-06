'use client';

import React from 'react';

interface ThinkingIndicatorProps {
  thinkingText?: string;
  variant?: 'bubble' | 'pill' | 'compact';
  className?: string;
}

export default function ThinkingIndicator({
  thinkingText = 'Thinking...',
  variant = 'bubble',
  className = '',
}: ThinkingIndicatorProps) {
  if (variant === 'pill') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2.5 select-none ${className}`}
      >
        <span className="sr-only">Nyra is processing your request...</span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="nyra-thinking-dot w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#B31372] to-[#E52A83] dark:from-pink-500 dark:to-purple-300"
              style={{
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-[#7A6E8C] dark:text-pink-200/90 tracking-tight">
          {thinkingText}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 select-none py-0.5 ${className}`}
      >
        <span className="sr-only">Generating response...</span>
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="nyra-thinking-dot w-1.5 h-1.5 rounded-full bg-[#E52A83] dark:bg-pink-400"
              style={{
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 py-1.5 px-0.5 select-none animate-[fadeIn_0.2s_ease-out] ${className}`}
    >
      <span className="sr-only">Nyra is generating a response...</span>

      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="nyra-thinking-dot w-2 h-2 rounded-full bg-gradient-to-r from-[#B31372] to-[#E52A83] dark:from-pink-500 dark:to-purple-300 shadow-[0_0_8px_rgba(229,42,131,0.4)] dark:shadow-[0_0_8px_rgba(244,114,182,0.4)]"
            style={{
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      <span className="text-[13px] sm:text-[13.5px] font-medium tracking-tight text-[#7A6E8C] dark:text-pink-200/75 animate-pulse duration-[2.5s]">
        {thinkingText}
      </span>
    </div>
  );
}
