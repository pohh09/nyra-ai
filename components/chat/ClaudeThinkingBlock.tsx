'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ClaudeThinkingBlockProps {
  thinking?: boolean;
  loading?: boolean;
  thoughtContent?: string;
  initialElapsedSeconds?: number;
  thinkingText?: string;
}

export default function ClaudeThinkingBlock({
  thinking = false,
  loading = false,
  thoughtContent,
  initialElapsedSeconds = 2,
  thinkingText,
}: ClaudeThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);

  const isActivelyThinking = thinking || (loading && !thoughtContent);

  // Real-time live seconds timer while actively thinking or loading
  useEffect(() => {
    if (!isActivelyThinking) return;

    const startTimestamp = Date.now() - (elapsedSeconds > 0 ? elapsedSeconds * 1000 : 0);
    const interval = setInterval(() => {
      const diff = Math.max(1, Math.floor((Date.now() - startTimestamp) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActivelyThinking]);

  // Keep open while actively streaming thought content, collapse when response starts
  useEffect(() => {
    if (isActivelyThinking && thoughtContent) {
      setIsExpanded(true);
    }
  }, [isActivelyThinking, thoughtContent]);

  const hasThoughtText = Boolean(thoughtContent && thoughtContent.trim().length > 0);

  return (
    <div className="my-1.5 w-full select-none">
      {/* Claude Style Inline Thinking Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`group inline-flex items-center gap-2 py-1 px-2.5 -ml-1 rounded-lg text-[13px] transition-all duration-200 cursor-pointer ${
          isActivelyThinking
            ? 'text-[#8B6FC9] hover:text-[#795BB8] bg-[#EEE8FA] dark:text-purple-300 dark:hover:text-purple-100 dark:bg-purple-950/30'
            : 'text-[#686477] hover:text-[#292633] hover:bg-[#EEE8FA] dark:text-purple-300/80 dark:hover:text-purple-100 dark:hover:bg-purple-500/10'
        }`}
      >
        {/* Claude Asterisk / Spark Icon */}
        <div className="relative flex items-center justify-center text-[#8B6FC9] group-hover:text-[#795BB8] dark:text-purple-400 dark:group-hover:text-purple-300 transition-colors">
          {isActivelyThinking ? (
            <span className="inline-block animate-spin text-sm" style={{ animationDuration: '3s' }}>
              ✦
            </span>
          ) : (
            <span className="text-sm">✦</span>
          )}
        </div>

        {/* Text Label */}
        <span className="font-normal italic tracking-tight">
          {isActivelyThinking
            ? (thinkingText
                ? `${thinkingText.replace(/\.\.\.$/, '')}${elapsedSeconds > 0 ? ` (${elapsedSeconds}s)` : '...'}`
                : `Thinking${elapsedSeconds > 0 ? ` (${elapsedSeconds}s)` : '...'}`)
            : `Thought for ${Math.max(1, elapsedSeconds)} ${elapsedSeconds === 1 ? 'second' : 'seconds'}`}
        </span>

        {/* Expand / Collapse Chevron */}
        <ChevronDown
          size={13}
          className={`text-[#8B6FC9]/70 group-hover:text-[#8B6FC9] dark:text-purple-400/70 dark:group-hover:text-purple-200 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Expandable Reasoning / Thought Stream */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 pl-3.5 pr-3 py-2 border-l-2 border-[#8B6FC9]/50 dark:border-purple-400/40 text-[13.5px] text-[#686477] dark:text-purple-200/80 leading-relaxed font-sans space-y-2">
              {hasThoughtText ? (
                <div className="whitespace-pre-wrap text-[#292633]/85 dark:text-purple-200/85 leading-relaxed font-sans italic">
                  {thoughtContent}
                </div>
              ) : (
                <div className="space-y-1 text-xs text-[#686477] dark:text-purple-300/75 italic">
                  <p>✦ Understanding user intent and context...</p>
                  <p>✦ Assessing reasoning strategy and structuring response...</p>
                  <p>✦ Generating final synthesized answer...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
