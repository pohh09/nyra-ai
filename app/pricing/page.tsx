'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for getting started.',
      button: 'Start Free',
      features: [
        'Basic AI Chat',
        'Limited Requests',
        'Community Support',
      ],
    },
    {
      name: 'Pro',
      price: '$19',
      desc: 'Built for creators and modern AI workflows.',
      button: 'Upgrade to Pro',
      features: [
        'Unlimited AI Chat',
        'Code Generation',
        'Priority Responses',
        'Advanced Workspace',
      ],
      featured: true,
    },
    {
      name: 'Team',
      price: '$49',
      desc: 'Collaboration tools for AI teams.',
      button: 'Start Team Plan',
      features: [
        'Shared Workspace',
        'Advanced AI Tools',
        'Priority Support',
      ],
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAF8FB] dark:bg-[#050505] text-[#261827] dark:text-white transition-all duration-500">
      {/* BACKGROUND GLOWS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* LIGHT */}
        <div className="absolute top-[-220px] left-[-180px] h-[650px] w-[500px] rounded-full bg-[#E52A83]/10 blur-[140px] dark:hidden" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[650px] w-[500px] rounded-full bg-[#B31372]/10 blur-[140px] dark:hidden" />

        {/* DARK */}
        <div className="absolute top-[-220px] left-[-180px] hidden dark:block h-[650px] w-[500px] rounded-full bg-[#E52A83]/15 blur-[160px]" />
        <div className="absolute bottom-[-220px] right-[-180px] hidden dark:block h-[650px] w-[500px] rounded-full bg-[#B31372]/15 blur-[160px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NAVBAR */}
        <header>
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-8">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E7B8CF] dark:border-pink-500/20 bg-white/80 dark:bg-white/[0.05] text-[#261827] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <ArrowLeft size={16} />
              </Link>

              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E52A83] to-[#B31372] text-white shadow-md shadow-pink-500/25">
                  <Sparkles size={16} />
                </div>

                <div>
                  <h1 className="text-sm font-semibold text-[#261827] dark:text-white">Nyra</h1>
                  <p className="text-[11px] text-[#6E6072] dark:text-pink-300/60 font-medium">Pricing</p>
                </div>
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:flex items-center justify-center rounded-2xl border border-[#E7B8CF] dark:border-pink-500/20 bg-white/80 dark:bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-[#261827] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Login
              </Link>

              <Link
                href="/chat-ui"
                className="hidden md:flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="px-5 pt-10 pb-16 md:px-8 md:pt-14 md:pb-20">
          <div className="mx-auto max-w-[1400px]">
            {/* TOP */}
            <div className="text-center">
              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#B31372] dark:text-pink-400 uppercase">
                PRICING
              </p>

              <h1 className="text-3xl 2xs:text-4xl sm:text-5xl md:text-6xl lg:text-[78px] font-semibold tracking-[-0.06em] sm:tracking-[-0.08em] leading-[0.96] sm:leading-[0.92] text-[#261827] dark:text-white break-words">
                Simple pricing
                <br />
                for modern AI
                <br />
                workflows.
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-8 text-[#6E6072] dark:text-zinc-400 md:text-[18px]">
                Flexible plans for AI conversations, productivity and collaboration.
              </p>

              {/* BUTTONS */}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/chat-ui"
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02]"
                >
                  Start Free
                </Link>

                <Link
                  href="/features"
                  className="flex items-center justify-center rounded-2xl border border-[#E7B8CF] dark:border-pink-500/20 bg-white/80 dark:bg-white/[0.05] px-7 py-3.5 text-sm font-medium text-[#261827] dark:text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Explore Features
                </Link>
              </div>

              {/* TOGGLE */}
              <div className="mx-auto mt-10 flex w-fit items-center gap-2 rounded-full border border-[#E7B8CF] dark:border-pink-500/20 bg-white/80 dark:bg-white/[0.05] p-2 backdrop-blur-xl">
                <button className="rounded-full bg-gradient-to-r from-[#E52A83] to-[#B31372] px-5 py-2 text-sm font-bold text-white shadow-sm">
                  Monthly
                </button>

                <button className="rounded-full px-5 py-2 text-sm font-medium text-[#6E6072] dark:text-zinc-300">
                  Yearly
                  <span className="ml-1 text-[#B31372] dark:text-pink-400 font-semibold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* TRUST */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {[
                '10K+ Users',
                '99.9% Uptime',
                'Fast AI',
                'Secure Workspace',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[#E7B8CF] dark:border-pink-500/15 bg-white/80 dark:bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#6E6072] dark:text-zinc-300 backdrop-blur-xl shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            {/* PRICING GRID */}
            <div className="mx-auto mt-14 grid max-w-[1050px] grid-cols-1 gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative overflow-hidden rounded-[34px] transition-all duration-500 ${
                    plan.featured
                      ? 'lg:-translate-y-3 border-2 border-[#E52A83] dark:border-pink-500/50 bg-white dark:bg-gradient-to-b dark:from-[#24103A]/60 dark:to-[#16091F]/40 shadow-[0_12px_40px_rgba(229,42,131,0.15)] dark:shadow-[0_10px_40px_rgba(229,42,131,0.2)]'
                      : 'border border-[#E7B8CF] dark:border-pink-500/15 bg-white dark:bg-white/[0.04] shadow-[0_4px_24px_rgba(38,24,39,0.03)] backdrop-blur-3xl'
                  }`}
                >
                  {/* CONTENT */}
                  <div className="relative z-10 p-7">
                    {/* BADGE */}
                    {plan.featured && (
                      <div className="mb-5 inline-flex rounded-full border border-[#E7B8CF] dark:border-pink-500/30 bg-[#F4DCE9] dark:bg-pink-500/15 px-4 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#B31372] dark:text-pink-300">
                        MOST POPULAR
                      </div>
                    )}

                    {/* TITLE */}
                    <h2 className="text-[30px] font-semibold tracking-[-0.05em] text-[#261827] dark:text-white">
                      {plan.name}
                    </h2>

                    {/* DESC */}
                    <p className="mt-3 text-[14px] leading-7 text-[#6E6072] dark:text-zinc-400">
                      {plan.desc}
                    </p>

                    {/* PRICE */}
                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-[58px] font-bold tracking-[-0.08em] leading-none text-[#261827] dark:text-white">
                        {plan.price}
                      </span>
                      <span className="mb-2 text-sm text-[#6E6072] dark:text-zinc-400">
                        /month
                      </span>
                    </div>

                    {/* DIVIDER */}
                    <div className="mt-7 h-px bg-[#E7B8CF] dark:bg-pink-500/15" />

                    {/* FEATURES */}
                    <div className="mt-7 space-y-4">
                      {plan.features.map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4DCE9] dark:bg-pink-500/20 text-[#B31372] dark:text-pink-300 shrink-0 shadow-sm">
                            <Check size={11} />
                          </div>
                          <span className="text-[14px] text-[#261827] dark:text-zinc-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* BUTTON */}
                    <Link
                      href="/chat-ui"
                      className={`mt-9 flex h-[52px] w-full items-center justify-center rounded-2xl text-[14px] font-bold tracking-[-0.02em] transition-all duration-300 ${
                        plan.featured
                          ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] hover:opacity-95 text-white shadow-[0_8px_24px_rgba(229,42,131,0.25)] hover:scale-[1.02]'
                          : 'border border-[#E7B8CF] dark:border-pink-500/20 bg-[#FAF8FB] dark:bg-white/[0.05] text-[#261827] dark:text-white hover:bg-[#F4DCE9] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {plan.button}
                    </Link>

                    {/* FOOTER */}
                    <p className="mt-4 text-center text-[11px] text-[#6E6072] dark:text-zinc-400">
                      Cancel anytime • Secure payments
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-24">
              <div className="text-center">
                <p className="text-sm font-bold tracking-[0.2em] text-[#B31372] dark:text-pink-400 uppercase">
                  FAQ
                </p>

                <h2 className="mt-5 text-[40px] md:text-[58px] font-semibold tracking-[-0.06em] leading-[0.95] text-[#261827] dark:text-white">
                  Frequently asked
                  <br />
                  questions.
                </h2>
              </div>

              {/* FAQ GRID */}
              <div className="mx-auto mt-14 grid max-w-4xl gap-5">
                {[
                  {
                    q: 'Can I cancel anytime?',
                    a: 'Yes. You can cancel your subscription anytime.',
                  },
                  {
                    q: 'Do you offer team plans?',
                    a: 'Yes. Team plans include collaboration tools.',
                  },
                  {
                    q: 'Is there a free plan?',
                    a: 'Yes. You can start using Nyra for free.',
                  },
                  {
                    q: 'Are payments secure?',
                    a: 'Absolutely. All payments are securely processed.',
                  },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="rounded-[24px] border border-[#E7B8CF] dark:border-pink-500/15 bg-white dark:bg-white/[0.04] p-5 shadow-sm backdrop-blur-xl"
                  >
                    <h3 className="text-[17px] font-semibold text-[#261827] dark:text-white">
                      {item.q}
                    </h3>
                    <p className="mt-3 text-[14px] leading-7 text-[#6E6072] dark:text-zinc-400">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}