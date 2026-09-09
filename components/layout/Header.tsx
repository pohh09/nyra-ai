'use client';

import { PanelLeft, Sparkles, Zap } from 'lucide-react';

type Props = {
  title?: string;
  onMenuClick: () => void;
};

export default function Header({
  title = 'AI Assistant',
  onMenuClick,
}: Props) {
  return (
    <header
      className="relative flex h-16 shrink-0 items-center justify-between overflow-hidden border-b border-[#E8E4EF] dark:border-purple-400/15 bg-[#FFFFFF]/80 dark:bg-[#0a0715]/80 px-4 backdrop-blur-2xl md:px-6 transition-colors"
    >
      {/* TOP GLOW */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#8B6FC9]/5 dark:from-purple-500/10 to-transparent"
      />

      {/* LEFT */}
      <div className="relative z-10 flex items-center gap-3">
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E4EF] dark:border-white/10 bg-[#F5F3F9] dark:bg-white/[0.035] text-[#292633] dark:text-zinc-300 transition-all duration-200 hover:border-[#8B6FC9]/40 hover:bg-[#EEE8FA] hover:text-[#292633] dark:hover:text-white md:hidden"
        >
          <PanelLeft size={17} />
        </button>

        {/* TITLE */}
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-[#292633] dark:text-white">
            {title}
          </h1>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6FA58A] dark:bg-emerald-400" />
            <p className="text-[11px] text-[#686477] dark:text-zinc-400">
              Nyra Workspace
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 hidden items-center gap-3 md:flex">
        {/* MODEL BADGE */}
        <div className="flex items-center gap-2 rounded-xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#EEE8FA] dark:bg-purple-500/10 px-3.5 py-2 text-xs font-medium text-[#6B52A3] dark:text-purple-300 shadow-xs">
          <Sparkles size={13} className="text-[#8B6FC9] dark:text-purple-400" />
          Nyra AI
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 rounded-xl border border-[#E8E4EF] dark:border-white/10 bg-[#F5F3F9] dark:bg-white/[0.035] px-3 py-2 text-xs text-[#686477] dark:text-zinc-400">
          <Zap size={12} className="text-[#C49A5A] dark:text-yellow-400" />
          Online
        </div>
      </div>
    </header>
  );
}