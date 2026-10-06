'use client';

import React from 'react';

export type NyraIconVariant = 'primary' | 'dark' | 'light' | 'monochrome' | 'favicon' | 'gradient';

export interface NyraIconProps extends React.HTMLAttributes<HTMLDivElement> {
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
  const isMonochrome = variant === 'monochrome';
  const src = isMonochrome ? '/logo-monochrome.png' : '/logo.png';
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 32;

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center select-none ${glow ? 'drop-shadow-[0_0_14px_rgba(236,72,153,0.55)]' : ''
        } ${className}`}
      style={{ width: numSize, height: numSize }}
      {...props}
    >
      <img
        src={src}
        alt="Nyra AI"
        width={numSize}
        height={numSize}
        className="w-full h-full object-contain pointer-events-none transition-transform"
        loading="eager"
      />
    </div>
  );
}

export default NyraIcon;
