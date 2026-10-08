'use client';

import React from 'react';
import Image from 'next/image';

export type NyraIconVariant = 'primary' | 'dark' | 'light' | 'monochrome' | 'favicon' | 'gradient';

export interface NyraIconProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  size?: number | string;
  variant?: NyraIconVariant;
  className?: string;
  glow?: boolean;
}

export function NyraIcon({
  size = 32,
  variant = 'primary',
  className = '',
  glow = false,
  ...props
}: NyraIconProps) {
  const numericSize = typeof size === 'string' ? parseInt(size) : size;

  return (
    <div 
      className={`relative shrink-0 flex items-center justify-center transition-transform ${glow ? 'drop-shadow-[0_0_12px_rgba(229,42,131,0.45)]' : ''} ${className}`}
      style={{ width: numericSize, height: numericSize }}
      {...props}
    >
      <Image
        src="/nyra-icon.svg"
        alt="Nyra AI Logo"
        width={numericSize}
        height={numericSize}
        className="w-full h-full object-contain pointer-events-none select-none"
        priority
      />
    </div>
  );
}
