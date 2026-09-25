'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, ArrowUp, Square, Mic, Globe } from 'lucide-react';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  thinking?: boolean;
  thinkingText?: string;
  disabled?: boolean;
  placeholder?: string;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPdfUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  webSearch?: boolean;
  onToggleWebSearch?: () => void;
  showScrollButton?: boolean;
  onScrollToBottom?: () => void;
};

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  thinking = false,
  thinkingText,
  disabled = false,
  placeholder = 'Message Nyra... (Enter to send, Shift+Enter for newline)',
  onImageUpload,
  onPdfUpload,
  onVoiceToggle,
  isListening = false,
  webSearch = false,
  onToggleWebSearch,
  showScrollButton = false,
  onScrollToBottom,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto resize height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // Click outside to close tools menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle enter key submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSubmit();
      }
    }
  };

  const hasContent = Boolean(value.trim());

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Floating Status Controls Directly Above Input Bar */}
      {(isLoading || thinking || showScrollButton) && (
        <div className="flex items-center justify-center gap-2 mb-2">
          {(isLoading || thinking) && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/30 bg-white/95 dark:bg-[#130f24]/95 shadow-md backdrop-blur-xl text-xs animate-[fadeIn_0.15s_ease-out]">
              {thinking ? (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[#8B6FC9] to-cyan-400 chatgpt-thinking-dot shadow-sm" />
                  <span className="font-medium text-[#6B52A3] dark:text-purple-200">
                    {thinkingText || 'Nyra is thinking...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[#8B6FC9] dark:text-purple-300">
                    <span className="typing-dot bg-[#8B6FC9] dark:bg-purple-300" />
                    <span className="typing-dot bg-[#8B6FC9] dark:bg-purple-300" />
                    <span className="typing-dot bg-[#8B6FC9] dark:bg-purple-300" />
                  </div>
                  <span className="font-medium text-[#292633] dark:text-slate-200">
                    Nyra is typing...
                  </span>
                </div>
              )}

              {onStop && (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center gap-1 pl-2 ml-1 border-l border-[#E8E4EF] dark:border-purple-400/20 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition cursor-pointer"
                  title="Stop generating"
                >
                  <Square size={10} className="fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          )}

          {showScrollButton && onScrollToBottom && (
            <button
              type="button"
              onClick={onScrollToBottom}
              className={`group h-8.5 w-8.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/35 bg-[#FFFFFF]/95 dark:bg-[#130f24]/95 hover:bg-[#F5F3F9] dark:hover:bg-[#1c1533] hover:border-[#8B6FC9]/50 text-[#6B52A3] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white flex items-center justify-center shadow-md backdrop-blur-xl transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                isLoading ? 'ring-2 ring-[#8B6FC9]/40 animate-pulse' : ''
              }`}
              title="Scroll to bottom"
              aria-label="Scroll to bottom"
            >
              <ArrowUp size={15} className="rotate-180 text-[#8B6FC9] dark:text-purple-300 group-hover:text-[#292633] dark:group-hover:text-white group-hover:translate-y-0.5 transition-all" />
            </button>
          )}
        </div>
      )}
      {/* Redesigned Glassmorphic Input Container */}
      <div
        className="
          rounded-[26px] sm:rounded-[30px]
          border border-[#D8C7EC] hover:border-[#8B6FC9]/60
          focus-within:border-[#7C50B8] focus-within:ring-4 focus-within:ring-[#7C50B8]/15
          bg-white/98
          dark:border-purple-400/35 dark:hover:border-purple-400/60
          dark:focus-within:border-purple-400/80 dark:focus-within:ring-purple-500/15
          dark:bg-gradient-to-b dark:from-[#180e2d]/98 dark:via-[#110822]/98 dark:to-[#0a0416]/98
          shadow-[0_12px_36px_rgba(124,80,184,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(139,111,201,0.08)]
          backdrop-blur-2xl
          px-3.5 sm:px-4.5 py-3 sm:py-3.5
          transition-all duration-200
        "
      >
        {/* Textarea */}
        <div className="flex items-start">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="
              w-full
              resize-none
              bg-transparent
              outline-none
              min-h-[38px] sm:min-h-[42px]
              max-h-36 sm:max-h-48
              pt-0.5 sm:pt-1
              text-[14.5px] sm:text-[15.5px]
              leading-relaxed
              text-[#292633] dark:text-white
              placeholder:text-[#92909B] dark:placeholder:text-purple-200/50
              custom-scrollbar
            "
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="mt-2.5 pt-2.5 border-t border-[#DFD0F2]/80 dark:border-purple-400/20 flex items-center justify-between gap-2">
          {/* Left: Attach & Search Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* '+' Attach button */}
            {(onImageUpload || onPdfUpload) && (
              <div ref={toolsMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowToolsMenu((v) => !v)}
                  className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full border border-black/5 dark:border-white/10 bg-[#F4F4F5] dark:bg-[#2A2B32] hover:bg-[#EAEAEB] dark:hover:bg-[#363740] text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                  title="Add attachments"
                  aria-label="Add attachments"
                >
                  <Plus size={18} strokeWidth={2.4} />
                </button>

                {showToolsMenu && (
                  <div className="absolute bottom-12 left-0 w-56 rounded-2xl border border-[#E8E4EF] dark:border-white/15 bg-white dark:bg-[#161224] shadow-2xl overflow-hidden z-[999] p-1.5 backdrop-blur-2xl animate-[fadeIn_0.12s_ease-out]">
                    {onImageUpload && (
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.07] transition text-[#292633] dark:text-zinc-200 hover:text-black dark:hover:text-white">
                        <span className="text-base">🖼️</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Upload Images</span>
                          <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400">PNG, JPG, WEBP</span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          multiple
                          hidden
                          onChange={(e) => {
                            onImageUpload(e);
                            setShowToolsMenu(false);
                          }}
                        />
                      </label>
                    )}

                    {onPdfUpload && (
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.07] transition text-[#292633] dark:text-zinc-200 hover:text-black dark:hover:text-white">
                        <span className="text-base">📄</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Upload PDF</span>
                          <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400">In-browser analysis</span>
                        </div>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          multiple
                          hidden
                          onChange={(e) => {
                            onPdfUpload(e);
                            setShowToolsMenu(false);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Web Search Toggle Pill */}
            {onToggleWebSearch && (
              <button
                type="button"
                onClick={onToggleWebSearch}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95
                  ${
                    webSearch
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-[#F4F4F5] hover:bg-[#EAEAEB] dark:bg-[#2A2B32] dark:hover:bg-[#363740] border border-black/5 dark:border-white/10'
                  }
                `}
                title={webSearch ? 'Web Search is ON' : 'Enable Web Search'}
              >
                <Globe size={13} className={webSearch ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-400'} />
                <span className="hidden sm:inline">Search</span>
              </button>
            )}
          </div>

          {/* Right: Voice Dictation & Send / Stop Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Voice Dictation Button */}
            {onVoiceToggle && (
              <button
                type="button"
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                onClick={onVoiceToggle}
                className={`
                  h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer
                  ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse ring-2 ring-rose-400/50'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-[#F4F4F5] dark:bg-[#2A2B32] hover:bg-[#EAEAEB] dark:hover:bg-[#363740] border border-black/5 dark:border-white/10 active:scale-95 shadow-xs'
                  }
                `}
                title={isListening ? 'Stop voice input' : 'Voice Mode (Speech to Text)'}
              >
                {isListening ? (
                  <Square size={11} className="fill-white stroke-none" />
                ) : (
                  <Mic size={18} strokeWidth={2.1} />
                )}
              </button>
            )}

            {/* Circular Send / Stop Button */}
            <button
              type="button"
              onClick={isLoading ? onStop : onSubmit}
              disabled={!isLoading && (!hasContent || disabled)}
              className={`
                h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all duration-150
                ${
                  isLoading
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-85 active:scale-95 cursor-pointer shadow-sm animate-pulse'
                    : hasContent && !disabled
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-85 active:scale-95 cursor-pointer shadow-sm'
                    : 'bg-black/10 dark:bg-white/15 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }
              `}
              title={
                isLoading
                  ? 'Stop response'
                  : hasContent
                  ? 'Send message (Enter)'
                  : 'Type a message'
              }
              aria-label={isLoading ? 'Stop response' : 'Send message'}
            >
              {isLoading ? (
                <Square size={10} className="fill-current stroke-none" />
              ) : (
                <ArrowUp size={18} strokeWidth={2.7} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-1.5 sm:mt-2 text-center text-[10.5px] sm:text-[11.5px] text-[#7A6E8C] dark:text-purple-300/60 select-none tracking-tight font-normal flex items-center justify-center gap-1.5">
        <span>🔒 100% In-Browser Privacy</span>
        <span>•</span>
        <span>Nyra can make mistakes. Check important info.</span>
      </p>
    </div>
  );
}