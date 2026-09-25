'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sun,
  Moon,
  Monitor,
  Volume2,
  Mic,
  Cpu,
  Download,
  LogOut,
  User,
  Activity,
  RotateCcw,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Globe,
  Image as ImageIcon,
  FileText,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { USER_FACING_MODELS } from '@/lib/models';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { DailyUsageStats } from '@/lib/types';
import { loadChats, loadCustomPrompts } from '@/lib/storage';
import { applyTheme } from '@/lib/theme';
import { buildClientUsageStats, getTimeUntilUtcMidnight } from '@/lib/usage/clientUsage';

type SettingsTab =
  | 'appearance'
  | 'personalization'
  | 'models'
  | 'usage'
  | 'account'
  | 'data'
  | 'voice'
  | 'shortcuts'
  | 'about';

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
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [mobileView, setMobileView] = useState<'menu' | 'detail'>('menu');
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

  const router = useRouter();
  const { user, profile, preferences, updatePreferences, saveOnboardingPreferences, signOut } = useAuth();
  const { addToast } = useToast();

  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('Comfortable');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  useEffect(() => {
    if (profile) {
      setInterests(profile.interests || []);
      setGoals(profile.goals || []);
      setWorkStyle(profile.preferredResponseStyle || []);
      setExperienceLevel(profile.experienceLevel || 'Comfortable');
      setCustomInstructions(profile.customInstructions || '');
    } else {
      try {
        const raw = localStorage.getItem('nyra_onboarding_prefs');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.interests) setInterests(parsed.interests);
          if (parsed.goals) setGoals(parsed.goals);
          if (parsed.preferredResponseStyle) setWorkStyle(parsed.preferredResponseStyle);
          if (parsed.experienceLevel) setExperienceLevel(parsed.experienceLevel);
          if (parsed.customInstructions) setCustomInstructions(parsed.customInstructions);
        }
      } catch (e) {}
    }
  }, [profile, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMobileView('menu');
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (isOpen) {
      // Instantly load client usage so the user sees real, accurate metrics with zero delay
      setUsageStats(buildClientUsageStats(Boolean(user), null));
      setLoadingUsage(true);
      fetch('/api/usage')
        .then((res) => res.json())
        .then((serverData) => {
          if (serverData && !serverData.error) {
            setUsageStats(buildClientUsageStats(Boolean(user), serverData));
          }
        })
        .catch((e) => console.warn('Failed to load usage stats from server:', e))
        .finally(() => setLoadingUsage(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const ACCENT_COLORS = [
    { id: 'purple', name: 'Nyra Magenta', bg: 'bg-gradient-to-br from-[#E52A83] to-[#B31372]', ring: 'ring-[#E52A83]' },
    { id: 'cyan', name: 'Electric Cyan', bg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]', ring: 'ring-[#06B6D4]' },
    { id: 'blue', name: 'Cobalt Blue', bg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]', ring: 'ring-[#3B82F6]' },
    { id: 'sky', name: 'Sky Azure', bg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]', ring: 'ring-[#0EA5E9]' },
    { id: 'emerald', name: 'Emerald Mint', bg: 'bg-gradient-to-br from-[#10B981] to-[#059669]', ring: 'ring-[#10B981]' },
    { id: 'rose', name: 'Sunset Rose', bg: 'bg-gradient-to-br from-[#F43F5E] to-[#BE123C]', ring: 'ring-[#F43F5E]' },
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
    applyTheme('dark');

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

    addToast({ type: 'info', title: 'Settings reset to defaults' });
  };

  const currentModelObj = USER_FACING_MODELS.find((m) => m.id === selectedModel);

  const SETTINGS_SECTIONS = [
    {
      group: 'GENERAL',
      items: [
        {
          id: 'appearance' as SettingsTab,
          label: 'Appearance',
          subtitle: themeMode === 'dark' ? 'Dark Mode' : themeMode === 'light' ? 'Light Mode' : 'System Default',
          icon: <Palette size={16} />,
          iconBg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
        },
        {
          id: 'personalization' as SettingsTab,
          label: 'Personalization',
          subtitle: `${experienceLevel} • Custom Instructions`,
          icon: <Sparkles size={16} />,
          iconBg: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300',
        },
        {
          id: 'models' as SettingsTab,
          label: 'AI Models',
          subtitle: currentModelObj?.name || selectedModel,
          icon: <Bot size={16} />,
          iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
        },
        {
          id: 'usage' as SettingsTab,
          label: 'Usage & Limits',
          subtitle: 'Daily Free Workspace Allowance',
          icon: <Activity size={16} />,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
        },
      ],
    },
    {
      group: 'ACCOUNT & WORKSPACE',
      items: [
        {
          id: 'account' as SettingsTab,
          label: 'Account & Profile',
          subtitle: user?.email ? user.email : 'Guest Mode (Local Session)',
          icon: <User size={16} />,
          iconBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
        },
        {
          id: 'data' as SettingsTab,
          label: 'Data Controls & Memory',
          subtitle: 'Export data, AI memory & chat history',
          icon: <Trash2 size={16} />,
          iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
        },
        {
          id: 'voice' as SettingsTab,
          label: 'Voice & Speech',
          subtitle: `Read aloud • ${voiceRate}x playback`,
          icon: <Volume2 size={16} />,
          iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
        },
      ],
    },
    {
      group: 'ABOUT',
      items: [
        {
          id: 'shortcuts' as SettingsTab,
          label: 'Keyboard Shortcuts',
          subtitle: 'Quick navigation keys',
          icon: <Keyboard size={16} />,
          iconBg: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
        },
        {
          id: 'about' as SettingsTab,
          label: 'About Nyra',
          subtitle: 'Version 2.5.0 Pro',
          icon: <Info size={16} />,
          iconBg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
        },
      ],
    },
  ];

  const getTabTitle = (tab: SettingsTab) => {
    switch (tab) {
      case 'appearance':
        return 'Appearance';
      case 'personalization':
        return 'Personalization';
      case 'models':
        return 'AI Models';
      case 'usage':
        return 'Usage & Limits';
      case 'account':
        return 'Account & Profile';
      case 'data':
        return 'Data Controls';
      case 'voice':
        return 'Voice & Speech';
      case 'shortcuts':
        return 'Keyboard Shortcuts';
      case 'about':
        return 'About Nyra';
      default:
        return 'Settings';
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            {/* THEME SELECTION */}
            <div>
              <div className="mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8]">Theme Mode</h3>
                <p className="text-xs text-[#524F5E] dark:text-[#C5C3D1] mt-0.5">Select how the interface renders across your devices</p>
              </div>
              <div className="rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] overflow-hidden divide-y divide-[#EBEAEF] dark:divide-white/[0.07] shadow-xs">
                {[
                  { id: 'dark', label: 'Dark Mode', desc: 'Sleek dark obsidian palette', icon: <Moon size={16} className="text-[#8B6FC9] dark:text-purple-300" /> },
                  { id: 'light', label: 'Light Mode', desc: 'Crisp, high-contrast light theme', icon: <Sun size={16} className="text-amber-500 dark:text-amber-400" /> },
                  { id: 'system', label: 'System Default', desc: 'Automatically match device appearance', icon: <Monitor size={16} className="text-blue-500 dark:text-blue-400" /> },
                ].map((t) => {
                  const active = themeMode === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeMode(t.id as any);
                        applyTheme(t.id as any);
                        updatePreferences({ theme: t.id as any });
                        addToast({ type: 'info', title: `Theme set to ${t.label}` });
                      }}
                      className={`w-full flex items-center justify-between p-4 transition cursor-pointer text-left min-h-[58px] ${
                        active
                          ? 'bg-[#8B6FC9]/[0.06] dark:bg-purple-500/[0.12]'
                          : 'hover:bg-[#F7F6FB] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 rounded-xl bg-[#F7F6FA] dark:bg-white/[0.05] border border-[#EBEAEF] dark:border-white/[0.08]">
                          {t.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">{t.label}</p>
                          <p className="text-[11px] text-[#737082] dark:text-[#9A97A8] mt-0.5">{t.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        active
                          ? 'bg-[#8B6FC9] border-[#8B6FC9] dark:bg-purple-500 dark:border-purple-400 text-white shadow-xs'
                          : 'border-[#D4D2DC] dark:border-white/20 bg-transparent'
                      }`}>
                        {active && <Check size={12} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACCENT COLOR */}
            <div>
              <div className="mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8]">Accent Highlight</h3>
                <p className="text-xs text-[#524F5E] dark:text-[#C5C3D1] mt-0.5">Customize button glows, borders and interactive tones</p>
              </div>
              <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] shadow-xs">
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {ACCENT_COLORS.map((col) => {
                    const active = accentColor === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => {
                          onChangeAccent(col.id);
                          localStorage.setItem('nyra_accent', col.id);
                          document.documentElement.setAttribute('data-accent', col.id);
                          updatePreferences({ accentColor: col.id });
                          addToast({ type: 'success', title: `Accent set to ${col.name}` });
                        }}
                        className={`h-11 rounded-xl ${col.bg} flex items-center justify-center transition-all cursor-pointer relative ${
                          active
                            ? `ring-2 ring-offset-2 ${col.ring} dark:ring-offset-[#151224] scale-105 shadow-md`
                            : 'opacity-85 hover:opacity-100 hover:scale-102'
                        }`}
                        title={col.name}
                        aria-label={`Select ${col.name} accent`}
                      >
                        {active && <Check size={16} className="text-white drop-shadow stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-[#EBEAEF] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#737082] dark:text-[#9A97A8]">
                  <span>Active Tone</span>
                  <span className="font-semibold text-[#151221] dark:text-[#F3F1FA]">
                    {ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Default'}
                  </span>
                </div>
              </div>
            </div>

            {/* CHAT FONT SIZE */}
            <div>
              <div className="mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8]">Chat Font Size</h3>
                <p className="text-xs text-[#524F5E] dark:text-[#C5C3D1] mt-0.5">Optimized for reading comfort across mobile and desktop</p>
              </div>
              <div className="rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] overflow-hidden divide-y divide-[#EBEAEF] dark:divide-white/[0.07] shadow-xs">
                {[
                  { id: 'small', label: 'Compact (13.5px)', desc: 'Fits more content per screen' },
                  { id: 'normal', label: 'Default (15px)', desc: 'Balanced standard reading scale' },
                  { id: 'large', label: 'Comfort (16.5px)', desc: 'Larger text for effortless reading' },
                ].map((fs) => {
                  const active = fontSize === fs.id;
                  return (
                    <button
                      key={fs.id}
                      onClick={() => {
                        onChangeFontSize(fs.id as any);
                        localStorage.setItem('nyra_font_size', fs.id);
                        document.documentElement.setAttribute('data-font-size', fs.id);
                        updatePreferences({ fontSize: fs.id as any });
                        addToast({ type: 'info', title: `Font size changed to ${fs.label}` });
                      }}
                      className={`w-full flex items-center justify-between p-4 transition cursor-pointer text-left min-h-[54px] ${
                        active
                          ? 'bg-[#F4DCE9]/70 dark:bg-pink-500/[0.15]'
                          : 'hover:bg-[#F7F6FB] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-[#261827] dark:text-[#F3F1FA]">{fs.label}</p>
                        <p className="text-[11px] text-[#6E6072] dark:text-[#9A97A8] mt-0.5">{fs.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] border-[#B31372] dark:from-pink-500 dark:to-pink-600 dark:border-pink-400 text-white shadow-xs'
                          : 'border-[#D4D2DC] dark:border-white/20 bg-transparent'
                      }`}>
                        {active && <Check size={12} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl border border-[#E7B8CF] dark:border-pink-500/30 bg-[#F4DCE9]/60 dark:bg-pink-500/10 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-[#261827] dark:text-[#F3F1FA] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#B31372] dark:text-pink-300" />
                  <span>Build Your Nyra Blueprint</span>
                </h4>
                <p className="text-[11px] text-[#6E6072] dark:text-pink-200/80 mt-0.5">
                  Customizes tone, depth, and domain knowledge for all AI interactions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/onboarding');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 text-white text-[11px] font-semibold transition shrink-0 cursor-pointer shadow-xs"
              >
                Re-run
              </button>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
                Technical Depth
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Beginner', 'Comfortable', 'Advanced', 'Expert'].map((lvl) => {
                  const active = experienceLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center min-h-[46px] ${
                        active
                          ? 'bg-[#F4DCE9] dark:bg-pink-500/20 border-[#B31372] dark:border-pink-400 text-[#B31372] dark:text-pink-200 shadow-2xs'
                          : 'bg-white dark:bg-[#151224] border-[#EBEAEF] dark:border-white/[0.08] text-[#737082] hover:text-[#151221] dark:text-[#9A97A8] dark:hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
                Core Domains
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Technology & Coding',
                  'Design & Creativity',
                  'Learning',
                  'Career & Jobs',
                  'Business & Startups',
                  'Writing & Content',
                  'Research',
                  'Finance',
                  'Gaming',
                  'Personal Growth',
                ].map((tag) => {
                  const active = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (active) setInterests(interests.filter((i) => i !== tag));
                        else setInterests([...interests, tag]);
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        active
                          ? 'bg-[#F4DCE9] dark:bg-pink-500/20 border-[#B31372] dark:border-pink-400 text-[#B31372] dark:text-pink-200 shadow-2xs font-semibold'
                          : 'bg-white dark:bg-[#151224] border-[#EBEAEF] dark:border-white/[0.08] text-[#737082] hover:text-[#151221] dark:text-[#9A97A8] dark:hover:text-white'
                      }`}
                    >
                      <span>{tag}</span>
                      {active && <Check size={13} className="text-[#B31372] dark:text-pink-300 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Style */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
                Collaboration Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'Just give me the answer', desc: 'Direct, concise responses' },
                  { id: 'Teach me step-by-step', desc: 'Break down logic & fundamentals' },
                  { id: 'Go deeper', desc: 'Explain mechanisms & edge cases' },
                  { id: 'Brainstorm with me', desc: 'Iterative creative suggestions' },
                  { id: 'Build with me', desc: 'Collaborative pair programming' },
                ].map((ws) => {
                  const active = workStyle.includes(ws.id);
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        if (active) setWorkStyle(workStyle.filter((w) => w !== ws.id));
                        else setWorkStyle([...workStyle, ws.id]);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 min-h-[52px] ${
                        active
                          ? 'bg-[#F4DCE9] dark:bg-pink-500/20 border-[#B31372] dark:border-pink-400 text-[#B31372] dark:text-pink-200 shadow-2xs'
                          : 'bg-white dark:bg-[#151224] border-[#EBEAEF] dark:border-white/[0.08] text-[#737082] hover:text-[#151221] dark:text-[#9A97A8] dark:hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{ws.id}</p>
                        <p className="text-[10px] opacity-75 mt-0.5">{ws.desc}</p>
                      </div>
                      {active && <Check size={15} className="text-[#B31372] dark:text-pink-300 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Directives / Persona Instructions */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
                Custom Directives & Formatting
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="E.g. Always write clean TypeScript code with types, avoid unsolicited apologies, focus heavily on software performance and architecture..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] text-xs text-[#261827] dark:text-white placeholder-[#9E93A2] dark:placeholder-zinc-500 outline-none focus:border-[#B31372] dark:focus:border-pink-400 transition resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={savingOnboarding}
                onClick={async () => {
                  setSavingOnboarding(true);
                  try {
                    const res = await saveOnboardingPreferences({
                      interests,
                      goals,
                      workStyle,
                      experienceLevel,
                      customInstructions,
                    });
                    if (res.success) {
                      addToast({ type: 'success', title: 'Personalization saved successfully! Nyra will adapt to these preferences.' });
                    } else {
                      addToast({ type: 'error', title: res.error || 'Failed to save preferences' });
                    }
                  } finally {
                    setSavingOnboarding(false);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 text-white text-xs font-bold transition shadow-md shadow-pink-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[46px]"
              >
                {savingOnboarding ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Saving Personalization...</span>
                  </>
                ) : (
                  <span>Save Personalization Settings</span>
                )}
              </button>
            </div>
          </div>
        );

      case 'models':
        return (
          <div className="space-y-3">
            <p className="text-xs text-[#737082] dark:text-[#9A97A8] mb-2 leading-relaxed">
              Choose your default AI foundation model for all new conversations.
            </p>
            <div className="rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] overflow-hidden divide-y divide-[#EBEAEF] dark:divide-white/[0.07] shadow-xs">
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
                    className={`p-4 transition-all flex items-center justify-between min-h-[60px] ${
                      active
                        ? 'bg-[#8B6FC9]/[0.08] dark:bg-purple-500/[0.14]'
                        : isAvailable
                        ? 'hover:bg-[#F7F6FB] dark:hover:bg-white/[0.03] cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-[#F7F6FA] dark:bg-white/[0.05] border border-[#EBEAEF] dark:border-white/[0.08] text-[#8B6FC9] dark:text-purple-300 shrink-0">
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">{model.name}</h4>
                          {model.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                                isAvailable
                                  ? model.badgeColor || 'bg-[#8B6FC9]/10 dark:bg-purple-950/80 text-[#8B6FC9] dark:text-purple-300 border-[#8B6FC9]/30 dark:border-purple-700/50'
                                  : 'bg-zinc-100 dark:bg-slate-900 text-zinc-500 dark:text-slate-400 border-zinc-200 dark:border-slate-700/40'
                              }`}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#737082] dark:text-[#9A97A8] mt-0.5">{model.description}</p>
                      </div>
                    </div>
                    {active && <Check size={18} className="text-[#8B6FC9] dark:text-purple-400 shrink-0 ml-2 stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'usage': {
        const resetInfo = getTimeUntilUtcMidnight();
        const effectiveStats = usageStats || buildClientUsageStats(Boolean(user), null);

        return (
          <div className="space-y-4">
            {/* Plan & Quota Health Header */}
            <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">
                    {user ? 'Plan: Free Member Workspace' : 'Plan: Guest Session Workspace'}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      effectiveStats.isLimitReached
                        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30'
                        : effectiveStats.isApproachingLimit
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {effectiveStats.isLimitReached
                      ? 'Limit Reached'
                      : effectiveStats.isApproachingLimit
                      ? '80%+ Quota Used'
                      : 'Allowance Healthy'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#737082] dark:text-[#9A97A8] mt-1">
                  <Clock size={12} className="text-[#B31372] dark:text-pink-400" />
                  <span>Resets in <strong className="text-[#151221] dark:text-white font-mono">{resetInfo.formatted}</strong> (00:00 UTC)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 text-xs font-bold border border-[#B31372]/30 dark:border-pink-400/30 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>{user ? 'Cloud Synced' : 'Local Session'}</span>
                </span>
              </div>
            </div>

            {/* Feature Usage Meters */}
            <div className="space-y-3">
              <UsageMeter
                title="AI Generation Requests"
                subtitle="Chat completions, reasoning & code across all models"
                icon={<Sparkles size={16} className="text-[#B31372] dark:text-pink-400" />}
                used={effectiveStats.aiRequests.used}
                limit={effectiveStats.aiRequests.limit}
              />
              <UsageMeter
                title="Live Web Searches"
                subtitle="Real-time internet retrieval & cited web context"
                icon={<Globe size={16} className="text-sky-600 dark:text-sky-400" />}
                used={effectiveStats.webSearches.used}
                limit={effectiveStats.webSearches.limit}
              />
              <UsageMeter
                title="Multimodal Vision Images"
                subtitle="Image analysis, diagrams, OCR & visual reasoning"
                icon={<ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />}
                used={effectiveStats.imageRequests.used}
                limit={effectiveStats.imageRequests.limit}
              />
              <UsageMeter
                title="PDF Document Analyses"
                subtitle="Multi-page document extraction & RAG context queries"
                icon={<FileText size={16} className="text-amber-600 dark:text-amber-400" />}
                used={effectiveStats.pdfRequests.used}
                limit={effectiveStats.pdfRequests.limit}
              />
            </div>

            {/* Guest Upgrade Banner */}
            {!user && (
              <div className="p-4 rounded-2xl border border-[#B31372]/30 dark:border-pink-500/30 bg-gradient-to-br from-[#F4DCE9]/50 to-transparent dark:from-pink-950/20 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h5 className="text-xs font-bold text-[#151221] dark:text-white flex items-center gap-1.5">
                    <Zap size={14} className="text-[#B31372] dark:text-pink-400" />
                    <span>Unlock 2.5× Higher Daily Allowances</span>
                  </h5>
                  <p className="text-[11px] text-[#737082] dark:text-[#9A97A8] mt-0.5 leading-relaxed">
                    Sign in with a free account to upgrade to 20 AI requests/day, 10 web searches, and 5 vision & document analyses.
                  </p>
                </div>
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 text-white text-xs font-bold shrink-0 transition shadow-md shadow-pink-500/20 text-center"
                >
                  Sign In / Up Free
                </a>
              </div>
            )}

            {/* Policy & Quota Details */}
            <div className="p-3.5 rounded-xl border border-[#EBEAEF] dark:border-white/[0.06] bg-[#F7F6FA]/60 dark:bg-white/[0.02] text-[11px] text-[#737082] dark:text-[#9A97A8] leading-relaxed flex items-start gap-2">
              <Info size={14} className="text-[#B31372] dark:text-pink-400 shrink-0 mt-0.5" />
              <span>
                Daily allowances are counted per 24-hour UTC window. Rate limits (Tokens & Requests per Minute) are managed dynamically per provider to ensure sub-second response times.
              </span>
            </div>
          </div>
        );
      }

      case 'account':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#8B6FC9] to-[#6A4BB0] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">
                    {profile?.displayName || user?.email || 'Guest User'}
                  </h4>
                  <p className="text-[11px] text-[#737082] dark:text-[#9A97A8]">{user?.email || 'Local Storage Session'}</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
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
                  router.push('/login');
                }}
                className="w-full py-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer min-h-[46px]"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            ) : (
              <a
                href="/login"
                className="w-full py-3.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-[#8B6FC9]/25 min-h-[46px]"
              >
                <span>Sign In with Account</span>
              </a>
            )}
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] flex items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={15} className="text-[#8B6FC9] dark:text-purple-300" />
                  <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">AI Memory</h4>
                </div>
                <p className="text-xs text-[#737082] dark:text-[#9A97A8] leading-relaxed">
                  NYRA remembers facts across conversations for smarter responses.
                </p>
              </div>
              <Link
                href="/memory"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-[#8B6FC9]/10 hover:bg-[#8B6FC9]/20 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 border border-[#8B6FC9]/25 dark:border-purple-400/30 text-[#8B6FC9] dark:text-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs min-h-[38px]"
              >
                <span>Manage</span>
              </Link>
            </div>

            <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] flex items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA] mb-1">Export Data</h4>
                <p className="text-xs text-[#737082] dark:text-[#9A97A8] leading-relaxed">
                  Download a JSON copy of chats, saved prompts, and settings.
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs active:scale-95 min-h-[38px]"
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">Clear All Chat History</h4>
              <p className="text-xs text-[#737082] dark:text-[#9A97A8]">
                Permanently erase all your saved conversations. Saved prompts and preferences will remain.
              </p>

              {confirmClear ? (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-md min-h-[44px]"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 text-xs text-[#151221] dark:text-slate-300 hover:text-[#151221] dark:hover:text-white cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold transition cursor-pointer min-h-[44px]"
                >
                  Clear All History
                </button>
              )}
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={15} className="text-[#8B6FC9] dark:text-purple-400" />
                  <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">Speech-to-Text</h4>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      speechRecSupported ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-[#737082] dark:text-[#9A97A8]">
                    {speechRecSupported ? 'Supported in browser' : 'Unavailable in browser'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Volume2 size={15} className="text-[#8B6FC9] dark:text-purple-400" />
                  <h4 className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">Read Aloud (TTS)</h4>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[#737082] dark:text-[#9A97A8]">
                    Active ({voices.length} voices)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
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
                  className="w-full px-3.5 py-3 rounded-xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] text-xs text-[#151221] dark:text-white outline-none focus:border-[#8B6FC9] transition cursor-pointer min-h-[46px]"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name} className="bg-white dark:bg-[#151224] text-[#151221] dark:text-white">
                      {v.name} ({v.lang}) {v.default ? '• Default' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-[#737082] dark:text-[#9A97A8] p-3.5 rounded-xl bg-white dark:bg-[#151224] border border-[#EBEAEF] dark:border-white/[0.08]">
                  Default browser speech synthesis voice active
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8] block mb-2">
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
                      className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer min-h-[46px] ${
                        active
                          ? 'bg-[#8B6FC9]/15 dark:bg-purple-500/20 border-[#8B6FC9] dark:border-purple-400 text-[#8B6FC9] dark:text-purple-200 shadow-2xs'
                          : 'bg-white dark:bg-[#151224] border-[#EBEAEF] dark:border-white/[0.08] text-[#737082] hover:text-[#151221] dark:text-[#9A97A8] dark:hover:text-white'
                      }`}
                    >
                      {r}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-2">
            {SHORTCUTS.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] min-h-[48px]"
              >
                <span className="text-xs font-medium text-[#151221] dark:text-slate-200">{s.desc}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-[#F7F6FA] dark:bg-purple-950/80 border border-[#EBEAEF] dark:border-purple-400/30 text-[11px] font-mono text-[#8B6FC9] dark:text-purple-300 font-bold">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#8B6FC9] to-[#6A4BB0] flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-xl shadow-[#8B6FC9]/25">
              ✦
            </div>
            <div>
              <h3 className="text-base font-bold text-[#151221] dark:text-white">Nyra AI Assistant</h3>
              <p className="text-xs text-[#737082] dark:text-[#9A97A8] mt-1">
                Next-Generation Intelligent Workspace & Multimodal Reasoning UI
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-[#737082] dark:text-slate-300 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-[#EBEAEF] dark:border-white/10">Next.js 16</span>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-[#EBEAEF] dark:border-white/10">TypeScript</span>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-[#EBEAEF] dark:border-white/10">Supabase</span>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-[#EBEAEF] dark:border-white/10">Multi-Provider AI</span>
            </div>
            <p className="text-[11px] text-[#92909B] dark:text-slate-500 pt-4">
              &copy; 2026 Nyra AI Platform. All rights reserved.
            </p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex md:items-center md:justify-center md:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm md:backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full h-[100dvh] md:h-[88dvh] md:max-h-[850px] md:max-w-3xl md:rounded-3xl border-0 md:border border-[#EBEAEF] dark:border-white/10 bg-[#F7F6FA] dark:bg-[#0B0914] text-[#151221] dark:text-[#F3F1FA] md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* ======================================================== */}
          {/* MOBILE VIEW (< md / < 768px) — Fullscreen App Navigation */}
          {/* ======================================================== */}
          <div className="flex md:hidden flex-col h-full w-full bg-[#F7F6FA] dark:bg-[#0B0914]">
            {mobileView === 'menu' ? (
              /* MOBILE ROOT MENU */
              <div className="flex flex-col h-full">
                {/* Header */}
                <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#120F1F] border-b border-[#EBEAEF] dark:border-white/[0.08] shrink-0 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="p-1 -ml-1 text-[#737082] dark:text-[#9A97A8] hover:text-[#151221] dark:hover:text-white transition cursor-pointer"
                      aria-label="Close"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <h1 className="text-base font-bold text-[#151221] dark:text-white">Settings</h1>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-xs font-bold text-[#8B6FC9] dark:text-purple-300 px-2 py-1 cursor-pointer"
                  >
                    Done
                  </button>
                </header>

                {/* Grouped Category List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                  {SETTINGS_SECTIONS.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#737082] dark:text-[#9A97A8]">
                        {section.group}
                      </div>
                      <div className="rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] overflow-hidden divide-y divide-[#EBEAEF] dark:divide-white/[0.07] shadow-xs">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileView('detail');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F6FB] dark:hover:bg-white/[0.03] active:bg-[#8B6FC9]/10 dark:active:bg-purple-500/15 transition text-left cursor-pointer min-h-[56px]"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`p-2 rounded-xl ${item.iconBg} shrink-0`}>
                                {item.icon}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA]">{item.label}</p>
                                <p className="text-[11px] text-[#737082] dark:text-[#9A97A8] mt-0.5 line-clamp-1">{item.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-[#9A97A8] dark:text-slate-500 shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 px-2 flex items-center justify-between text-[11px] text-[#737082] dark:text-slate-400 pb-8">
                    <button
                      onClick={handleResetSettings}
                      className="flex items-center gap-1.5 text-[#737082] hover:text-[#8B6FC9] dark:text-slate-400 dark:hover:text-purple-300 transition cursor-pointer min-h-[44px]"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Defaults</span>
                    </button>
                    <span>Nyra AI v2.5.0 Pro</span>
                  </div>
                </div>
              </div>
            ) : (
              /* MOBILE DETAIL VIEW */
              <div className="flex flex-col h-full">
                {/* Sticky Detail Header */}
                <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#120F1F] border-b border-[#EBEAEF] dark:border-white/[0.08] shrink-0 shadow-2xs">
                  <button
                    onClick={() => setMobileView('menu')}
                    className="flex items-center gap-1 text-xs font-bold text-[#8B6FC9] dark:text-purple-300 hover:opacity-80 transition cursor-pointer -ml-1 min-h-[36px] pr-2"
                  >
                    <ChevronLeft size={20} />
                    <span>Settings</span>
                  </button>
                  <h2 className="text-sm font-bold text-[#151221] dark:text-white line-clamp-1">
                    {getTabTitle(activeTab)}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-xs font-bold text-[#8B6FC9] dark:text-purple-300 px-2 py-1 cursor-pointer"
                  >
                    Done
                  </button>
                </header>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-10">
                  {renderActiveTabContent()}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* DESKTOP VIEW (>= md / >= 768px) — Classic 2-Column Sidebar */}
          {/* ======================================================== */}
          <div className="hidden md:flex flex-row w-full h-full">
            {/* Desktop Left Sidebar Tabs */}
            <div className="w-56 bg-[#F2F1F7] dark:bg-[#090712] border-r border-[#EBEAEF] dark:border-white/10 p-4 shrink-0 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#151221] dark:text-white mb-2">
                  <Settings className="w-4 h-4 text-[#8B6FC9] dark:text-purple-400" />
                  <span>Settings</span>
                </div>

                {[
                  { id: 'appearance' as SettingsTab, label: 'Appearance', icon: <Palette size={15} /> },
                  { id: 'personalization' as SettingsTab, label: 'Personalization', icon: <Sparkles size={15} /> },
                  { id: 'models' as SettingsTab, label: 'AI Models', icon: <Bot size={15} /> },
                  { id: 'usage' as SettingsTab, label: 'Usage', icon: <Activity size={15} /> },
                  { id: 'account' as SettingsTab, label: 'Account', icon: <User size={15} /> },
                  { id: 'data' as SettingsTab, label: 'Data Controls', icon: <Trash2 size={15} /> },
                  { id: 'voice' as SettingsTab, label: 'Voice & Speech', icon: <Volume2 size={15} /> },
                  { id: 'shortcuts' as SettingsTab, label: 'Shortcuts', icon: <Keyboard size={15} /> },
                  { id: 'about' as SettingsTab, label: 'About Nyra', icon: <Info size={15} /> },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                        active
                          ? 'bg-[#8B6FC9]/15 dark:bg-purple-500/20 border border-[#8B6FC9]/40 dark:border-purple-400/40 text-[#8B6FC9] dark:text-purple-200 shadow-2xs font-bold'
                          : 'text-[#737082] hover:text-[#151221] hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04] font-medium'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-[#EBEAEF] dark:border-white/10 text-[11px] text-[#737082] dark:text-slate-500">
                <button
                  onClick={handleResetSettings}
                  className="flex items-center gap-1.5 text-[11px] text-[#737082] hover:text-[#8B6FC9] dark:text-slate-400 dark:hover:text-purple-300 transition cursor-pointer"
                  title="Reset all settings to defaults"
                >
                  <RotateCcw size={12} />
                  <span>Reset Defaults</span>
                </button>
                <span>Nyra AI v2.5.0 Pro</span>
              </div>
            </div>

            {/* Desktop Right Content Panel */}
            <div className="flex-1 p-6 bg-white dark:bg-[#130f24] overflow-y-auto custom-scrollbar flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#EBEAEF] dark:border-white/10 pb-3 mb-5">
                  <h3 className="text-base font-bold text-[#151221] dark:text-white">
                    {getTabTitle(activeTab)}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-[#F7F6FA] dark:hover:bg-white/10 text-[#737082] hover:text-[#151221] dark:hover:text-white transition cursor-pointer"
                    aria-label="Close settings"
                  >
                    <X size={18} />
                  </button>
                </div>

                {renderActiveTabContent()}
              </div>

              <div className="pt-4 border-t border-[#EBEAEF] dark:border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold shadow-md shadow-[#8B6FC9]/20 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function UsageMeter({
  title,
  subtitle,
  icon,
  used,
  limit,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  used: number;
  limit: number;
}) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = percentage >= 80;
  const isMax = percentage >= 100;
  const remaining = Math.max(0, limit - used);

  return (
    <div className="p-4 rounded-2xl border border-[#EBEAEF] dark:border-white/[0.08] bg-white dark:bg-[#151224] shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2.5 rounded-xl bg-[#F4DCE9]/60 dark:bg-pink-500/10 border border-[#B31372]/20 dark:border-pink-400/20 shrink-0">
              {icon}
            </div>
          )}
          <div>
            <span className="text-xs font-bold text-[#151221] dark:text-[#F3F1FA] block">{title}</span>
            {subtitle && (
              <span className="text-[10.5px] text-[#737082] dark:text-[#9A97A8] block mt-0.5 leading-tight">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono">
            <strong className={isMax ? 'text-rose-500 font-bold' : isHigh ? 'text-amber-500 font-bold' : 'text-[#151221] dark:text-white font-bold'}>
              {used}
            </strong>
            <span className="text-[#737082] dark:text-[#9A97A8]"> / {limit}</span>
          </div>
          <span
            className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block border ${
              isMax
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : isHigh
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-[#F4DCE9] dark:bg-pink-500/15 text-[#B31372] dark:text-pink-300 border-[#B31372]/20 dark:border-pink-400/20'
            }`}
          >
            {percentage}% used
          </span>
        </div>
      </div>

      <div className="h-2 w-full bg-[#EBEAEF] dark:bg-white/[0.08] rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isMax
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : isHigh
              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
              : 'bg-gradient-to-r from-[#E52A83] to-[#B31372]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#737082] dark:text-[#9A97A8]">
        <span>{remaining > 0 ? `${remaining} remaining today` : 'Daily limit reached'}</span>
        <span className="font-mono">{limit} daily limit</span>
      </div>
    </div>
  );
}
