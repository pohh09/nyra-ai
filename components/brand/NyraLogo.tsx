'use client';

import React from 'react';
import { NyraIcon, NyraIconVariant } from './NyraIcon';

export interface NyraLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: NyraIconVariant;
  showText?: boolean;
  className?: string;
  animated?: boolean;
  textClassName?: string;
  glow?: boolean;
}

export default function NyraLogo({
  size = 'md',
  variant = 'primary',
  showText = false,
  className = '',
  animated = false,
  textClassName = '',
  glow = false,
}: NyraLogoProps) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const dim = typeof size === 'number' ? size : pixelSizes[size] || 36;
  const iconDim = Math.round(dim * 0.68);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden border border-pink-500/25 bg-[#120726] shadow-md shadow-purple-950/40 shrink-0 group-hover:border-pink-500/50 transition-all ${animated ? 'hover:scale-105' : ''
          }`}
        style={{ width: `${dim}px`, height: `${dim}px` }}
      >
        <NyraIcon
          size={iconDim}
          variant={variant}
          glow={glow}
          className="transition-transform duration-200"
        />

        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight text-white ${textClassName || 'text-base'}`}>
            Nyra <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
      )}
    </div>
  );
}

