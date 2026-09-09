'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Code, Check, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getRelativeTime, getFullTimestamp } from '@/lib/formatTimestamp';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  modelId?: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Msg[];
  createdAt?: number;
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat?: Chat;
  messages?: Msg[];
  chatTitle?: string;
}

export default function ExportModal({ isOpen, onClose, chat, messages, chatTitle }: ExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'txt' | 'pdf'>('markdown');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const currentTitle = chat?.title || chatTitle || 'Nyra Conversation';
  const currentMessages = chat?.messages || messages || [];
  const [fileName, setFileName] = useState(`nyra-chat-${currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const generateMarkdownContent = () => {
    let output = '';

    if (includeSystemInfo) {
      output += `# ${currentTitle}\n\n`;
      output += `> **Exported from Nyra AI** • ${new Date().toLocaleString()}\n\n`;
      output += `---\n\n`;
    }

    currentMessages.forEach((msg) => {
      const timeStr = includeTimestamps && msg.timestamp ? ` (${new Date(msg.timestamp).toLocaleTimeString()})` : '';
      const roleStr = msg.role === 'user' ? '👤 **User**' : `✦ **Nyra AI**${msg.modelId ? ` (${msg.modelId})` : ''}`;

      output += `### ${roleStr}${timeStr}\n\n${msg.content}\n\n---\n\n`;
    });

    return output;
  };

  const generateTxtContent = () => {
    let output = '';

    if (includeSystemInfo) {
      output += `NYRA AI CONVERSATION\n`;
      output += `Title: ${currentTitle}\n`;
      output += `Date: ${new Date().toLocaleString()}\n`;
      output += `==================================================\n\n`;
    }

    currentMessages.forEach((msg) => {
      const timeStr = includeTimestamps && msg.timestamp ? ` [${new Date(msg.timestamp).toLocaleTimeString()}]` : '';
      const roleStr = msg.role === 'user' ? 'USER' : 'NYRA AI';

      output += `${roleStr}${timeStr}:\n${msg.content}\n\n--------------------------------------------------\n\n`;
    });

    return output;
  };

  const handleExport = () => {
    const cleanFileName = fileName.trim() || `nyra-chat-${Date.now()}`;

    if (format === 'markdown') {
      const content = generateMarkdownContent();
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanFileName}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'txt') {
      const content = generateTxtContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanFileName}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Create high-fidelity print window styled for PDF conversion
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>${currentTitle}</title>
              <style>
                @page { margin: 20mm; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  color: #0f172a;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 24px;
                  line-height: 1.6;
                }
                .header {
                  border-bottom: 2px solid #0284c7;
                  padding-bottom: 16px;
                  margin-bottom: 24px;
                }
                h1 {
                  font-size: 24px;
                  color: #0369a1;
                  margin: 0 0 8px 0;
                }
                .meta-header {
                  font-size: 12px;
                  color: #64748b;
                  font-family: monospace;
                }
                .msg {
                  margin-bottom: 20px;
                  padding: 16px;
                  border-radius: 12px;
                  page-break-inside: avoid;
                }
                .msg.user {
                  background: #f0fdf4;
                  border: 1px solid #bbf7d0;
                  border-left: 4px solid #16a34a;
                }
                .msg.assistant {
                  background: #f0f9ff;
                  border: 1px solid #bae6fd;
                  border-left: 4px solid #0284c7;
                }
                .sender {
                  font-size: 12px;
                  font-weight: 700;
                  color: #0369a1;
                  margin-bottom: 6px;
                  display: flex;
                  justify-content: space-between;
                }
                .msg.user .sender { color: #15803d; }
                .content {
                  font-size: 13.5px;
                  color: #1e293b;
                  white-space: pre-wrap;
                  word-break: break-word;
                }
                pre {
                  background: #091733;
                  color: #f8fafc;
                  padding: 12px;
                  border-radius: 8px;
                  overflow-x: auto;
                  font-size: 12px;
                }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${currentTitle}</h1>
                <div class="meta-header">
                  ✦ Exported from Nyra AI &bull; ${new Date().toLocaleString()} &bull; ${currentMessages.length} Messages
                </div>
              </div>
              <div class="messages">
                ${currentMessages
                  .map(
                    (m) => `
                  <div class="msg ${m.role}">
                    <div class="sender">
                      <span>${m.role === 'user' ? '👤 User' : '✦ Nyra AI' + (m.modelId ? ` (${m.modelId})` : '')}</span>
                      ${includeTimestamps && m.timestamp ? `<span>${new Date(m.timestamp).toLocaleTimeString()}</span>` : ''}
                    </div>
                    <div class="content">${m.content
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/\n/g, '<br/>')}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 350);
      }
    }

    addToast({
      type: 'success',
      title: 'Export Generated',
      description: `Exported conversation as .${format.toUpperCase()}`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg max-h-[88dvh] rounded-3xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24]/98 text-[#292633] dark:text-white p-4 sm:p-6 shadow-2xl overflow-y-auto relative backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3 sm:pb-4 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/30 flex items-center justify-center text-[#8B6FC9] dark:text-purple-400">
                <Download size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#292633] dark:text-white">Export Conversation</h3>
                <p className="text-[11px] sm:text-xs text-[#686477] dark:text-slate-400">Save for offline documentation or sharing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 text-[#686477] hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
              aria-label="Close export modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* Format Selection Cards */}
            <div>
              <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">Export Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 'markdown', label: 'Markdown', icon: <Code size={16} />, desc: '.md document' },
                  { id: 'txt', label: 'Plain Text', icon: <FileText size={16} />, desc: '.txt raw file' },
                  { id: 'pdf', label: 'PDF Document', icon: <Sparkles size={16} />, desc: '.pdf printable' },
                ].map((item) => {
                  const active = format === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setFormat(item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-[#EEE8FA] dark:bg-purple-500/20 border-[#8B6FC9] dark:border-purple-400/50 text-[#8B6FC9] dark:text-purple-200 shadow-sm'
                          : 'bg-[#F5F3F9] dark:bg-white/[0.03] border-[#E8E4EF] dark:border-white/10 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="text-xs font-semibold text-[#292633] dark:text-white">{item.label}</span>
                      <span className="text-[10px] text-[#686477] dark:text-slate-400">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block">Filename</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/40 text-xs text-[#292633] dark:text-white outline-none focus:border-[#8B6FC9] transition"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#292633] dark:text-slate-300">Include Timestamps</span>
                <button
                  type="button"
                  onClick={() => setIncludeTimestamps(!includeTimestamps)}
                  className={`w-10 h-5 rounded-full transition relative cursor-pointer ${includeTimestamps ? 'bg-[#8B6FC9]' : 'bg-[#E8E4EF] dark:bg-slate-700'}`}
                  aria-label="Toggle include timestamps"
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${includeTimestamps ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#292633] dark:text-slate-300">Include Header Metadata</span>
                <button
                  type="button"
                  onClick={() => setIncludeSystemInfo(!includeSystemInfo)}
                  className={`w-10 h-5 rounded-full transition relative cursor-pointer ${includeSystemInfo ? 'bg-[#8B6FC9]' : 'bg-[#E8E4EF] dark:bg-slate-700'}`}
                  aria-label="Toggle include header metadata"
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${includeSystemInfo ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Export Action */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E4EF] dark:border-purple-400/15">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-5 py-2.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold shadow-md shadow-[#8B6FC9]/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                <span>Export Now</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
