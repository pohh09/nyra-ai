'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Palette,
  Bot,
  Trash2,
  Keyboard,
  Brain,
  Info,
  X,
  Check,
  Sparkles,
  Type,
  Sun,
  Moon,
  Monitor,
  Shield,
  Volume2,
  Mic,
  Cpu,
  Download,
  LogOut,
  User,
  Activity,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { USER_FACING_MODELS, getModelConfig } from '@/lib/models';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { DailyUsageStats, Chat, PromptItem } from '@/lib/types';
import { loadChats, loadCustomPrompts } from '@/lib/storage';
import { applyTheme } from '@/lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (id: string) => void;
  accentColor: string;
  onChangeAccent: (color: string) => void;
  fontSize: 'small' | 'normal' | 'large';
  onChangeFontSize: (size: 'small' | 'normal' | 'large') => void;
  onClearHistory: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  accentColor,
  onChangeAccent,
  fontSize,
  onChangeFontSize,
  onClearHistory,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'models' | 'usage' | 'voice' | 'data' | 'shortcuts' | 'account' | 'about'
  >('appearance');
  const [confirmClear, setConfirmClear] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [isMac, setIsMac] = useState(false);

  // Voice state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voiceRate, setVoiceRate] = useState<number>(1);
  const [speechRecSupported, setSpeechRecSupported] = useState(false);

  // Usage stats state
  const [usageStats, setUsageStats] = useState<DailyUsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const { user, profile, preferences, updatePreferences, signOut } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

      const savedTheme = (localStorage.getItem('theme') as any) || preferences?.theme || 'dark';
      setThemeMode(savedTheme);

      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechRecSupported(Boolean(SpeechRec));

      if ('speechSynthesis' in window) {
        const updateVoices = () => {
          const avail = window.speechSynthesis.getVoices();
          setVoices(avail);
          const saved = localStorage.getItem('nyra_selected_voice') || preferences?.voiceName;
          if (saved) setSelectedVoice(saved);
          else if (avail.length > 0) setSelectedVoice(avail[0].name);
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      const savedRate = localStorage.getItem('nyra_voice_rate');
      if (savedRate) {
        const parsed = parseFloat(savedRate);
        if (!isNaN(parsed)) setVoiceRate(parsed);
      }
    }
  }, [preferences, isOpen]);

  // Fetch usage stats when modal is opened
  useEffect(() => {
    if (isOpen) {
      setLoadingUsage(true);
      fetch('/api/usage')
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setUsageStats(data);
          }
        })
        .catch((e) => console.warn('Failed to load usage stats:', e))
        .finally(() => setLoadingUsage(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ACCENT_COLORS = [
    { id: 'purple', name: 'Purple Matte', bg: 'bg-purple-500', border: 'border-purple-400' },
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-400' },
    { id: 'blue', name: 'Blue', bg: 'bg-blue-500', border: 'border-blue-400' },
    { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-500', border: 'border-sky-400' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', border: 'border-emerald-400' },
    { id: 'rose', name: 'Rose', bg: 'bg-rose-500', border: 'border-rose-400' },
  ];

  const modKey = isMac ? '⌘' : 'Ctrl';

  const SHORTCUTS = [
    { key: `${modKey} + N`, desc: 'Start a new conversation' },
    { key: `${modKey} + B`, desc: 'Toggle desktop sidebar' },
    { key: `${modKey} + K`, desc: 'Open Settings & Preferences' },
    { key: `${modKey} + F`, desc: 'Search messages inside active chat' },
    { key: `${modKey} + Shift + P`, desc: 'Open Prompt Library' },
    { key: 'Enter', desc: 'Send prompt to AI' },
    { key: 'Shift + Enter', desc: 'Insert new line in input' },
    { key: 'Esc', desc: 'Close modals / Stop generation' },
  ];

  const handleExportData = () => {
    try {
      const chats = loadChats();
      const prompts = loadCustomPrompts();
      const bookmarks = localStorage.getItem('nyra_bookmarked_ids')
        ? JSON.parse(localStorage.getItem('nyra_bookmarked_ids') || '[]')
        : [];

      // Clean payload omitting any API keys, tokens, or private secrets
      const exportPayload = {
        app: 'Nyra AI Workspace',
        version: '2.5.0 Pro',
        exportedAt: new Date().toISOString(),
        user: user ? { id: user.id, email: user.email, profile } : { mode: 'guest' },
        preferences: {
          theme: themeMode,
          accentColor,
          fontSize,
          defaultModel: selectedModel,
          voice: selectedVoice,
          voiceRate,
        },
        conversations: chats,
        savedPrompts: prompts,
        bookmarks,
        usageSummary: usageStats || undefined,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `nyra-data-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ type: 'success', title: 'Data export downloaded safely' });
    } catch (err) {
      console.error('Export error:', err);
      addToast({ type: 'error', title: 'Failed to export application data' });
    }
  };

  const handleResetSettings = () => {
    setThemeMode('dark');
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');

    onChangeAccent('purple');
    localStorage.setItem('nyra_accent', 'purple');
    document.documentElement.setAttribute('data-accent', 'purple');

    onChangeFontSize('normal');
    localStorage.setItem('nyra_font_size', 'normal');

    onSelectModel('qwen/qwen3.6-27b');
    localStorage.setItem('nyra_selected_model', 'qwen/qwen3.6-27b');

    updatePreferences({
      theme: 'dark',
      accentColor: 'purple',
      fontSize: 'normal',
      defaultModel: 'qwen/qwen3.6-27b',
    });

    addToast({ type: 'info', title: 'Settings reset to default values' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-3xl h-[88dvh] max-h-[88dvh] rounded-3xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24] text-[#292633] dark:text-white shadow-2xl flex flex-col md:flex-row overflow-hidden relative backdrop-blur-2xl"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 bg-[#F5F3F9] dark:bg-[#07050d] border-b md:border-b-0 md:border-r border-[#E8E4EF] dark:border-purple-400/15 p-2 sm:p-4 shrink-0 flex flex-row md:flex-col justify-between overflow-x-auto">
            <div className="space-y-1 w-full flex md:flex-col gap-1 overflow-x-auto no-scrollbar py-1 md:py-0">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#292633] dark:text-white mb-2">
                <Settings className="w-4 h-4 text-[#8B6FC9] dark:text-purple-400" />
                <span>Settings</span>
              </div>

              {[
                { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
                { id: 'models', label: 'AI Models', icon: <Bot size={15} /> },
                { id: 'usage', label: 'Usage & Limits', icon: <Activity size={15} /> },
                { id: 'voice', label: 'Voice & Speech', icon: <Volume2 size={15} /> },
                { id: 'data', label: 'Data & Privacy', icon: <Trash2 size={15} /> },
                { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={15} /> },
                { id: 'account', label: 'Account', icon: <User size={15} /> },
                { id: 'about', label: 'About Nyra', icon: <Info size={15} /> },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 md:shrink md:w-full ${
                      active
                        ? 'bg-[#EEE8FA] dark:bg-purple-500/20 border border-[#8B6FC9]/40 dark:border-purple-400/40 text-[#8B6FC9] dark:text-purple-200 shadow-sm'
                        : 'text-[#686477] hover:text-[#292633] hover:bg-[#EEE8FA]/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab.icon}
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-[#E8E4EF] dark:border-purple-400/15 text-[11px] text-[#92909B] dark:text-slate-500">
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-1.5 text-[11px] text-[#686477] hover:text-[#8B6FC9] dark:text-slate-400 dark:hover:text-purple-300 transition cursor-pointer"
                title="Reset all settings to defaults"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>
              <span>Nyra AI v2.5.0 Pro</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3 mb-5">
                <h3 className="text-base font-bold capitalize text-[#292633] dark:text-white">
                  {activeTab === 'voice'
                    ? 'Voice & Speech'
                    : activeTab === 'usage'
                    ? 'Usage & Daily Allowance'
                    : activeTab === 'models'
                    ? 'AI Foundation Models'
                    : `${activeTab} Settings`}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-white/10 text-[#686477] hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
                  aria-label="Close settings"
                >
                  <X size={18} />
                </button>
              </div>

              {/* APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Theme Mode */}
                  <div>
                    <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">Theme Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark Mode', icon: <Moon size={15} /> },
                        { id: 'light', label: 'Light Mode', icon: <Sun size={15} /> },
                        { id: 'system', label: 'System Default', icon: <Monitor size={15} /> },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setThemeMode(t.id as any);
                            applyTheme(t.id as any);
                            updatePreferences({ theme: t.id as any });
                            addToast({ type: 'info', title: `Theme set to ${t.label}` });
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition cursor-pointer ${
                            themeMode === t.id
                              ? 'bg-[#EEE8FA] dark:bg-purple-500/20 border-[#8B6FC9] dark:border-purple-400/50 text-[#8B6FC9] dark:text-purple-200 shadow-sm'
                              : 'bg-[#F5F3F9] dark:bg-white/[0.03] border-[#E8E4EF] dark:border-white/10 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">Accent Color</label>
                    <div className="grid grid-cols-6 gap-2.5">
                      {ACCENT_COLORS.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => {
                            onChangeAccent(col.id);
                            localStorage.setItem('nyra_accent', col.id);
                            document.documentElement.setAttribute('data-accent', col.id);
                            updatePreferences({ accentColor: col.id });
                            addToast({ type: 'success', title: `Accent updated to ${col.name}` });
                          }}
                          className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${col.bg} ${
                            accentColor === col.id ? 'ring-2 ring-[#8B6FC9] dark:ring-white scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={col.name}
                          aria-label={`Select ${col.name} accent`}
                        >
                          {accentColor === col.id && <Check size={16} className="text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">Chat Font Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'small', label: 'Small (13.5px)' },
                        { id: 'normal', label: 'Normal (15px)' },
                        { id: 'large', label: 'Large (16.5px)' },
                      ].map((fs) => (
                        <button
                          key={fs.id}
                          onClick={() => {
                            onChangeFontSize(fs.id as any);
                            localStorage.setItem('nyra_font_size', fs.id);
                            document.documentElement.setAttribute('data-font-size', fs.id);
                            updatePreferences({ fontSize: fs.id as any });
                            addToast({ type: 'info', title: `Font size set to ${fs.label}` });
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            fontSize === fs.id
                              ? 'bg-[#EEE8FA] dark:bg-purple-500/20 border-[#8B6FC9] dark:border-purple-400/50 text-[#8B6FC9] dark:text-purple-200 shadow-sm'
                              : 'bg-[#F5F3F9] dark:bg-white/[0.03] border-[#E8E4EF] dark:border-white/10 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          {fs.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI MODELS */}
              {activeTab === 'models' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#686477] dark:text-slate-400 mb-3">
                    Choose the default AI foundation model. This model will be pre-selected for all new conversations.
                  </p>
                  {USER_FACING_MODELS.map((model) => {
                    const active = selectedModel === model.id;
                    const isAvailable = model.available;
                    return (
                      <div
                        key={model.id}
                        onClick={() => {
                          if (isAvailable) {
                            onSelectModel(model.id);
                            localStorage.setItem('nyra_selected_model', model.id);
                            updatePreferences({ defaultModel: model.id });
                            addToast({ type: 'success', title: `Default model: ${model.name}` });
                          } else {
                            addToast({ type: 'info', title: `${model.name} is coming soon.` });
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          active
                            ? 'bg-[#EEE8FA] dark:bg-purple-500/15 border-[#8B6FC9]/60 dark:border-purple-400/40 shadow-sm'
                            : isAvailable
                            ? 'bg-[#F5F3F9] dark:bg-white/[0.03] border-[#E8E4EF] dark:border-white/10 hover:bg-[#EEE8FA]/40 dark:hover:bg-white/[0.06] cursor-pointer'
                            : 'opacity-50 bg-[#F5F3F9]/40 dark:bg-white/[0.01] border-[#E8E4EF]/40 dark:border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-purple-500/10 border border-[#E8E4EF] dark:border-purple-400/20 text-[#8B6FC9] dark:text-purple-400">
                            <Cpu size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-[#292633] dark:text-white">{model.name}</h4>
                              {model.badge && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                    isAvailable
                                      ? model.badgeColor || 'bg-[#EEE8FA] dark:bg-purple-950/80 text-[#8B6FC9] dark:text-purple-300 border-[#E8E4EF] dark:border-purple-700/50'
                                      : 'bg-zinc-100 dark:bg-slate-900 text-zinc-500 dark:text-slate-400 border-zinc-200 dark:border-slate-700/40'
                                  }`}
                                >
                                  {model.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#686477] dark:text-slate-400 mt-0.5">{model.description}</p>
                            {model.modelInfo && (
                              <p className="text-[10px] text-[#8B6FC9] dark:text-purple-400/80 font-mono mt-0.5">
                                Engine: {model.modelInfo}
                              </p>
                            )}
                          </div>
                        </div>
                        {active && <Check size={16} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* USAGE & LIMITS */}
              {activeTab === 'usage' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#292633] dark:text-white">Daily Plan: Free Workspace</h4>
                      <p className="text-[11px] text-[#686477] dark:text-slate-400 mt-0.5">Allowance resets every day at 00:00 UTC</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 text-xs font-mono font-bold border border-[#E8E4EF] dark:border-purple-400/30">
                      Active
                    </span>
                  </div>

                  {usageStats ? (
                    <div className="space-y-3">
                      <UsageMeter
                        title="AI Generation Requests"
                        used={usageStats.aiRequests.used}
                        limit={usageStats.aiRequests.limit}
                      />
                      <UsageMeter
                        title="Live Web Searches"
                        used={usageStats.webSearches.used}
                        limit={usageStats.webSearches.limit}
                      />
                      <UsageMeter
                        title="Multimodal Vision Images"
                        used={usageStats.imageRequests.used}
                        limit={usageStats.imageRequests.limit}
                      />
                      <UsageMeter
                        title="PDF Document Analyses"
                        used={usageStats.pdfRequests.used}
                        limit={usageStats.pdfRequests.limit}
                      />
                    </div>
                  ) : loadingUsage ? (
                    <div className="py-8 text-center text-xs text-zinc-400 animate-pulse">
                      Loading usage metrics...
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-[#686477] dark:text-slate-400">
                      Usage tracking is active.
                    </div>
                  )}
                </div>
              )}

              {/* VOICE & SPEECH SETTINGS */}
              {activeTab === 'voice' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl border border-[#E8E4EF] dark:border-white/10 bg-[#F5F3F9] dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic size={14} className="text-[#8B6FC9] dark:text-purple-400" />
                        <h4 className="text-xs font-bold text-[#292633] dark:text-white">Speech-to-Text Input</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] mt-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            speechRecSupported ? 'bg-[#6FA58A] dark:bg-emerald-400 animate-pulse' : 'bg-[#C49A5A] dark:bg-amber-400'
                          }`}
                        />
                        <span className="text-[#686477] dark:text-slate-300">
                          {speechRecSupported
                            ? 'Supported in this browser'
                            : 'Unavailable in this browser'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#E8E4EF] dark:border-white/10 bg-[#F5F3F9] dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-1">
                        <Volume2 size={14} className="text-[#8B6FC9] dark:text-purple-400" />
                        <h4 className="text-xs font-bold text-[#292633] dark:text-white">Read Aloud (TTS)</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] mt-1">
                        <span className="h-2 w-2 rounded-full bg-[#6FA58A] dark:bg-emerald-400 animate-pulse" />
                        <span className="text-[#686477] dark:text-slate-300">
                          SpeechSynthesis Active ({voices.length} voices)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">
                      Assistant Voice
                    </label>
                    {voices.length > 0 ? (
                      <select
                        value={selectedVoice}
                        onChange={(e) => {
                          setSelectedVoice(e.target.value);
                          localStorage.setItem('nyra_selected_voice', e.target.value);
                          updatePreferences({ voiceName: e.target.value });
                          addToast({ type: 'success', title: `Voice changed` });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-[#0a1835] text-xs text-[#292633] dark:text-white outline-none focus:border-[#8B6FC9] transition cursor-pointer"
                      >
                        {voices.map((v) => (
                          <option key={v.name} value={v.name} className="bg-white dark:bg-[#0a1835] text-[#292633] dark:text-white">
                            {v.name} ({v.lang}) {v.default ? '• Default' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-[#686477] dark:text-slate-400 p-2.5 rounded-xl bg-[#F5F3F9] dark:bg-white/[0.02] border border-[#E8E4EF] dark:border-white/10">
                        Default browser speech synthesis voice active
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#292633] dark:text-slate-300 block mb-2">
                      Playback Speed
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {[0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => {
                        const active = voiceRate === r;
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              setVoiceRate(r);
                              localStorage.setItem('nyra_voice_rate', r.toString());
                              updatePreferences({ voiceRate: r });
                              addToast({ type: 'info', title: `Speech rate: ${r}x` });
                            }}
                            className={`py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                              active
                                ? 'bg-[#EEE8FA] dark:bg-purple-500/20 border-[#8B6FC9] dark:border-purple-400/40 text-[#8B6FC9] dark:text-purple-200 shadow-sm'
                                : 'bg-[#F5F3F9] dark:bg-white/[0.03] border-[#E8E4EF] dark:border-white/10 text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            {r}x
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* DATA & PRIVACY */}
              {activeTab === 'data' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/20 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain size={14} className="text-[#8B6FC9] dark:text-purple-300" />
                        <h4 className="text-xs font-bold text-[#292633] dark:text-white">AI Memory</h4>
                      </div>
                      <p className="text-xs text-[#686477] dark:text-slate-400 leading-relaxed">
                        NYRA remembers useful information you share to provide more personalized help in future conversations.
                      </p>
                    </div>
                    <Link
                      href="/memory"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-[#EEE8FA] hover:bg-[#E8E4EF] dark:bg-purple-500/20 dark:hover:bg-purple-500/30 border border-[#E8E4EF] dark:border-purple-400/30 text-[#8B6FC9] dark:text-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm"
                    >
                      <span>Manage</span>
                    </Link>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/20 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#292633] dark:text-white mb-1">Export All Workspace Data</h4>
                      <p className="text-xs text-[#686477] dark:text-slate-400 leading-relaxed">
                        Download a complete JSON export of your conversations, saved prompts, bookmarks, and personal preferences.
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-3.5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] dark:bg-purple-500/20 dark:hover:bg-purple-500/30 border border-[#8B6FC9] dark:border-purple-400/30 text-white dark:text-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm active:scale-95"
                    >
                      <Download size={13} />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#C77B7B]/30 dark:border-rose-500/25 bg-[#F9ECEC] dark:bg-rose-500/5 space-y-3">
                    <h4 className="text-xs font-bold text-[#A85A5A] dark:text-rose-300">Clear All Chat History</h4>
                    <p className="text-xs text-[#686477] dark:text-slate-400">
                      Permanently erase all your saved conversations and messages. Saved prompts and preferences will remain intact.
                    </p>

                    {confirmClear ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            onClearHistory();
                            setConfirmClear(false);
                            addToast({ type: 'success', title: 'Chat History Cleared' });
                          }}
                          className="px-4 py-2 rounded-xl bg-[#C77B7B] hover:bg-[#A85A5A] text-white text-xs font-semibold cursor-pointer shadow-md"
                        >
                          Yes, Delete Everything
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="px-4 py-2 rounded-xl bg-[#E8E4EF] dark:bg-white/10 text-xs text-[#292633] dark:text-slate-300 hover:text-[#292633] dark:hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F9ECEC] dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-[#C77B7B]/30 dark:border-rose-500/40 text-[#A85A5A] dark:text-rose-300 text-xs font-semibold transition cursor-pointer"
                      >
                        Clear All History
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* KEYBOARD SHORTCUTS */}
              {activeTab === 'shortcuts' && (
                <div className="space-y-2">
                  {SHORTCUTS.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E8E4EF] dark:border-purple-400/15 bg-[#F5F3F9] dark:bg-purple-950/20"
                    >
                      <span className="text-xs text-[#292633] dark:text-slate-200">{s.desc}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] dark:bg-purple-950/80 border border-[#E8E4EF] dark:border-purple-400/30 text-[11px] font-mono text-[#8B6FC9] dark:text-purple-300 font-semibold shadow-inner">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}

              {/* ACCOUNT SECTION */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-purple-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B6FC9] to-[#795BB8] flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#292633] dark:text-white">
                          {profile?.displayName || user?.email || 'Guest User'}
                        </h4>
                        <p className="text-[11px] text-[#686477] dark:text-slate-400">{user?.email || 'Local Storage Session'}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        user
                          ? 'bg-[#EBF4F0] dark:bg-emerald-500/20 text-[#55856E] dark:text-emerald-300 border-[#6FA58A]/30 dark:border-emerald-400/30'
                          : 'bg-[#F9F4EB] dark:bg-amber-500/20 text-[#9C773E] dark:text-amber-300 border-[#C49A5A]/30 dark:border-amber-400/30'
                      }`}
                    >
                      {user ? 'Cloud Synced' : 'Guest Mode'}
                    </span>
                  </div>

                  {user ? (
                    <button
                      onClick={async () => {
                        await signOut();
                        addToast({ type: 'info', title: 'Signed out of Nyra AI' });
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl border border-[#C77B7B]/30 dark:border-rose-500/30 bg-[#F9ECEC] hover:bg-[#F9ECEC]/80 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-[#A85A5A] dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <a
                      href="/login"
                      className="w-full py-2.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-[#8B6FC9]/20"
                    >
                      <span>Sign In with Account</span>
                    </a>
                  )}
                </div>
              )}

              {/* ABOUT NYRA */}
              {activeTab === 'about' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#8B6FC9] dark:bg-gradient-to-br dark:from-purple-600 dark:to-indigo-500 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-xl shadow-[#8B6FC9]/20">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#292633] dark:text-white">Nyra AI Assistant</h3>
                    <p className="text-xs text-[#686477] dark:text-slate-400 mt-1">
                      Next-Generation Intelligent Workspace & Multimodal Reasoning UI
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-[#686477] dark:text-slate-300 pt-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#F5F3F9] dark:bg-purple-950/60 border border-[#E8E4EF] dark:border-purple-400/25">Next.js 16</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F5F3F9] dark:bg-purple-950/60 border border-[#E8E4EF] dark:border-purple-400/25">TypeScript</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F5F3F9] dark:bg-purple-950/60 border border-[#E8E4EF] dark:border-purple-400/25">Supabase RLS</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F5F3F9] dark:bg-purple-950/60 border border-[#E8E4EF] dark:border-purple-400/25">Multi-Provider AI</span>
                  </div>
                  <p className="text-[11px] text-[#92909B] dark:text-slate-500 pt-4">
                    &copy; 2026 Nyra AI Platform. All rights reserved.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E8E4EF] dark:border-purple-400/15 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-semibold shadow-md shadow-[#8B6FC9]/20 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function UsageMeter({ title, used, limit }: { title: string; used: number; limit: number }) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = percentage >= 80;

  return (
    <div className="p-3 rounded-xl border border-[#E8E4EF] dark:border-purple-400/15 bg-[#F5F3F9] dark:bg-purple-950/20">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium text-[#292633] dark:text-slate-300">{title}</span>
        <span className="font-mono text-[#686477] dark:text-slate-400 text-[11px]">
          <strong className={isHigh ? 'text-[#C49A5A]' : 'text-[#292633] dark:text-white'}>{used}</strong> / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#E8E4EF] dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isHigh
              ? 'bg-gradient-to-r from-[#C49A5A] to-[#C77B7B]'
              : 'bg-[#8B6FC9] dark:bg-gradient-to-r dark:from-purple-500 dark:to-indigo-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
