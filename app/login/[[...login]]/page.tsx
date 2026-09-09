'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Shield,
  Sparkles,
  Stars,
  Zap,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isLoading: authLoading, isConfigured } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/chat-ui');
    }
  }, [user, authLoading, router]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials or user not found.');
        addToast({ type: 'error', title: res.error || 'Authentication failed' });
      } else {
        addToast({ type: 'success', title: 'Welcome back to Nyra AI' });
        router.push('/chat-ui');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
        isDark ? 'bg-[#020617]' : 'bg-[#F8F7FB]'
      }`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${isDark ? 'opacity-[0.04]' : 'opacity-[0.06]'}`}
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />
        <div className="absolute left-[-120px] top-[-80px] h-[380px] w-[380px] rounded-full bg-[#8B6FC9]/15 blur-[120px]" />
        <div className="absolute right-[-100px] top-[120px] h-[420px] w-[420px] rounded-full bg-[#7E9AC7]/15 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-1/2 h-[400px] w-[720px] -translate-x-1/2 rounded-full bg-[#8B6FC9]/10 blur-[160px]" />
      </div>

      {/* THEME TOGGLE BUTTON */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`absolute right-6 top-6 z-50 rounded-2xl border px-5 py-2.5 text-sm font-medium backdrop-blur-xl transition-all cursor-pointer ${
          isDark
            ? 'border-white/10 bg-white/[0.05] text-white hover:bg-white/10'
            : 'border-[#E8E4EF] bg-white/80 text-[#292633] hover:bg-white shadow-sm'
        }`}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div
          className={`grid w-full max-w-7xl overflow-hidden rounded-[40px] border backdrop-blur-[40px] lg:grid-cols-2 transition-all duration-500 ${
            isDark
              ? 'border-white/10 bg-white/[0.03]'
              : 'border-[#E8E4EF] bg-white/80 shadow-[0_20px_80px_rgba(41,38,51,0.06)]'
          }`}
        >
          {/* LEFT HERO */}
          <div className="relative flex flex-col justify-center px-10 py-16 lg:px-24">
            <div
              className={`mb-8 flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 text-sm backdrop-blur-xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-white/70'
                  : 'border-[#E8E4EF] bg-[#EEE8FA] text-[#8B6FC9] font-medium'
              }`}
            >
              <Stars size={14} className={isDark ? 'text-sky-400' : 'text-[#8B6FC9]'} />
              <span>Futuristic Workspace</span>
            </div>

            <h1
              className={`text-6xl font-black leading-[0.9] tracking-[-0.08em] lg:text-[96px] ${
                isDark ? 'text-white' : 'text-[#292633]'
              }`}
            >
              Welcome
              <br />
              <span className="bg-gradient-to-r from-[#8B6FC9] to-[#7E9AC7] bg-clip-text text-transparent">
                Back
              </span>
            </h1>

            <p className={`mt-8 max-w-[520px] text-lg leading-9 ${isDark ? 'text-white/55' : 'text-[#686477]'}`}>
              Continue building intelligent AI experiences with unified workspace memory, multimodal analysis, and cloud persistence.
            </p>

            {/* FEATURES */}
            <div className="mt-14 flex flex-wrap gap-6">
              <FeatureCard icon={<Sparkles size={18} />} title="AI Powered" subtitle="Smart automation" isDark={isDark} />
              <FeatureCard icon={<Shield size={18} />} title="Cloud Sync" subtitle="Persistent memory" isDark={isDark} />
              <FeatureCard icon={<Zap size={18} />} title="Fast" subtitle="Lightning speed" isDark={isDark} />
            </div>

            <div className={`mt-14 flex items-center gap-3 text-sm ${isDark ? 'text-white/50' : 'text-[#686477]'}`}>
              <span>Continue your AI journey</span>
              <ArrowRight size={16} className={isDark ? 'text-blue-500' : 'text-[#8B6FC9]'} />
            </div>
          </div>

          {/* RIGHT SIGN IN FORM */}
          <div className="relative flex items-center justify-center px-6 py-16 lg:px-12">
            <div className="absolute h-[500px] w-[500px] rounded-full bg-[#8B6FC9]/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[460px]">
              <div
                className={`overflow-hidden rounded-[36px] border p-8 backdrop-blur-2xl transition-all duration-500 ${
                  isDark
                    ? 'bg-[#081122]/95 border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.25)]'
                    : 'bg-white border-[#E8E4EF] shadow-[0_16px_50px_rgba(41,38,51,0.08)]'
                }`}
              >
                <div className="mb-6">
                  <h2 className={`text-[28px] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#292633]'}`}>
                    Sign in to Nyra
                  </h2>
                  <p className={`text-xs mt-1.5 ${isDark ? 'text-white/60' : 'text-[#686477]'}`}>
                    Access your cloud conversations and personal AI workspace
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-5 p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-[#292633]'}`}>
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#92909B]'}`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full h-12 pl-10 pr-4 rounded-2xl border text-sm outline-none transition ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:border-sky-400 focus:bg-[#0a1835]'
                            : 'bg-[#F8F7FB] border-[#E8E4EF] text-[#292633] placeholder:text-[#92909B] focus:border-[#8B6FC9] focus:bg-white shadow-inner'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-[#292633]'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#92909B]'}`} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full h-12 pl-10 pr-4 rounded-2xl border text-sm outline-none transition ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:border-sky-400 focus:bg-[#0a1835]'
                            : 'bg-[#F8F7FB] border-[#E8E4EF] text-[#292633] placeholder:text-[#92909B] focus:border-[#8B6FC9] focus:bg-white shadow-inner'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 mt-2 rounded-2xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white font-bold text-sm shadow-[0_8px_24px_rgba(139,111,201,0.25)] hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Continue to Workspace</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#E8E4EF] dark:border-white/10 text-center">
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-[#686477]'}`}>
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[#8B6FC9] font-semibold hover:underline">
                      Create Account
                    </Link>
                  </p>
                  <div className="mt-3">
                    <Link href="/chat-ui" className={`text-[11px] ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#686477] hover:text-[#292633]'} transition`}>
                      ✦ Continue as Guest
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, subtitle, isDark }: any) {
  return (
    <div
      className={`flex items-center gap-4 rounded-3xl border px-5 py-4 backdrop-blur-xl transition-all ${
        isDark
          ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
          : 'border-[#E8E4EF] bg-white shadow-sm'
      }`}
    >
      <div className={`rounded-2xl p-3 ${isDark ? 'bg-white/[0.05] text-white' : 'bg-[#EEE8FA] text-[#8B6FC9]'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#292633]'}`}>{title}</p>
        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#686477]'}`}>{subtitle}</p>
      </div>
    </div>
  );
}