'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import {
  ArrowLeft,
  Sparkles,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Bot,
  Brain,
  Shield,
  Rocket,
  Globe,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export default function FeaturesPage() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);

    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Real-Time AI Streaming',
      desc:
        'Sub-second responses with progressive token streaming and memory continuity across conversations.',
    },
    {
      icon: Bot,
      title: 'Multi-Model Switcher',
      desc:
        'Switch between Llama 3.3, Claude, Gemini Vision and deep reasoning engines instantly.',
    },
    {
      icon: ImageIcon,
      title: 'Vision & Multimodal',
      desc:
        'Upload images, PDFs and datasets for deep spatial recognition, optical parsing and document synthesis.',
    },
    {
      icon: Brain,
      title: 'Smart Workspace',
      desc:
        'An intelligent AI-first workspace designed for speed, focus and keyboard-driven ergonomics.',
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      desc:
        'Automate repetitive engineering tasks, generate frontend components and run multi-step code synthesis.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      desc:
        'Zero data retention options, end-to-end encrypted storage and modern scalable infrastructure.',
    },
  ];

  const stats = [
    {
      icon: Brain,
      value: '10K+',
      label: 'AI Conversations',
    },
    {
      icon: Rocket,
      value: '99%',
      label: 'Fast Response Rate',
    },
    {
      icon: Globe,
      value: '24/7',
      label: 'Worldwide Access',
    },
  ];

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
        darkMode ? 'bg-[#050308] text-white' : 'bg-[#F8F7FB] text-[#292633]'
      }`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* GRID */}
        <div
          className={`absolute inset-0 ${darkMode ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '90px 90px',
          }}
        />

        {/* LIGHT MODE GLOW */}
        {!darkMode && (
          <>
            <div className="absolute top-[-220px] left-[-220px] h-[720px] w-[520px] rounded-full bg-[#8B6FC9]/10 blur-[160px]" />
            <div className="absolute bottom-[-220px] right-[-180px] h-[720px] w-[520px] rounded-full bg-[#7E9AC7]/10 blur-[160px]" />
          </>
        )}

        {/* DARK MODE GLOW */}
        {darkMode && (
          <>
            <div className="absolute top-[-180px] left-[-180px] h-[700px] w-[500px] rounded-full bg-purple-500/10 blur-[180px]" />
            <div className="absolute bottom-[-200px] right-[-180px] h-[720px] w-[520px] rounded-full bg-violet-600/10 blur-[180px]" />
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NAVBAR */}
        <header>
          <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-5 md:px-8">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all ${
                  darkMode ? 'border-purple-400/15 bg-white/[0.03]' : 'border-[#E8E4EF] bg-white/80 text-[#292633]'
                }`}
              >
                <ArrowLeft size={16} />
              </Link>

              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B6FC9] to-[#7E9AC7] text-white shadow-md shadow-[#8B6FC9]/25">
                  <Sparkles size={16} />
                </div>

                <div>
                  <h1 className="text-[15px] font-semibold text-[#292633] dark:text-white">Nyra</h1>
                  <p className={`text-[11px] ${darkMode ? 'text-purple-300/60 font-medium' : 'text-[#686477]'}`}>
                    Features
                  </p>
                </div>
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`hidden md:flex items-center justify-center rounded-2xl border px-5 py-2.5 text-sm font-medium backdrop-blur-xl transition-all ${
                  darkMode
                    ? 'border-purple-400/15 bg-white/[0.03] hover:bg-white/[0.04]'
                    : 'border-[#E8E4EF] bg-white/80 text-[#292633] hover:bg-white'
                }`}
              >
                Login
              </Link>

              <Link
                href="/chat-ui"
                className="hidden md:flex items-center justify-center rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#8B6FC9]/20 transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>

              <button
                onClick={toggleTheme}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all ${
                  darkMode ? 'border-purple-400/15 bg-white/[0.03]' : 'border-[#E8E4EF] bg-white/80 text-[#292633]'
                }`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="px-5 pt-10 pb-20 md:px-8 md:pt-16 md:pb-28">
          <div className="mx-auto max-w-[1450px]">
            {/* HERO TOP */}
            <div className="max-w-4xl">
              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#8B6FC9] dark:text-purple-400 md:text-sm uppercase">
                FEATURES
              </p>

              <h1 className="text-[48px] sm:text-[72px] md:text-[110px] font-semibold tracking-[-0.08em] leading-[0.9] text-[#292633] dark:text-white">
                Powerful AI
                <br />
                tools built
                <br />
                for modern work.
              </h1>

              <p className={`mt-8 max-w-3xl text-[16px] leading-8 md:text-[20px] md:leading-9 ${
                darkMode ? 'text-slate-300' : 'text-[#686477]'
              }`}>
                Nyra combines AI chat, intelligent workflows, image understanding and automation into one beautifully crafted workspace.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/chat-ui"
                  className="flex items-center justify-center rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] px-7 py-4 text-sm font-bold text-white shadow-md shadow-[#8B6FC9]/25 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>

                <Link
                  href="/"
                  className={`flex items-center justify-center rounded-2xl border px-7 py-4 text-sm font-medium transition-all ${
                    darkMode
                      ? 'border-purple-400/20 bg-white/[0.03] hover:bg-white/[0.04]'
                      : 'border-[#E8E4EF] bg-[#F5F3F9] text-[#292633] hover:bg-[#EEE8FA]'
                  }`}
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* FEATURES GRID */}
            <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className={`rounded-[34px] border p-8 backdrop-blur-3xl transition-all duration-300 hover:translate-y-[-4px] ${
                      darkMode
                        ? 'border-purple-400/15 bg-white/[0.03] hover:bg-white/[0.04]'
                        : 'border-[#E8E4EF] bg-white shadow-[0_4px_24px_rgba(41,38,51,0.03)]'
                    }`}
                  >
                    {/* ICON */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 shadow-sm">
                      <Icon size={22} />
                    </div>

                    {/* TITLE */}
                    <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#292633] dark:text-white">
                      {feature.title}
                    </h2>

                    {/* DESC */}
                    <p className={`mt-5 text-[16px] leading-8 ${
                      darkMode ? 'text-slate-300' : 'text-[#686477]'
                    }`}>
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* STATS */}
            <div className="mt-24 grid grid-cols-1 gap-5 md:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`rounded-[34px] border p-7 backdrop-blur-3xl transition-all duration-300 hover:translate-y-[-4px] ${
                      darkMode ? 'border-purple-400/15 bg-white/[0.03]' : 'border-[#E8E4EF] bg-white shadow-[0_4px_24px_rgba(41,38,51,0.03)]'
                    }`}
                  >
                    {/* ICON */}
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 shadow-sm">
                      <Icon size={18} />
                    </div>

                    {/* VALUE */}
                    <h2 className="text-[44px] md:text-[54px] font-bold tracking-[-0.06em] text-[#292633] dark:text-white">
                      {stat.value}
                    </h2>

                    {/* LABEL */}
                    <p className={`mt-2 text-[14px] ${darkMode ? 'text-slate-400' : 'text-[#686477]'}`}>
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* BIG CTA */}
            <div
              className={`relative mt-24 overflow-hidden rounded-[42px] border p-8 md:p-14 backdrop-blur-3xl ${
                darkMode ? 'border-purple-400/15 bg-white/[0.03]' : 'border-[#E8E4EF] bg-white shadow-[0_4px_24px_rgba(41,38,51,0.03)]'
              }`}
            >
              {/* GLOW */}
              <div className="absolute right-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#8B6FC9]/10 blur-[120px]" />

              {/* CONTENT */}
              <div className="relative z-10 max-w-4xl">
                <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#8B6FC9] dark:text-purple-400 md:text-sm uppercase">
                  START BUILDING TODAY
                </p>

                <h2 className="text-[40px] sm:text-[56px] md:text-[78px] font-semibold tracking-[-0.07em] leading-[0.95] text-[#292633] dark:text-white">
                  AI tools designed
                  <br />
                  for the next generation.
                </h2>

                <p className={`mt-7 max-w-2xl text-[16px] leading-8 md:text-[19px] md:leading-9 ${
                  darkMode ? 'text-slate-300' : 'text-[#686477]'
                }`}>
                  Join creators, startups and modern teams using Nyra to build smarter workflows and better AI experiences.
                </p>

                {/* CTA */}
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/chat-ui"
                    className="flex items-center gap-2 rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] px-7 py-4 text-sm font-bold text-white shadow-md shadow-[#8B6FC9]/25 transition-all hover:scale-[1.02]"
                  >
                    Start Free
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/pricing"
                    className={`flex items-center justify-center rounded-2xl border px-7 py-4 text-sm font-medium transition-all ${
                      darkMode
                        ? 'border-purple-400/20 bg-white/[0.03] hover:bg-white/[0.04]'
                        : 'border-[#E8E4EF] bg-[#F5F3F9] text-[#292633] hover:bg-[#EEE8FA]'
                    }`}
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}