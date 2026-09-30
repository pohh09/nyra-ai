'use client';

import React from 'react';

export type NyraIconVariant = 'primary' | 'dark' | 'light' | 'monochrome' | 'favicon' | 'gradient';

export interface NyraIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: NyraIconVariant;
  className?: string;
  glow?: boolean;
}

/**
 * Nyra AI Brand Icon
 * 
 * Distinctive, geometric AI brandmark based on the "Neural Nexus" principle:
 * Continuous intertwined neural ribbons forming a hidden abstract 'N'
 * with a luminous central focal lens.
 * 
 * Highly legible from 16px favicon to 512px hero scale.
 */
export function NyraIcon({
  size = 32,
  variant = 'primary',
  className = '',
  glow = false,
  ...props
}: NyraIconProps) {
  const id = React.useId().replace(/:/g, '');

  // Gradient configurations based on variant
  const getGradientDef = () => {
    switch (variant) {
      case 'dark':
        return (
          <>
            <linearGradient id={`nyraGradA-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4FA3" />
              <stop offset="50%" stopColor="#E52A83" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
            <linearGradient id={`nyraGradB-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="60%" stopColor="#7928CA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </>
        );
      case 'light':
        return (
          <>
            <linearGradient id={`nyraGradA-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B31372" />
              <stop offset="50%" stopColor="#D11E73" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
            <linearGradient id={`nyraGradB-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="60%" stopColor="#6B21A8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </>
        );
      case 'monochrome':
        return null;
      case 'favicon':
      case 'gradient':
      case 'primary':
      default:
        return (
          <>
            <linearGradient id={`nyraGradA-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4FA3" />
              <stop offset="30%" stopColor="#E52A83" />
              <stop offset="70%" stopColor="#D11E73" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
            <linearGradient id={`nyraGradB-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="40%" stopColor="#7928CA" />
              <stop offset="75%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <radialGradient id={`nyraCoreGlow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#9333EA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7928CA" stopOpacity="0" />
            </radialGradient>
          </>
        );
    }
  };

  const isMonochrome = variant === 'monochrome';
  const fillA = isMonochrome ? 'currentColor' : `url(#nyraGradA-${id})`;
  const fillB = isMonochrome ? 'currentColor' : `url(#nyraGradB-${id})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${glow ? 'drop-shadow-[0_0_12px_rgba(229,42,131,0.45)]' : ''} ${className}`}
      {...props}
    >
      <defs>
        {getGradientDef()}
        {glow && (
          <filter id={`nyraGlowFilter-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Central Neural Nexus Aura */}
      {!isMonochrome && variant !== 'favicon' && (
        <circle cx="16" cy="16" r="6.5" fill={`url(#nyraCoreGlow-${id})`} />
      )}

      {/* Primary Neural Ribbon 1 (Left Pillar & Downward Diagonal Bridge) */}
      <path
        d="M 6.5 24.5 L 6.5 10.5 C 6.5 7.8 8.6 5.8 11.4 6.6 C 13.5 7.2 15.2 9.2 16.8 11.6 L 21.6 19 C 23.2 21.4 24.6 23.2 25.5 24.2 C 26 24.8 25.4 25.8 24.6 25.8 L 19.5 25.8 C 17.8 25.8 16.3 24.9 15.3 23.4 L 11.2 17.2 L 11.2 24.5 C 11.2 25.3 10.5 26 9.7 26 L 8 26 C 7.2 26 6.5 25.3 6.5 24.5 Z"
        fill={fillA}
        opacity={isMonochrome ? 0.95 : 1}
      />

      {/* Secondary Neural Ribbon 2 (Right Pillar & Upward Cross Tangent) */}
      <path
        d="M 25.5 7.5 L 25.5 21.5 C 25.5 24.2 23.4 26.2 20.6 25.4 C 18.5 24.8 16.8 22.8 15.2 20.4 L 10.4 13 C 8.8 10.6 7.4 8.8 6.5 7.8 C 6 7.2 6.6 6.2 7.4 6.2 L 12.5 6.2 C 14.2 6.2 15.7 7.1 16.7 8.6 L 20.8 14.8 L 20.8 7.5 C 20.8 6.7 21.5 6 22.3 6 L 24 6 C 24.8 6 25.5 6.7 25.5 7.5 Z"
        fill={fillB}
        opacity={isMonochrome ? 0.65 : 0.9}
        style={{ mixBlendMode: isMonochrome ? 'normal' : 'screen' }}
      />

      {/* Central Diamond Spark (Neural Synapse) */}
      {!isMonochrome && (
        <path
          d="M 16 12.5 L 18 16 L 16 19.5 L 14 16 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

export default NyraIcon;
