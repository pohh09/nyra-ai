'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  streaming: boolean;
};

export default function StreamingText({ children, streaming }: Props) {
  return (
    <div className="nyra-streaming-wrapper relative inline">
      {children}
      {streaming && (
        <span
          aria-hidden="true"
          className="nyra-streaming-cursor inline-block w-1.5 sm:w-2 h-[1.1em] ml-1 align-[-0.12em] rounded-full bg-gradient-to-b from-[#E52A83] to-[#B31372] dark:from-pink-400 dark:to-purple-400 shadow-[0_0_8px_rgba(229,42,131,0.5)] select-none pointer-events-none"
        />
      )}
    </div>
  );
}