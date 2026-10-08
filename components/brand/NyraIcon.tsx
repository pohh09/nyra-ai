'use client';

import React from 'react';

export type NyraIconVariant = 'primary' | 'dark' | 'light' | 'monochrome' | 'favicon' | 'gradient';

export interface NyraIconProps extends React.SVGProps<SVGSVGElement> {
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
  const id = React.useId().replace(/:/g, '');

  const isMonochrome = variant === 'monochrome';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${glow ? 'drop-shadow-[0_0_12px_rgba(229,42,131,0.45)]' : ''} ${className}`}
      {...props}
    >
      <defs>
        {/* Ribbon A (Purple) */}
        <linearGradient id={`nyraRibbonA-${id}`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="33%" stopColor="#C084FC" />
          <stop offset="66%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        <linearGradient id={`nyraGlassSheenA-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`nyraSoftSheenA-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Ribbon B (Pink) */}
        <linearGradient id={`nyraRibbonB-${id}`} x1="90%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#FFA0D2" />
          <stop offset="33%" stopColor="#FF4FA3" />
          <stop offset="66%" stopColor="#E52A83" />
          <stop offset="100%" stopColor="#B31372" />
        </linearGradient>

        <linearGradient id={`nyraGlassSheenB-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`nyraSoftSheenB-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Synapse Gradients */}
        <linearGradient id={`synapseNorth-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id={`synapseEast-${id}`} x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id={`synapseSouth-${id}`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#E52A83" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={`synapseWest-${id}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E52A83" stopOpacity="0.6" />
        </linearGradient>

        {!isMonochrome && (
          <>
            <filter id={`heroRealistic3DA-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#4C1D95" floodOpacity="0.4" result="dropShadow" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
              <feOffset dx="-6" dy="-6" in="blur" result="offsetBlurTop" />
              <feComposite in="SourceAlpha" in2="offsetBlurTop" operator="out" result="highlightArea" />
              <feFlood floodColor="#E9D5FF" floodOpacity="0.8" result="highlightColor" />
              <feComposite in="highlightColor" in2="highlightArea" operator="in" result="highlight" />
              <feOffset dx="8" dy="8" in="blur" result="offsetBlurBottom" />
              <feComposite in="SourceAlpha" in2="offsetBlurBottom" operator="out" result="shadowArea" />
              <feFlood floodColor="#4C1D95" floodOpacity="0.75" result="shadowColor" />
              <feComposite in="shadowColor" in2="shadowArea" operator="in" result="innerShadow" />
              <feMerge>
                <feMergeNode in="dropShadow" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="innerShadow" />
                <feMergeNode in="highlight" />
              </feMerge>
            </filter>

            <filter id={`heroRealistic3DB-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#801456" floodOpacity="0.4" result="dropShadow" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
              <feOffset dx="-6" dy="-6" in="blur" result="offsetBlurTop" />
              <feComposite in="SourceAlpha" in2="offsetBlurTop" operator="out" result="highlightArea" />
              <feFlood floodColor="#FFA0D2" floodOpacity="0.8" result="highlightColor" />
              <feComposite in="highlightColor" in2="highlightArea" operator="in" result="highlight" />
              <feOffset dx="8" dy="8" in="blur" result="offsetBlurBottom" />
              <feComposite in="SourceAlpha" in2="offsetBlurBottom" operator="out" result="shadowArea" />
              <feFlood floodColor="#801456" floodOpacity="0.75" result="shadowColor" />
              <feComposite in="shadowColor" in2="shadowArea" operator="in" result="innerShadow" />
              <feMerge>
                <feMergeNode in="dropShadow" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="innerShadow" />
                <feMergeNode in="highlight" />
              </feMerge>
            </filter>
          </>
        )}
      </defs>

      {/* Main Volumetric Ribbon A (Left Inverted V) */}
      <path
        d="M 104 392 L 104 168 C 104 125 138 93 182 106 C 216 115 243 147 269 186 L 346 304 C 371 342 394 371 408 387 C 416 397 406 413 394 413 L 312 413 C 285 413 261 398 245 374 L 179 275 L 179 392 C 179 405 168 416 155 416 L 128 416 C 115 416 104 405 104 392 Z"
        fill={isMonochrome ? 'currentColor' : `url(#nyraRibbonA-${id})`}
        stroke={isMonochrome ? 'none' : '#FF94CC'}
        strokeWidth="2.5"
        filter={!isMonochrome ? `url(#heroRealistic3DA-${id})` : undefined}
      />

      {!isMonochrome && (
        <>
          {/* Outer Glass Bevel Highlight Rim A */}
          <path
            d="M 108 380 L 108 172 C 108 135 138 106 178 116 C 206 123 232 152 258 190 L 336 308 C 358 342 382 372 396 388"
            stroke={`url(#nyraGlassSheenA-${id})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Inner Chamfer Refraction Rim A */}
          <path
            d="M 175 388 L 175 272 L 243 372 C 258 394 280 408 304 408 L 388 408"
            stroke={`url(#nyraSoftSheenA-${id})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {/* Main Volumetric Ribbon B (Right Upright V) */}
      <path
        d="M 408 120 L 408 344 C 408 387 374 419 330 406 C 296 397 269 365 243 326 L 166 208 C 141 170 118 141 104 125 C 96 115 106 99 118 99 L 200 99 C 227 99 251 114 267 138 L 333 237 L 333 120 C 333 107 344 96 357 96 L 384 96 C 397 96 408 107 408 120 Z"
        fill={isMonochrome ? 'currentColor' : `url(#nyraRibbonB-${id})`}
        stroke={isMonochrome ? 'none' : '#A5B4FC'}
        strokeWidth="2.5"
        filter={!isMonochrome ? `url(#heroRealistic3DB-${id})` : undefined}
      />

      {!isMonochrome && (
        <>
          {/* Outer Glass Bevel Highlight Rim B */}
          <path
            d="M 404 132 L 404 340 C 404 376 376 404 336 394 C 308 387 282 358 256 320 L 178 202 C 156 168 132 138 118 122"
            stroke={`url(#nyraGlassSheenB-${id})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          {/* Inner Chamfer Refraction Rim B */}
          <path
            d="M 337 124 L 337 240 L 269 140 C 254 118 232 104 208 104 L 124 104"
            stroke={`url(#nyraSoftSheenB-${id})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Quantum Synapse Prism */}
          <g>
            <path d="M 256 204 L 296 256 L 256 256 Z" fill={`url(#synapseNorth-${id})`} />
            <path d="M 296 256 L 256 308 L 256 256 Z" fill={`url(#synapseEast-${id})`} />
            <path d="M 256 308 L 216 256 L 256 256 Z" fill={`url(#synapseSouth-${id})`} />
            <path d="M 216 256 L 256 204 L 256 256 Z" fill={`url(#synapseWest-${id})`} />
            <path
              d="M 256 204 L 296 256 L 256 308 L 216 256 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              className="drop-shadow-[0_0_12px_#FFFFFF]"
            />
            <line x1="256" y1="204" x2="256" y2="308" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            <line x1="216" y1="256" x2="296" y2="256" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            <circle cx="256" cy="256" r="7" fill="#38BDF8" className="animate-pulse shadow-lg" />
            <path
              d="M 256 242 Q 256 256 270 256 Q 256 256 256 270 Q 256 256 242 256 Q 256 256 256 242 Z"
              fill="#FFFFFF"
              opacity="0.95"
              className="animate-spin"
              style={{ transformOrigin: '256px 256px', animationDuration: '8s' }}
            />
          </g>
        </>
      )}
    </svg>
  );
}
