'use client';

import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { usePwaInstall } from '@/lib/pwa/usePwaInstall';

interface InstallButtonProps {
  variant?: 'sidebar' | 'pill' | 'menu';
  className?: string;
  onInstalled?: () => void;
}

export default function InstallButton({
  variant = 'sidebar',
  className = '',
  onInstalled,
}: InstallButtonProps) {
  const { isInstallable, installApp } = usePwaInstall();

  if (!isInstallable) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const installed = await installApp();
    if (installed && onInstalled) {
      onInstalled();
    }
  };

  if (variant === 'menu') {
    return (
      <button
        onClick={handleInstallClick}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#E52A83] dark:text-pink-300 hover:bg-[#F4DCE9] dark:hover:bg-pink-500/15 transition cursor-pointer min-h-[38px] ${className}`}
        title="Install Nyra AI as standalone desktop or mobile application"
      >
        <Download size={14} className="text-[#E52A83] dark:text-pink-400 shrink-0 animate-bounce" />
        <span className="flex-1 text-left">Install Nyra App</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E52A83]/15 dark:bg-pink-400/20 text-[#B31372] dark:text-pink-200">
          PWA
        </span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-pink-500/25 transition active:scale-95 cursor-pointer ${className}`}
        title="Install Nyra AI on your device"
      >
        <Download size={13} className="shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <div className={`px-2 py-1 ${className}`}>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#E52A83]/10 via-[#B31372]/15 to-purple-600/10 hover:from-[#E52A83]/20 hover:to-purple-600/20 border border-[#E52A83]/30 dark:border-pink-500/30 text-xs font-semibold text-[#B31372] dark:text-pink-200 transition cursor-pointer group shadow-2xs active:scale-[0.99]"
        title="Install Nyra AI as a standalone desktop or mobile application"
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-[#E52A83] to-[#B31372] flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Download size={12} strokeWidth={2.5} />
          </div>
          <span className="tracking-tight text-left">Install Nyra AI</span>
        </div>
        <span className="text-[9.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#E52A83]/15 dark:bg-pink-400/25 text-[#B31372] dark:text-pink-200 font-bold">
          App
        </span>
      </button>
    </div>
  );
}
