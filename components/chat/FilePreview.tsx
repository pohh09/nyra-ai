'use client';

import React from 'react';
import { FileText, X, Loader2, RotateCcw, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAttachment } from '@/lib/types';
import { formatFileSize } from '@/lib/fileHandling';

export { formatFileSize };

interface FilePreviewProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export default function FilePreview({ attachments, onRemove, onRetry }: FilePreviewProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 max-w-full">
      <AnimatePresence initial={false}>
        {attachments.map((file) => {
          const isProcessing = file.status === 'processing' || file.status === 'uploading';
          const isError = file.status === 'error' || file.status === 'failed';
          const isReady = file.status === 'ready' || (!file.status && Boolean(file.extractedText));

          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{ duration: 0.15 }}
              className={`group relative flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs backdrop-blur-xl shadow-sm transition-all ${
                isError
                  ? 'border-[#C77B7B]/40 bg-[#F9ECEC] dark:bg-rose-950/40 text-[#A85A5A] dark:text-rose-300'
                  : isProcessing
                  ? 'border-[#8B6FC9]/40 bg-[#EEE8FA] dark:bg-purple-950/40 text-[#8B6FC9] dark:text-purple-200'
                  : 'border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF] dark:bg-[#130f24]/90 text-[#292633] dark:text-slate-200 hover:border-[#8B6FC9]/60'
              }`}
            >
              {/* FILE ICON / SPINNER */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEE8FA] dark:bg-purple-500/10 border border-[#E8E4EF] dark:border-purple-400/20 text-[#8B6FC9] dark:text-purple-400">
                {isProcessing ? (
                  <Loader2 size={15} className="animate-spin text-[#8B6FC9] dark:text-purple-400" />
                ) : isError ? (
                  <AlertCircle size={15} className="text-[#C77B7B] dark:text-rose-400" />
                ) : (
                  <FileText size={15} className="text-[#8B6FC9] dark:text-purple-300" />
                )}
              </div>

              {/* FILE INFO */}
              <div className="min-w-0 max-w-[150px] sm:max-w-[200px]">
                <p className="truncate font-medium text-xs text-[#292633] dark:text-white" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#686477] dark:text-slate-400 font-mono mt-0.5">
                  {file.pages && <span>{file.pages} pgs</span>}
                  {file.pages && file.size ? <span>•</span> : null}
                  {file.size ? <span>{formatFileSize(file.size)}</span> : null}

                  {/* STATUS BADGE */}
                  {isProcessing && (
                    <span className="text-[#8B6FC9] dark:text-purple-300 font-semibold animate-pulse ml-1">Processing...</span>
                  )}
                  {isError && (
                    <span className="text-[#C77B7B] dark:text-rose-400 font-semibold ml-1">Failed</span>
                  )}
                  {isReady && (
                    <span className="text-[#6FA58A] dark:text-emerald-400 font-semibold ml-1 flex items-center gap-0.5">
                      <Check size={10} /> Ready
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS: RETRY & REMOVE */}
              <div className="flex items-center gap-1 ml-1">
                {isError && onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(file.id)}
                    className="flex h-5 items-center gap-1 px-1.5 rounded-md bg-[#C77B7B]/15 text-[#A85A5A] dark:text-rose-300 hover:bg-[#C77B7B] hover:text-white transition-colors cursor-pointer text-[10px] font-semibold border border-[#C77B7B]/30"
                    title="Retry parsing this document"
                    aria-label={`Retry ${file.name}`}
                  >
                    <RotateCcw size={10} />
                    <span>Retry</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEE8FA] dark:bg-slate-800/80 text-[#686477] dark:text-slate-400 hover:bg-[#C77B7B] hover:text-white transition-colors cursor-pointer"
                  title="Remove file"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={11} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
