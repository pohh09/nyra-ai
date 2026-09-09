'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, ArrowUp, Square, Mic, Globe } from 'lucide-react';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPdfUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  webSearch?: boolean;
  onToggleWebSearch?: () => void;
};

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = 'Message Nyra...',
  onImageUpload,
  onPdfUpload,
  onVoiceToggle,
  isListening = false,
  webSearch = false,
  onToggleWebSearch,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  // AUTO HEIGHT
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

  // ENTER TO SEND
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Main ChatGPT Pill Container in Ocean Blue & Cyan Glass */}
      <div
        className="
          rounded-[26px] sm:rounded-[30px]
          border border-sky-400/35 hover:border-sky-400/50
          focus-within:border-sky-400/60 focus-within:ring-2 focus-within:ring-sky-400/20
          bg-gradient-to-b from-[#13284f]/95 via-[#0e1f3f]/95 to-[#09162e]/95
          backdrop-blur-2xl
          px-4 py-3
          shadow-[0_20px_50px_rgba(2,12,30,0.7),0_0_30px_rgba(56,189,248,0.12)]
          transition-all duration-200
        "
      >
        {/* TEXTAREA */}
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
              min-h-[40px]
              max-h-48
              pt-1
              text-[15px] sm:text-[15.5px]
              leading-relaxed
              text-white
              placeholder:text-sky-200/50
              custom-scrollbar
            "
          />
        </div>

        {/* BOTTOM TOOLBAR */}
        <div className="mt-2 pt-2 border-t border-sky-400/20 flex items-center justify-between gap-2">
          {/* LEFT: '+' ATTACH & SEARCH */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* '+' Attach button */}
            {(onImageUpload || onPdfUpload) && (
              <div ref={toolsMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowToolsMenu((v) => !v)}
                  className="
                    h-8 w-8
                    rounded-full
                    border border-sky-400/30
                    bg-sky-500/10 hover:bg-sky-500/20
                    text-sky-200 hover:text-white
                    flex items-center justify-center
                    transition-all
                    hover:scale-105 active:scale-95
                    cursor-pointer
                  "
                  title="Add attachments"
                  aria-label="Add attachments"
                >
                  <Plus size={16} strokeWidth={2.2} className="text-sky-300" />
                </button>

                {showToolsMenu && (
                  <div className="absolute bottom-10 left-0 w-56 rounded-2xl border border-sky-400/30 bg-[#0f2347]/98 shadow-2xl overflow-hidden z-[999] p-1.5 backdrop-blur-xl animate-[fadeIn_0.12s_ease-out]">
                    {onImageUpload && (
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-sky-500/20 transition text-sky-100 hover:text-white">
                        <span className="text-base">🖼️</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Upload Images</span>
                          <span className="text-[10.5px] text-sky-300/70">PNG, JPG, WEBP</span>
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
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-sky-500/20 transition text-sky-100 hover:text-white">
                        <span className="text-base">📄</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Upload PDF</span>
                          <span className="text-[10.5px] text-sky-300/70">Analyze document</span>
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
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                  ${
                    webSearch
                      ? 'bg-sky-500/30 text-sky-100 font-semibold border border-sky-400/50 shadow-sm'
                      : 'text-sky-200 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/20'
                  }
                `}
                title={webSearch ? 'Web Search is ON' : 'Enable Web Search'}
              >
                <Globe size={13} className={webSearch ? 'text-sky-300' : 'text-sky-300/70'} />
                <span className="hidden sm:inline">Search</span>
              </button>
            )}
          </div>

          {/* RIGHT: VOICE & CIRCULAR ACTION BUTTON */}
          <div className="flex items-center gap-2">
            {/* Voice Dictation Button */}
            {onVoiceToggle && (
              <button
                type="button"
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                onClick={onVoiceToggle}
                className={`
                  h-8 w-8 rounded-full border flex items-center justify-center transition cursor-pointer shadow-sm
                  ${
                    isListening
                      ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/50 animate-pulse ring-2 ring-rose-400/60'
                      : 'bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/30 text-sky-200 hover:text-white'
                  }
                `}
                title={isListening ? 'Stop voice input' : 'Voice Mode (Speech to Text)'}
              >
                {isListening ? <Square size={12} className="fill-white" /> : <Mic size={14} />}
              </button>
            )}

            {/* Iconic ChatGPT Send / Stop Button with Theme Accent */}
            <button
              type="button"
              onClick={isLoading ? onStop : onSubmit}
              disabled={!isLoading && (!hasContent || disabled)}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center transition-all
                ${
                  isLoading
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 active:scale-95 cursor-pointer'
                    : hasContent && !disabled
                    ? 'chat-accent-button text-white font-bold active:scale-95 cursor-pointer hover:scale-105'
                    : 'bg-sky-500/10 border border-sky-400/20 text-sky-300/30 cursor-not-allowed'
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
                <Square size={12} className="fill-white" />
              ) : (
                <ArrowUp size={15} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-2 text-center text-[11.5px] text-sky-300/60 select-none tracking-tight font-normal">
        Nyra can make mistakes. Check important info.
      </p>
    </div>
  );
}