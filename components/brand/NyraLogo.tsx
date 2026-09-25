'use client';

import React from 'react';
import Image from 'next/image';

interface NyraLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
  textClassName?: string;
}

export default function NyraLogo({
  size = 'md',
  showText = false,
  className = '',
  animated = false,
  textClassName = '',
}: NyraLogoProps) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const dim = typeof size === 'number' ? size : pixelSizes[size] || 36;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden border border-purple-400/30 bg-[#120726] shadow-md shadow-purple-950/40 shrink-0 group-hover:border-purple-400/60 transition-all ${
          animated ? 'hover:scale-105' : ''
        }`}
        style={{ width: `${dim}px`, height: `${dim}px` }}
      >
        {/* Crisp Image Logo */}
        <Image
          src="/logo.png"
          alt="Nyra AI Logo"
          width={dim}
          height={dim}
          className="object-cover w-full h-full"
          priority
        />

        {/* Ambient subtle glow ring on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-500/10 via-cyan-400/10 to-transparent pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight text-white ${textClassName || 'text-base'}`}>
            Nyra <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
      )}
    </div>
  );
}
