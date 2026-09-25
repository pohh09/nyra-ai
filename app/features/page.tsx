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
        darkMode ? 'bg-[#050505] text-white' : 'bg-[#FAF8FB] text-[#261827]'
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
            <div className="absolute top-[-220px] left-[-220px] h-[720px] w-[520px] rounded-full bg-[#E52A83]/10 blur-[160px]" />
            <div className="absolute bottom-[-220px] right-[-180px] h-[720px] w-[520px] rounded-full bg-[#B31372]/10 blur-[160px]" />
          </>
        )}

        {/* DARK MODE GLOW */}
        {darkMode && (
          <>
            <div className="absolute top-[-180px] left-[-180px] h-[700px] w-[500px] rounded-full bg-[#E52A83]/15 blur-[180px]" />
            <div className="absolute bottom-[-200px] right-[-180px] h-[720px] w-[520px] rounded-full bg-[#B31372]/15 blur-[180px]" />
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
                  darkMode ? 'border-pink-500/20 bg-white/[0.03]' : 'border-[#E7B8CF] bg-white/80 text-[#261827]'
                }`}
              >
                <ArrowLeft size={16} />
              </Link>

              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E52A83] to-[#B31372] text-white shadow-md shadow-pink-500/25">
                  <Sparkles size={16} />
                </div>

                <div>
                  <h1 className="text-[15px] font-semibold text-[#261827] dark:text-white">Nyra</h1>
                  <p className={`text-[11px] ${darkMode ? 'text-pink-300/60 font-medium' : 'text-[#6E6072]'}`}>
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
                    ? 'border-pink-500/20 bg-white/[0.03] hover:bg-white/[0.04]'
                    : 'border-[#E7B8CF] bg-white/80 text-[#261827] hover:bg-white'
                }`}
              >
                Login
              </Link>

              <Link
                href="/chat-ui"
                className="hidden md:flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>

              <button
                onClick={toggleTheme}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all cursor-pointer ${
                  darkMode ? 'border-pink-500/20 bg-white/[0.03]' : 'border-[#E7B8CF] bg-white/80 text-[#261827]'
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
              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#B31372] dark:text-pink-400 md:text-sm uppercase">
                FEATURES
              </p>

              <h1 className="text-3xl 2xs:text-4xl sm:text-6xl md:text-7xl lg:text-[100px] font-semibold tracking-[-0.08em] leading-[0.95] text-[#261827] dark:text-white break-words">
                Powerful AI
                <br />
                tools built
                <br />
                for modern work.
              </h1>

              <p className={`mt-8 max-w-3xl text-sm 2xs:text-base leading-7 md:text-[20px] md:leading-9 ${
                darkMode ? 'text-slate-300' : 'text-[#6E6072]'
              }`}>
                Nyra combines AI chat, intelligent workflows, image understanding and automation into one beautifully crafted workspace.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/chat-ui"
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 px-7 py-4 text-sm font-bold text-white shadow-md shadow-pink-500/25 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>

                <Link
                  href="/"
                  className={`flex items-center justify-center rounded-2xl border px-7 py-4 text-sm font-medium transition-all ${
                    darkMode
                      ? 'border-pink-500/20 bg-white/[0.03] hover:bg-white/[0.04]'
                      : 'border-[#E7B8CF] bg-[#FAF8FB] text-[#261827] hover:bg-[#F4DCE9]'
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
                        ? 'border-pink-500/20 bg-[#16091F]/40 hover:bg-[#16091F]/70'
                        : 'border-[#E7B8CF] bg-white shadow-[0_4px_24px_rgba(38,24,39,0.03)]'
                    }`}
                  >
                    {/* ICON */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 shadow-sm">
                      <Icon size={22} />
                    </div>

                    {/* TITLE */}
                    <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#261827] dark:text-white">
                      {feature.title}
                    </h2>

                    {/* DESC */}
                    <p className={`mt-5 text-[16px] leading-8 ${
                      darkMode ? 'text-slate-300' : 'text-[#6E6072]'
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
                      darkMode ? 'border-pink-500/20 bg-[#16091F]/40' : 'border-[#E7B8CF] bg-white shadow-[0_4px_24px_rgba(38,24,39,0.03)]'
                    }`}
                  >
                    {/* ICON */}
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 shadow-sm">
                      <Icon size={18} />
                    </div>

                    {/* VALUE */}
                    <h2 className="text-[44px] md:text-[54px] font-bold tracking-[-0.06em] text-[#261827] dark:text-white">
                      {stat.value}
                    </h2>

                    {/* LABEL */}
                    <p className={`mt-2 text-[14px] ${darkMode ? 'text-slate-400' : 'text-[#6E6072]'}`}>
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* BIG CTA */}
            <div
              className={`relative mt-24 overflow-hidden rounded-[42px] border p-8 md:p-14 backdrop-blur-3xl ${
                darkMode ? 'border-pink-500/25 bg-gradient-to-b from-[#16091F]/80 to-[#08020D]/90 shadow-2xl shadow-pink-500/10' : 'border-[#E7B8CF] bg-white shadow-[0_4px_24px_rgba(38,24,39,0.03)]'
              }`}
            >
              {/* GLOW */}
              <div className="absolute right-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#E52A83]/15 blur-[120px]" />

              {/* CONTENT */}
              <div className="relative z-10 max-w-4xl">
                <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#B31372] dark:text-pink-400 md:text-sm uppercase">
                  START BUILDING TODAY
                </p>

                <h2 className="text-3xl 2xs:text-4xl sm:text-5xl md:text-[68px] font-semibold tracking-[-0.07em] leading-[1.05] text-[#261827] dark:text-white break-words">
                  AI tools designed
                  <br />
                  for the next generation.
                </h2>

                <p className={`mt-7 max-w-2xl text-[16px] leading-8 md:text-[19px] md:leading-9 ${
                  darkMode ? 'text-slate-300' : 'text-[#6E6072]'
                }`}>
                  Join creators, startups and modern teams using Nyra to build smarter workflows and better AI experiences.
                </p>

                {/* CTA */}
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/chat-ui"
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 px-7 py-4 text-sm font-bold text-white shadow-md shadow-pink-500/25 transition-all hover:scale-[1.02]"
                  >
                    Start Free
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/pricing"
                    className={`flex items-center justify-center rounded-2xl border px-7 py-4 text-sm font-medium transition-all ${
                      darkMode
                        ? 'border-pink-500/20 bg-white/[0.03] hover:bg-white/[0.04]'
                        : 'border-[#E7B8CF] bg-[#FAF8FB] text-[#261827] hover:bg-[#F4DCE9]'
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