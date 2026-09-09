'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Globe, Brain, Rocket } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AboutPage() {
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
    <main className="relative min-h-screen overflow-hidden bg-[#F8F7FB] dark:bg-[#050308] text-[#292633] dark:text-white transition-all duration-500">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* LIGHT */}
        <div className="absolute top-[-220px] left-[-180px] h-[700px] w-[520px] rounded-full bg-[#8B6FC9]/10 blur-[160px] dark:hidden" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[700px] w-[520px] rounded-full bg-[#7E9AC7]/10 blur-[160px] dark:hidden" />

        {/* DARK */}
        <div className="hidden dark:block absolute top-[-220px] left-[-180px] h-[700px] w-[520px] rounded-full bg-[#a855f7]/10 blur-[180px]" />
        <div className="hidden dark:block absolute bottom-[-220px] right-[-180px] h-[700px] w-[520px] rounded-full bg-[#7c3aed]/10 blur-[180px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NAVBAR */}
        <header className="backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-8">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E8E4EF] dark:border-purple-400/15 bg-white/80 dark:bg-white/[0.03] text-[#292633] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <ArrowLeft size={16} />
              </Link>

              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B6FC9] to-[#7E9AC7] text-white shadow-md shadow-[#8B6FC9]/25">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-[#292633] dark:text-white">Nyra</h1>
                  <p className="text-[11px] text-[#686477] dark:text-purple-300/60 font-medium">About</p>
                </div>
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:flex items-center justify-center rounded-2xl border border-[#E8E4EF] dark:border-purple-400/15 bg-white/80 dark:bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-[#292633] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
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
        <section className="px-5 pt-12 pb-16 md:px-8 md:pt-16 md:pb-24">
          <div className="mx-auto max-w-[1400px]">
            {/* TOP */}
            <div className="max-w-4xl">
              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#8B6FC9] dark:text-purple-400 md:text-sm uppercase">
                ABOUT NYRA
              </p>

              <h1 className="text-[48px] sm:text-[68px] md:text-[88px] font-semibold tracking-[-0.08em] leading-[0.9] text-[#292633] dark:text-white">
                Building the
                <br />
                future of AI
                <br />
                workspaces.
              </h1>

              <p className="mt-8 max-w-3xl text-[16px] leading-8 text-[#686477] dark:text-slate-300 md:text-[19px] md:leading-9">
                Nyra is designed for developers, creators, startups and teams who want a modern AI-first workspace that feels intelligent, minimal and incredibly fast.
              </p>
            </div>

            {/* STATS */}
            <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-[30px] border border-[#E8E4EF] dark:border-purple-400/15 bg-white dark:bg-white/[0.03] p-6 shadow-[0_4px_24px_rgba(41,38,51,0.03)] backdrop-blur-3xl transition-all duration-300 hover:translate-y-[-4px]"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE8FA] dark:bg-purple-500/20 text-[#8B6FC9] dark:text-purple-300 shadow-sm">
                      <Icon size={20} />
                    </div>

                    <h2 className="text-[42px] md:text-[48px] font-bold tracking-[-0.06em] text-[#292633] dark:text-white">
                      {stat.value}
                    </h2>

                    <p className="mt-2 text-[14px] text-[#686477] dark:text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* MISSION */}
            <div className="mt-20 rounded-[36px] border border-[#E8E4EF] dark:border-purple-400/15 bg-white dark:bg-white/[0.03] p-7 md:p-10 shadow-[0_4px_24px_rgba(41,38,51,0.03)] backdrop-blur-3xl">
              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#8B6FC9] dark:text-purple-400 md:text-sm uppercase">
                OUR MISSION
              </p>

              <h2 className="text-[34px] md:text-[58px] font-semibold tracking-[-0.06em] leading-[1] text-[#292633] dark:text-white">
                Create a workspace where AI feels natural, powerful and beautiful.
              </h2>

              <p className="mt-8 max-w-4xl text-[16px] leading-8 text-[#686477] dark:text-slate-300 md:text-[19px] md:leading-9">
                We believe AI interfaces should not feel robotic or overwhelming. Nyra focuses on clarity, speed, intelligent workflows and modern aesthetics that help people think better and build faster.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/chat-ui"
                  className="flex items-center justify-center rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] px-7 py-4 text-sm font-bold text-white shadow-md shadow-[#8B6FC9]/25 transition-all duration-300 hover:scale-[1.02]"
                >
                  Get Started
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center justify-center rounded-2xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#F5F3F9] dark:bg-white/[0.03] px-7 py-4 text-sm font-medium text-[#292633] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}