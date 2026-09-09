'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Code,
  Layers,
  Terminal,
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function DocsPage() {
  const sections = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      desc:
        'Quick setup guide, installation instructions and basic configuration.',
    },
    {
      icon: Code,
      title: 'API Reference',
      desc:
        'Detailed documentation for endpoints, streaming responses and parameters.',
    },
    {
      icon: Layers,
      title: 'Architecture',
      desc:
        'Overview of the AI workspace infrastructure and real-time streaming.',
    },
    {
      icon: Terminal,
      title: 'CLI & SDKs',
      desc:
        'Integrate Nyra tools directly into your developer workflows.',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F7FB] dark:bg-[#050308] text-[#292633] dark:text-white transition-all duration-500">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* LIGHT */}
        <div className="absolute top-[-240px] left-[-180px] w-[700px] h-[900px] rounded-full bg-[#8B6FC9]/10 blur-[150px] dark:hidden" />
        <div className="absolute bottom-[-260px] right-[-180px] w-[700px] h-[850px] rounded-full bg-[#7E9AC7]/10 blur-[150px] dark:hidden" />

        {/* DARK */}
        <div className="hidden dark:block absolute top-[-240px] left-[-180px] w-[700px] h-[900px] rounded-full bg-purple-500/10 blur-[180px]" />
        <div className="hidden dark:block absolute bottom-[-260px] right-[-180px] w-[700px] h-[850px] rounded-full bg-violet-600/10 blur-[180px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NAVBAR */}
        <header className="backdrop-blur-2xl">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-5 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/15 bg-white/80 dark:bg-white/[0.05] text-[#292633] dark:text-white backdrop-blur-2xl flex items-center justify-center transition-all duration-300 hover:scale-[1.03]"
              >
                <ArrowLeft size={16} />
              </Link>

              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B6FC9] to-[#7E9AC7] flex items-center justify-center text-white shadow-md shadow-[#8B6FC9]/25">
                  <Sparkles size={16} />
                </div>

                <div>
                  <h1 className="text-sm font-semibold text-[#292633] dark:text-white">Nyra Docs</h1>
                  <p className="text-[11px] text-[#686477] dark:text-purple-300/60 font-medium">Documentation</p>
                </div>
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:flex items-center justify-center rounded-2xl border border-[#E8E4EF] dark:border-purple-400/15 bg-white/80 dark:bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-[#292633] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Login
              </Link>

              <Link
                href="/chat-ui"
                className="hidden md:flex items-center justify-center rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#8B6FC9]/20 transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="px-5 md:px-8 pt-12 md:pt-16 pb-16 md:pb-24">
          <div className="max-w-[1400px] mx-auto">
            {/* TOP */}
            <div className="max-w-4xl">
              <p className="text-[#8B6FC9] dark:text-purple-400 text-xs md:text-sm font-bold tracking-[0.2em] mb-5 uppercase">
                DOCUMENTATION
              </p>

              <h1 className="text-[48px] sm:text-[68px] md:text-[88px] font-semibold tracking-[-0.08em] leading-[0.9] text-[#292633] dark:text-white">
                Learn how
                <br />
                to build with
                <br />
                Nyra.
              </h1>

              <p className="mt-7 text-[16px] md:text-[19px] leading-8 md:leading-9 text-[#686477] dark:text-zinc-400 max-w-3xl">
                Explore setup guides, AI integrations, deployment systems and advanced implementation workflows.
              </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-14">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <div
                    key={section.title}
                    className="p-6 rounded-[28px] border border-[#E8E4EF] dark:border-purple-400/15 bg-white dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_4px_24px_rgba(41,38,51,0.03)] transition-all duration-300 hover:translate-y-[-3px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 flex items-center justify-center mb-5 shadow-sm">
                      <Icon size={20} />
                    </div>

                    <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.04em] mb-3 text-[#292633] dark:text-white">
                      {section.title}
                    </h2>

                    <p className="text-[14px] md:text-[15px] leading-7 text-[#686477] dark:text-zinc-400">
                      {section.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CODE */}
            <div className="mt-16 p-5 md:p-8 rounded-[32px] border border-[#E8E4EF] dark:border-purple-400/15 bg-white dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_4px_24px_rgba(41,38,51,0.03)]">
              <p className="text-[#8B6FC9] dark:text-purple-400 text-xs md:text-sm font-bold tracking-[0.2em] mb-5 uppercase">
                QUICK START
              </p>

              <div className="overflow-hidden rounded-[24px] bg-[#F8F7FB] dark:bg-[#0c0817] border border-[#E8E4EF] dark:border-purple-500/20">
                {/* TOP */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E8E4EF] dark:border-purple-500/15 bg-[#F5F3F9] dark:bg-[#120c22]">
                  <div className="w-3 h-3 rounded-full bg-[#C77B7B]/70 dark:bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-[#C49A5A]/70 dark:bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-[#6FA58A]/70 dark:bg-green-400/80" />
                </div>

                {/* CODE */}
                <pre className="p-5 text-sm md:text-[14px] leading-7 text-[#292633] dark:text-purple-200 overflow-auto font-mono">
{`npx create-next-app@latest nyra-ai

cd nyra-ai

npm install ai @ai-sdk/openai framer-motion

npm run dev`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}