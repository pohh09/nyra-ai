'use client';

import React from 'react';
import { Globe, ExternalLink, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { WebSource } from '@/lib/types';

interface WebSearchCardProps {
  sources: WebSource[];
  isSearching?: boolean;
}

export default function WebSearchCard({ sources, isSearching }: WebSearchCardProps) {
  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3.5 p-3 rounded-xl border border-[#E8E4EF] dark:border-purple-500/30 bg-[#F5F3F9] dark:bg-[#160f2b] text-[#686477] dark:text-purple-200 flex items-center gap-3 text-xs shadow-sm"
      >
        <div className="w-4 h-4 rounded-full border-2 border-[#8B6FC9] dark:border-purple-400 border-t-transparent animate-spin shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-[#292633] dark:text-white flex items-center gap-1.5">
            <Globe size={13} className="text-[#8B6FC9] dark:text-purple-400" />
            <span>Searching the web...</span>
          </p>
          <p className="text-[11px] text-[#686477] dark:text-purple-300/80">Gathering real-time citations & search results</p>
        </div>
      </motion.div>
    );
  }

  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 space-y-2"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6FC9] dark:text-purple-300 uppercase tracking-wider font-mono">
        <Compass size={13} className="text-[#8B6FC9] dark:text-purple-400" />
        <span>Sources ({sources.length})</span>
      </div>

      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-2 overflow-x-auto no-scrollbar touch-pan-x -mx-1 sm:mx-0 px-1 sm:px-0 pb-1 sm:pb-0">
        {sources.map((src, index) => {
          let domain = src.domain || '';
          if (!domain) {
            try {
              domain = new URL(src.url).hostname.replace(/^www\./, '');
            } catch {
              domain = 'web';
            }
          }

          const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(src.url)}`;

          return (
            <a
              key={index}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2.5 rounded-xl border border-[#E8E4EF] dark:border-purple-500/25 bg-[#FFFFFF] dark:bg-[#140e26] hover:bg-[#F5F3F9] dark:hover:bg-[#1e1538] hover:border-[#8B6FC9]/40 dark:hover:border-purple-400/40 transition-all flex flex-col justify-between gap-1.5 shadow-sm cursor-pointer min-w-[210px] max-w-[260px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 text-[11px] text-[#686477] dark:text-purple-300/80 group-hover:text-[#292633] dark:group-hover:text-purple-200 transition">
                <span className="w-4 h-4 rounded-full bg-[#EEE8FA] dark:bg-[#241945] border border-[#8B6FC9]/30 dark:border-purple-400/30 flex items-center justify-center text-[9px] font-mono text-[#8B6FC9] dark:text-purple-200 font-bold shrink-0">
                  {index + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconUrl}
                  alt={domain}
                  className="w-3.5 h-3.5 rounded-sm shrink-0 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="truncate font-medium text-[#292633] dark:text-purple-200 group-hover:text-[#8B6FC9] dark:group-hover:text-purple-100">{domain}</span>
                <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition shrink-0 text-[#8B6FC9] dark:text-purple-400" />
              </div>
              <p className="text-xs text-[#292633] dark:text-[#f1eff7] line-clamp-2 font-medium group-hover:text-[#8B6FC9] dark:group-hover:text-white transition">
                {src.title}
              </p>
              {src.snippet && (
                <p className="text-[10px] text-[#92909B] dark:text-purple-300/70 line-clamp-1 italic font-sans">
                  {src.snippet}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}
