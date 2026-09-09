'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  LogIn,
  Menu,
  X,
  Terminal,
  Layers,
  HelpCircle,
  Globe,
  ArrowRight,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarRevealProps {
  isIntroComplete?: boolean;
  isScrolled?: boolean;
  onReplayIntro?: () => void;
}

export default function NavbarReveal({ isScrolled = false }: NavbarRevealProps) {
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Streamlined, high-value nav items
  const navItems = [
    { label: 'Features', href: '#features', icon: Sparkles },
    { label: 'Workspace', href: '#desktop-workspace', icon: Terminal },
    { label: 'Use Cases', href: '#use-cases', icon: Layers },
    { label: 'FAQ', href: '#faq', icon: HelpCircle },
    { label: 'About', href: '/about', icon: Globe },
  ];

  return (
    <div className="sticky top-3 sm:top-5 z-50 flex flex-col items-center w-full pointer-events-none px-3 sm:px-6">
      <header
        className={`pointer-events-auto flex w-full max-w-[1240px] items-center justify-between rounded-2xl sm:rounded-full border px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all duration-300 backdrop-blur-2xl ${
          isScrolled
            ? 'border-purple-400/30 bg-[#120726]/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-purple-950/40'
            : 'border-purple-400/20 bg-[#170A2E]/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
        }`}
      >
        <div className="flex w-full items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-sm border border-purple-400/30 bg-purple-950/50 shrink-0 group-hover:border-purple-400/60 transition-colors">
              <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              Nyra AI
            </span>
          </Link>

          {/* Desktop Nav Links (Clean, No Nested Inner Pill) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-purple-200/80 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {user ? (
              <>
                <Link
                  href="/chat-ui"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-purple-400/25 transition-all cursor-pointer shadow-xs"
                  title="Profile & Account"
                >
                  <UserIcon className="h-3.5 w-3.5 text-purple-300" />
                  <span className="max-w-[80px] sm:max-w-[100px] truncate">
                    {profile?.displayName || user.email?.split('@')[0] || 'Profile'}
                  </span>
                </Link>

                <Link
                  href="/chat-ui"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] shadow-md shadow-purple-950/50 hover:shadow-purple-700/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Workspace</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-purple-400/25 transition-all cursor-pointer shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5 text-purple-300" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/chat-ui"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 sm:px-4.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] shadow-md shadow-purple-950/50 hover:shadow-purple-700/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Launch Nyra</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/60 cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto mt-2.5 overflow-hidden md:hidden rounded-3xl border border-purple-400/30 bg-[#14082B]/95 backdrop-blur-2xl p-4 shadow-2xl shadow-black/80 w-full max-w-[1240px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-purple-200/90 hover:bg-purple-900/40 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-purple-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-purple-400/50" />
                </a>
              );
            })}

            <div className="mt-3 pt-3 border-t border-purple-500/20 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/chat-ui"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] py-2.5 text-xs font-bold text-white shadow-md shadow-purple-950/60"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Open Workspace</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/25 bg-purple-950/40 py-2.5 text-xs font-semibold text-purple-200 hover:text-white"
                  >
                    <LogIn className="h-3.5 w-3.5 text-purple-300" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/chat-ui"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] py-2.5 text-xs font-bold text-white shadow-md shadow-purple-950/60"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


