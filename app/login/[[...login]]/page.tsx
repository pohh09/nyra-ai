'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const { signIn, signInWithGoogle, startGuest, user, profile, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'oauth_failed' ? 'Google authentication failed. Please try again.' : null
  );

  useEffect(() => {
    if (user && !authLoading) {
      if (profile && !profile.onboardingCompleted) {
        router.push('/onboarding');
      } else if (profile?.onboardingCompleted) {
        const dest = redirectParam && redirectParam !== '/onboarding' ? redirectParam : '/chat-ui';
        router.push(dest);
      }
    }
  }, [user, profile, authLoading, router, redirectParam]);

  const handleContinueAsGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    startGuest();
    addToast({ type: 'info', title: 'Welcome to Nyra AI (Guest Mode)' });
    router.push('/chat-ui');
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google Sign-In failed');
        addToast({ type: 'error', title: res.error || 'Google Sign-In failed' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await signIn(cleanEmail, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials or user not found.');
        addToast({ type: 'error', title: res.error || 'Authentication failed' });
      } else {
        addToast({ type: 'success', title: 'Welcome back to Nyra AI' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633] flex items-center justify-center p-4 sm:p-6 selection:bg-[#8B6FC9]/30 transition-colors">
      {/* Subtle ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 dark:opacity-[0.03] opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(139,111,201,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,111,201,0.2) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#8B6FC9]/10 blur-[150px]" />
      </div>

      {/* CENTERED CLEAN AUTH CARD */}
      <div className="relative z-10 w-full max-w-[440px] dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_24px_rgba(139,111,201,0.35)] mb-3.5 ring-1 ring-purple-400/30 border border-white/10 bg-[#120726]">
            <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" priority />
          </div>
          <span className="text-xs font-bold tracking-wider dark:text-purple-300 text-purple-700 uppercase mb-1">Nyra</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-[#292633]">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm dark:text-white/50 text-[#686477] mt-1">
            Sign in to continue to Nyra
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* EMAIL & PASSWORD FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/80 text-[#292633] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-11 px-3.5 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.04] bg-[#F5F3F9] focus:bg-white dark:focus:bg-white/[0.06] text-sm dark:text-white text-[#292633] dark:placeholder:text-white/25 placeholder:text-[#686477]/60 focus:border-[#8B6FC9] focus:outline-none focus:ring-1 focus:ring-[#8B6FC9] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-white/80 text-[#292633] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 pl-3.5 pr-10 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.04] bg-[#F5F3F9] focus:bg-white dark:focus:bg-white/[0.06] text-sm dark:text-white text-[#292633] dark:placeholder:text-white/25 placeholder:text-[#686477]/60 focus:border-[#8B6FC9] focus:outline-none focus:ring-1 focus:ring-[#8B6FC9] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-white/40 text-[#686477] dark:hover:text-white hover:text-[#292633] transition cursor-pointer"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* PRIMARY BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full h-11 mt-2 rounded-xl dark:bg-white bg-[#292633] dark:hover:bg-white/90 hover:bg-[#1f1c27] dark:text-[#07090F] text-white font-semibold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-white dark:text-[#07090F]" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isGoogleLoading}
            className="w-full h-11 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.04] bg-white dark:hover:bg-white/[0.08] hover:bg-[#F5F3F9] dark:text-white text-[#292633] text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isGoogleLoading ? (
              <Loader2 size={16} className="animate-spin text-purple-600 dark:text-purple-300" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t dark:border-white/10 border-[#E8E4EF]" />
          <span className="absolute px-3 text-[11px] uppercase tracking-wider dark:text-white/40 text-[#686477] dark:bg-[#0A0C14] bg-white">
            OR
          </span>
        </div>

        {/* FOOTER LINKS */}
        <div className="text-center space-y-3">
          <p className="text-xs dark:text-white/50 text-[#686477]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="dark:text-white text-[#292633] font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <div>
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="text-xs font-semibold dark:text-purple-300 text-purple-700 hover:text-purple-900 dark:hover:text-white transition cursor-pointer hover:underline"
            >
              ✦ Continue as Guest
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633] flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </main>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}