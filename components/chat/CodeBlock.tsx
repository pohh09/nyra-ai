'use client';

import { useState, useEffect } from 'react';
import { Check, Copy, Download, ChevronDown, ChevronUp, Sparkles, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type Props = {
  language: string;
  value: string;
  onCodeAction?: (prompt: string) => void;
};

const EXTENSION_MAP: Record<string, string> = {
  typescript: 'ts',
  tsx: 'tsx',
  javascript: 'js',
  jsx: 'jsx',
  python: 'py',
  html: 'html',
  css: 'css',
  json: 'json',
  sql: 'sql',
  rust: 'rs',
  go: 'go',
  bash: 'sh',
  shell: 'sh',
  yaml: 'yaml',
  markdown: 'md',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
};

export default function CodeBlock({ language, value, onCodeAction }: Props) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isLightTheme =
        document.documentElement.classList.contains('light') ||
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('theme') === 'light';
      setIsLight(isLightTheme);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const linesCount = value.split('\n').length;
  const isLong = linesCount > 22;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const lang = (language || 'txt').toLowerCase();
    const ext = EXTENSION_MAP[lang] || 'txt';
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-snippet.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative my-3 sm:my-4 w-full max-w-full overflow-hidden rounded-xl border transition-all shadow-sm chat-code-block -mx-0.5 sm:mx-0 ${
        isLight
          ? 'border-[#E7B8CF] bg-[#FAF8FB] shadow-[0_2px_12px_rgba(38,24,39,0.04)]'
          : 'border-pink-500/20 bg-[#08020D]'
      }`}
    >
      {/* CODE BLOCK HEADER */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b transition-colors chat-code-header ${
          isLight
            ? 'border-[#E7B8CF] bg-[#F4DCE9] text-[#261827]'
            : 'border-pink-500/20 bg-[#16091F] text-pink-200'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Terminal size={13} className={`shrink-0 ${isLight ? 'text-[#B31372]' : 'text-pink-400'}`} />
          <span className="text-[11.5px] sm:text-xs font-mono font-medium lowercase tracking-wide text-[#261827] dark:text-pink-200 truncate">
            {language || 'code'}
          </span>
          <span className={`text-[10px] sm:text-[10.5px] font-mono hidden sm:inline ${isLight ? 'text-[#6E6072]' : 'text-pink-300/60'}`}>
            ({linesCount} {linesCount === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {isLong && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs transition cursor-pointer active:scale-95 ${
                isLight
                  ? 'text-[#6E6072] hover:text-[#261827] hover:bg-[#E7B8CF]/40'
                  : 'text-slate-300 hover:text-white hover:bg-pink-500/20'
              }`}
              title={isCollapsed ? 'Expand code' : 'Collapse code'}
            >
              {isCollapsed ? (
                <ChevronDown size={12} className={isLight ? 'text-[#B31372]' : 'text-pink-300'} />
              ) : (
                <ChevronUp size={12} className={isLight ? 'text-[#B31372]' : 'text-pink-300'} />
              )}
              <span className="text-[10.5px] sm:text-[11px] font-medium hidden xs:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs transition cursor-pointer active:scale-95 ${
              isLight
                ? 'text-[#6E6072] hover:text-[#261827] hover:bg-[#E7B8CF]/40'
                : 'text-slate-300 hover:text-white hover:bg-pink-500/20'
            }`}
            title="Download code file"
          >
            <Download size={12} className={isLight ? 'text-[#B31372]' : 'text-pink-400'} />
            <span className="text-[11px] hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-md border px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs transition cursor-pointer active:scale-95 chat-code-copy-btn ${
              isLight
                ? 'border-[#E7B8CF] bg-[#FFFFFF] text-[#261827] hover:bg-[#F4DCE9] hover:border-[#B31372]/40 shadow-xs'
                : 'border-pink-500/30 bg-[#220B30] text-pink-200 hover:bg-[#2D0F40] hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500 font-bold" />
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10.5px] sm:text-[11px] font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CODE CONTENT WITH DYNAMIC PRISM HIGHLIGHTING */}
      {!isCollapsed && (
        <div className="overflow-x-auto touch-pan-x">
          <SyntaxHighlighter
            language={language || 'typescript'}
            style={isLight ? oneLight : oneDark}
            showLineNumbers
            wrapLongLines
            customStyle={{
              margin: 0,
              padding: '12px 14px',
              background: isLight ? '#FAF8FB' : '#08020D',
              fontSize: '12.5px',
              lineHeight: '1.6',
              borderRadius: 0,
              maxWidth: '100%',
              overflowX: 'auto',
            }}
            lineNumberStyle={{
              color: isLight ? '#9E8D9F' : '#6A436D',
              minWidth: '1.8em',
              paddingRight: '0.75em',
              fontSize: '11px',
            }}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      )}

      {/* CONTEXTUAL QUICK ACTIONS TOOLBAR */}
      {onCodeAction && !isCollapsed && (
        <div
          className={`chat-code-actions-toolbar flex items-center gap-1.5 px-3 py-1.5 border-t transition-colors overflow-x-auto no-scrollbar touch-pan-x ${
            isLight
              ? 'border-[#E7B8CF] bg-[#F4DCE9]'
              : 'border-pink-500/20 bg-[#110419]'
          }`}
        >
          <span
            className={`text-[9.5px] sm:text-[10px] uppercase font-mono mr-0.5 flex items-center gap-1 font-semibold shrink-0 ${
              isLight ? 'text-[#B31372]' : 'text-pink-300/80'
            }`}
          >
            <Sparkles size={11} className={isLight ? 'text-[#B31372]' : 'text-pink-400'} /> Action:
          </span>

          <button
            onClick={() =>
              onCodeAction(
                `Explain the architecture, logic, and step-by-step functionality of this code:\n\`\`\`${language}\n${value}\n\`\`\``
              )
            }
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10.5px] sm:text-[11px] font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#F4DCE9] border-[#E7B8CF] text-[#261827] shadow-xs'
                : 'bg-[#220B30] hover:bg-[#2D0F40] border-pink-500/30 text-pink-200'
            }`}
          >
            Explain Logic
          </button>

          <button
            onClick={() =>
              onCodeAction(
                `Analyze this code for potential edge cases, memory leaks, bugs, or performance bottlenecks, and fix them:\n\`\`\`${language}\n${value}\n\`\`\``
              )
            }
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10.5px] sm:text-[11px] font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#F4DCE9] border-[#E7B8CF] text-[#261827] shadow-xs'
                : 'bg-[#220B30] hover:bg-[#2D0F40] border-pink-500/30 text-pink-200'
            }`}
          >
            Fix & Optimize
          </button>

          <button
            onClick={() =>
              onCodeAction(
                `Write comprehensive unit tests with edge cases for this code:\n\`\`\`${language}\n${value}\n\`\`\``
              )
            }
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10.5px] sm:text-[11px] font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#F4DCE9] border-[#E7B8CF] text-[#261827] shadow-xs'
                : 'bg-[#220B30] hover:bg-[#2D0F40] border-pink-500/30 text-pink-200'
            }`}
          >
            Add Tests
          </button>
        </div>
      )}
    </div>
  );
}