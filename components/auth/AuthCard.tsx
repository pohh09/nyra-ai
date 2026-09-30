'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  User,
  Lock,
  ArrowRight,
  Zap,
  Bot,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { NyraIcon } from '@/components/brand/NyraIcon';

interface AuthCardProps {
  initialMode?: 'login' | 'signup';
}

export function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const { signIn, signUp, signInWithGoogle, startGuest, user, profile, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isDesktop, setIsDesktop] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'oauth_failed' ? 'Google authentication failed. Please try again.' : null
  );

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      if (profile && !profile.onboardingCompleted) {
        router.replace('/onboarding');
      } else if (profile?.onboardingCompleted) {
        const dest = redirectParam && redirectParam !== '/onboarding' ? redirectParam : '/chat-ui';
        router.replace(dest);
      }
    }
  }, [user, profile, authLoading, router, redirectParam]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMsg(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/signup');
    }
  };

  const handleContinueAsGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    startGuest();
    addToast({ type: 'info', title: 'Welcome to Nyra AI (Guest Mode)' });
    router.replace('/chat-ui');
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google Authentication failed');
        addToast({ type: 'error', title: res.error || 'Google Authentication failed' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await signIn(cleanEmail, loginPassword);
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !signupPassword) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    const cleanEmail = signupEmail.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await signUp(cleanEmail, signupPassword, signupName.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please try a different email.');
        addToast({ type: 'error', title: res.error || 'Signup failed' });
      } else {
        addToast({ type: 'success', title: 'Account created! Welcome to Nyra AI' });
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: 'spring',
        stiffness: 220,
        damping: 26,
        mass: 0.85,
      };

  // 50/50 split horizontal exchange on desktop
  const formX = isDesktop && mode === 'signup' ? 'calc(100% + 2rem)' : 0;
  const themeX = isDesktop && mode === 'signup' ? 'calc(-100% - 2rem)' : 0;

  return (
    <main className="relative min-h-screen w-full bg-[#030006] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none selection:bg-[#E52A83]/30 overflow-x-hidden">
      {/* Ambient Depth Glows */}
      <div className="pointer-events-none absolute -top-48 -left-48 w-[850px] h-[850px] bg-gradient-to-br from-[#E52A83]/18 via-[#B31372]/12 to-transparent rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 w-[850px] h-[850px] bg-gradient-to-tl from-[#9333EA]/20 via-[#7928CA]/12 to-transparent rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1150px] h-[750px] bg-gradient-to-tr from-[#E52A83]/09 via-[#9333EA]/09 to-[#3B82F6]/06 rounded-full blur-[200px]" />

      {/* Subtle Matrix Dot Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />

      {/* Stable Two-Panel Shell Container (Exact matching 1140px width & 700px height for both modes) */}
      <div className="relative z-10 w-full max-w-[1140px] min-h-[660px] lg:h-[700px] bg-[#0A0515]/95 rounded-[30px] shadow-[0_30px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(229,42,131,0.12)] p-4 sm:p-6 lg:p-8 border border-white/[0.1] backdrop-blur-2xl overflow-hidden flex flex-col justify-center animate-in fade-in duration-500">
        
        {/* Top Highlight Hairline */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E52A83]/45 to-transparent pointer-events-none" />

        {/* 2-Panel Layout Track with 50/50 Balance & Locked Height */}
        <div className="relative flex flex-col lg:flex-row items-stretch w-full h-full lg:h-[636px] gap-6 lg:gap-8">
          
          {/* ========================================================= */}
          {/* PANEL A: AUTH CONTENT PANEL (Form Side - 50% width)       */}
          {/* ========================================================= */}
          <motion.div
            animate={{ x: formX }}
            transition={slideTransition}
            className="w-full lg:w-[calc(50%-1rem)] h-full flex flex-col justify-between px-3 sm:px-7 lg:px-8 py-1 shrink-0"
          >
            <div className="w-full">
              
              {/* Header: Brand and Mode Switcher */}
              <div className="flex items-center justify-between mb-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 group focus:outline-none cursor-pointer"
                  title="Return to Nyra AI Home"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#140A24] border border-pink-500/30 shadow-[0_0_20px_rgba(229,42,131,0.25)] flex items-center justify-center group-hover:border-pink-500/60 group-hover:scale-105 transition-all">
                    <NyraIcon size={22} variant="primary" glow />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[17px] font-bold tracking-tight text-white group-hover:text-pink-300 transition-colors">
                      Nyra AI
                    </span>
                    <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#E52A83] uppercase -mt-0.5">
                      Workspace
                    </span>
                  </div>
                </Link>

                {/* Segmented Control Pill */}
                <div className="inline-flex h-[38px] p-1 rounded-xl bg-white/[0.05] border border-white/[0.1] shadow-inner">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] text-white shadow-md'
                        : 'text-[#A7A7B0] hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-[#E52A83] to-[#B31372] text-white shadow-md'
                        : 'text-[#A7A7B0] hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Title & Subtitle with smooth cross-fade */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5"
                >
                  <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white">
                    {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
                  </h1>
                  <p className="text-[13px] sm:text-[13.5px] text-[#A7A7B0] mt-1.5 font-normal leading-relaxed">
                    {mode === 'login'
                      ? 'Sign in to access your models, persistent memory, and research tools.'
                      : 'Join thousands of builders researching and creating with Nyra AI.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-3.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs sm:text-sm text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Form Content with Cross-Fade */}
              <AnimatePresence mode="wait" initial={false}>
                {mode === 'login' ? (
                  /* ==================== LOGIN FORM ==================== */
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs sm:text-[13px] font-semibold text-white/95 mb-1.5 tracking-wide">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                          <Mail size={18} className="text-white/40" />
                        </div>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full h-[50px] pl-12 pr-4 rounded-xl border border-white/12 bg-white/[0.04] text-sm sm:text-[14.5px] text-white placeholder:text-white/35 focus:border-[#E52A83] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E52A83]/25 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs sm:text-[13px] font-semibold text-white/95 tracking-wide">
                          Password
                        </label>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            addToast({
                              type: 'info',
                              title: 'Password Reset',
                              description: 'Please contact support or enter your registered email to receive a password reset link.',
                            });
                          }}
                          className="text-xs sm:text-[12.5px] text-pink-400 hover:text-pink-300 hover:underline transition font-medium"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                          <Lock size={18} className="text-white/40" />
                        </div>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-[50px] pl-12 pr-12 rounded-xl border border-white/12 bg-white/[0.04] text-sm sm:text-[14.5px] text-white placeholder:text-white/35 focus:border-[#E52A83] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E52A83]/25 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 p-1 text-white/40 hover:text-white transition cursor-pointer"
                          tabIndex={-1}
                          aria-label="Toggle password visibility"
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center pt-0.5">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#E52A83] focus:ring-[#E52A83] cursor-pointer accent-[#E52A83]"
                        />
                        <span className="text-xs sm:text-[13px] text-[#A7A7B0]">
                          Remember session for 30 days
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[50px] mt-1 rounded-xl bg-gradient-to-r from-[#E52A83] via-[#D11E73] to-[#9333EA] hover:opacity-95 text-white font-bold text-sm sm:text-[14.5px] tracking-wide shadow-[0_4px_22px_rgba(229,42,131,0.38)] hover:shadow-[0_6px_28px_rgba(229,42,131,0.52)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-white" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Enter Nyra</span>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* ==================== SIGNUP FORM ==================== */
                  <motion.form
                    key="signup-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleSignupSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs sm:text-[13px] font-semibold text-white/95 mb-1.5 tracking-wide">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                          <User size={18} className="text-white/40" />
                        </div>
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full h-[50px] pl-12 pr-4 rounded-xl border border-white/12 bg-white/[0.04] text-sm sm:text-[14.5px] text-white placeholder:text-white/35 focus:border-[#E52A83] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E52A83]/25 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-semibold text-white/95 mb-1.5 tracking-wide">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                          <Mail size={18} className="text-white/40" />
                        </div>
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full h-[50px] pl-12 pr-4 rounded-xl border border-white/12 bg-white/[0.04] text-sm sm:text-[14.5px] text-white placeholder:text-white/35 focus:border-[#E52A83] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E52A83]/25 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-semibold text-white/95 mb-1.5 tracking-wide">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                          <Lock size={18} className="text-white/40" />
                        </div>
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full h-[50px] pl-12 pr-12 rounded-xl border border-white/12 bg-white/[0.04] text-sm sm:text-[14.5px] text-white placeholder:text-white/35 focus:border-[#E52A83] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E52A83]/25 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3.5 p-1 text-white/40 hover:text-white transition cursor-pointer"
                          tabIndex={-1}
                          aria-label="Toggle password visibility"
                        >
                          {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#E52A83] focus:ring-[#E52A83] cursor-pointer accent-[#E52A83]"
                        />
                        <span className="text-xs sm:text-[13px] text-[#A7A7B0]">
                          I agree to Terms of Service & Privacy Policy
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[50px] mt-1 rounded-xl bg-gradient-to-r from-[#E52A83] via-[#D11E73] to-[#9333EA] hover:opacity-95 text-white font-bold text-sm sm:text-[14.5px] tracking-wide shadow-[0_4px_22px_rgba(229,42,131,0.38)] hover:shadow-[0_6px_32px_rgba(229,42,131,0.52)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-white" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <span>Enter Nyra</span>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Clean Visible Divider */}
              <div className="relative flex items-center justify-center my-3.5">
                <div className="w-full border-t border-white/10" />
                <span className="absolute px-3 text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#7E778E] bg-[#0A0515]">
                  or instant access
                </span>
              </div>

              {/* Guest Instant Access Button */}
              <div>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="w-full h-[48px] rounded-xl border border-pink-500/35 bg-gradient-to-r from-pink-500/12 via-purple-500/08 to-transparent hover:from-pink-500/22 hover:via-purple-500/15 hover:border-pink-500/60 text-pink-200 hover:text-white font-semibold text-xs sm:text-[13.5px] flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-[0_0_15px_rgba(229,42,131,0.1)]"
                >
                  <Sparkles size={15} className="text-[#FF4FA3]" />
                  <span>Continue as Guest</span>
                  <span className="text-[11px] text-pink-300/80 font-normal hidden sm:inline">· Instant Access</span>
                </button>
              </div>

              {/* Mode Toggle Footer Link */}
              <div className="text-center text-xs sm:text-[13px] text-[#A7A7B0] mt-3.5">
                {mode === 'login' ? (
                  <span>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-bold text-pink-400 hover:text-pink-300 hover:underline transition cursor-pointer"
                    >
                      Create an account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-pink-400 hover:text-pink-300 hover:underline transition cursor-pointer"
                    >
                      Sign in to workspace
                    </button>
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* PANEL B: NYRA THEME PANEL (Visual Side - 50% width)       */}
          {/* ========================================================= */}
          <motion.div
            animate={{ x: themeX }}
            transition={slideTransition}
            className="hidden lg:flex lg:w-[calc(50%-1rem)] h-full relative rounded-[24px] overflow-hidden bg-gradient-to-b from-[#14072A]/90 via-[#0B0218]/95 to-[#04010A] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] select-none shrink-0 relative group"
          >
            {/* 3D Wave SVG Background Visual */}
            <svg
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              viewBox="0 0 520 680"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="authAtmosphereBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="30" result="blur" />
                </filter>
                <filter id="authCrestBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                </filter>

                <linearGradient id="authRibbonGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#24103A" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#B31372" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#E52A83" stopOpacity="1" />
                  <stop offset="75%" stopColor="#FF4FA3" stopOpacity="1" />
                  <stop offset="90%" stopColor="#F43F5E" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#050505" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="authDeepCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E0A2D" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#2E1045" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#14051D" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#05010A" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="authHotCrestLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B31372" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#E52A83" stopOpacity="1" />
                  <stop offset="65%" stopColor="#FF4FA3" stopOpacity="1" />
                  <stop offset="90%" stopColor="#FFA6CB" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.95" />
                </linearGradient>

                <radialGradient id="authCenterGlow" cx="60%" cy="35%" r="55%">
                  <stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.35" />
                  <stop offset="40%" stopColor="#B31372" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="#16091F" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#05010A" stopOpacity="0.95" />
                </radialGradient>
              </defs>

              <rect width="520" height="680" fill="#080214" />
              <circle cx="340" cy="240" r="320" fill="url(#authCenterGlow)" />

              <path
                d="M 120 -40 C 360 40, 540 220, 500 460 C 460 700, 220 700, 90 640 L 560 700 L 560 -40 Z"
                fill="url(#authDeepCurveGrad)"
              />

              <path
                d="M 240 -20 C 190 200, 260 360, 110 500 C 30 580, -20 640, -50 700 L -50 -20 Z"
                fill="url(#authRibbonGrad)"
                filter="url(#authAtmosphereBlur)"
                opacity="0.85"
              />

              <path
                d="M 240 -20 C 190 200, 260 360, 110 500 C 30 580, -20 640, -50 700 L -50 -20 Z"
                fill="url(#authRibbonGrad)"
              />

              <path
                d="M 460 140 C 350 200, 190 340, 270 500 C 330 620, 430 660, 530 680 L 530 140 Z"
                fill="#070212"
                opacity="0.95"
              />

              <path
                d="M 240 -20 C 190 200, 260 360, 110 500"
                stroke="url(#authHotCrestLine)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                filter="url(#authCrestBlur)"
              />
              <path
                d="M 240 -20 C 190 200, 260 360, 110 500"
                stroke="url(#authHotCrestLine)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </motion.div>

        </div>

      </div>
    </main>
  );
}
