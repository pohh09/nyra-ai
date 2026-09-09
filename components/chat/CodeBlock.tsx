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
      className={`relative my-4 w-full max-w-full overflow-hidden rounded-xl border transition-all shadow-sm chat-code-block ${
        isLight
          ? 'border-[#E8E4EF] bg-[#F8F7FB] shadow-[0_2px_12px_rgba(41,38,51,0.03)]'
          : 'border-purple-400/20 bg-[#0c0918]'
      }`}
    >
      {/* CODE BLOCK HEADER */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b transition-colors chat-code-header ${
          isLight
            ? 'border-[#E8E4EF] bg-[#F5F3F9] text-[#292633]'
            : 'border-purple-400/20 bg-[#19122c] text-purple-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} className={isLight ? 'text-[#8B6FC9]' : 'text-purple-400'} />
          <span className="text-xs font-mono font-medium lowercase tracking-wide text-[#292633] dark:text-purple-200">
            {language || 'code'}
          </span>
          <span className={`text-[10.5px] font-mono hidden sm:inline ${isLight ? 'text-[#92909B]' : 'text-slate-400'}`}>
            ({linesCount} {linesCount === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isLong && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                isLight
                  ? 'text-[#686477] hover:text-[#292633] hover:bg-[#EEE8FA]'
                  : 'text-slate-300 hover:text-white hover:bg-purple-500/20'
              }`}
              title={isCollapsed ? 'Expand code' : 'Collapse code'}
            >
              {isCollapsed ? (
                <ChevronDown size={13} className={isLight ? 'text-[#8B6FC9]' : 'text-purple-300'} />
              ) : (
                <ChevronUp size={13} className={isLight ? 'text-[#8B6FC9]' : 'text-purple-300'} />
              )}
              <span className="text-[11px] font-medium">{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
              isLight
                ? 'text-[#686477] hover:text-[#292633] hover:bg-[#EEE8FA]'
                : 'text-slate-300 hover:text-white hover:bg-purple-500/20'
            }`}
            title="Download code file"
          >
            <Download size={13} className={isLight ? 'text-[#8B6FC9]' : 'text-purple-400'} />
            <span className="text-[11px] hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition cursor-pointer chat-code-copy-btn ${
              isLight
                ? 'border-[#E8E4EF] bg-[#FFFFFF] text-[#292633] hover:bg-[#EEE8FA] hover:border-[#8B6FC9]/40 shadow-xs'
                : 'border-purple-500/30 bg-[#241a42] text-purple-200 hover:bg-[#33245d] hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check size={13} className="text-[#6FA58A] font-bold" />
                <span className="text-[11px] font-semibold text-[#6FA58A]">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="text-[11px] font-medium">Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CODE CONTENT WITH DYNAMIC PRISM HIGHLIGHTING */}
      {!isCollapsed && (
        <SyntaxHighlighter
          language={language || 'typescript'}
          style={isLight ? oneLight : oneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{
            margin: 0,
            padding: '14px 18px',
            background: isLight ? '#F8F7FB' : '#0c0918',
            fontSize: '13px',
            lineHeight: '1.65',
            borderRadius: 0,
            maxWidth: '100%',
            overflowX: 'auto',
          }}
          lineNumberStyle={{
            color: isLight ? '#92909B' : '#5c5275',
            minWidth: '2.2em',
            paddingRight: '1em',
          }}
        >
          {value}
        </SyntaxHighlighter>
      )}

      {/* CONTEXTUAL QUICK ACTIONS TOOLBAR */}
      {onCodeAction && !isCollapsed && (
        <div
          className={`chat-code-actions-toolbar flex flex-wrap items-center gap-1.5 px-3.5 py-2 border-t transition-colors ${
            isLight
              ? 'border-[#E8E4EF] bg-[#F5F3F9]'
              : 'border-purple-500/20 bg-[#140e24]'
          }`}
        >
          <span
            className={`text-[10px] uppercase font-mono mr-1 flex items-center gap-1 font-semibold ${
              isLight ? 'text-[#8B6FC9]' : 'text-purple-300/80'
            }`}
          >
            <Sparkles size={11} className={isLight ? 'text-[#8B6FC9]' : 'text-purple-400'} /> Action:
          </span>

          <button
            onClick={() =>
              onCodeAction(
                `Explain the architecture, logic, and step-by-step functionality of this code:\n\`\`\`${language}\n${value}\n\`\`\``
              )
            }
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#EEE8FA] border-[#E8E4EF] text-[#292633] shadow-xs'
                : 'bg-[#241a42] hover:bg-[#33245d] border-purple-500/30 text-purple-200'
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
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#EEE8FA] border-[#E8E4EF] text-[#292633] shadow-xs'
                : 'bg-[#241a42] hover:bg-[#33245d] border-purple-500/30 text-purple-200'
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
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              isLight
                ? 'bg-[#FFFFFF] hover:bg-[#EEE8FA] border-[#E8E4EF] text-[#292633] shadow-xs'
                : 'bg-[#241a42] hover:bg-[#33245d] border-purple-500/30 text-purple-200'
            }`}
          >
            Add Tests
          </button>
        </div>
      )}
    </div>
  );
}