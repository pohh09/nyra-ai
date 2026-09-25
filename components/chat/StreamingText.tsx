'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  streaming: boolean;
};

export default function StreamingText({ children, streaming }: Props) {
  return (
    <div className="chatgpt-streaming-wrapper relative">
      {children}
      {streaming && (
        <span
          aria-hidden="true"
          className="chatgpt-cursor inline-block w-2 sm:w-2.5 h-[1.15em] ml-1 align-[-0.15em] rounded-[2px] bg-[#292633] dark:bg-white shadow-[0_0_8px_rgba(139,92,246,0.4)] select-none"
        />
      )}
    </div>
  );
}