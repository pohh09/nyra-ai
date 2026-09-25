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
    <div className="sticky top-3 sm:top-5 z-50 flex flex-col items-center w-full pointer-events-none px-2 sm:px-4">
      <header
        className={`pointer-events-auto flex w-[94%] sm:w-[90%] max-w-[1800px] items-center justify-between rounded-2xl sm:rounded-full border px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all duration-300 backdrop-blur-2xl ${
          isScrolled
            ? 'border-white/[0.08] bg-[#050505]/92 shadow-[0_12px_40px_rgba(0,0,0,0.8)] shadow-black/80'
            : 'border-white/[0.06] bg-[#0A0512]/75 shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
        }`}
      >
        <div className="flex w-full items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-sm border border-pink-500/25 bg-[#16091F] shrink-0 group-hover:border-pink-400/50 transition-colors">
              <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#F5F5F7] group-hover:text-pink-200 transition-colors">
              Nyra AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-[#A7A7B0] hover:text-[#F5F5F7] hover:drop-shadow-[0_0_8px_rgba(255,79,163,0.35)] transition-all duration-200"
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
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-[#F5F5F7] hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer shadow-xs"
                  title="Profile & Account"
                >
                  <UserIcon className="h-3.5 w-3.5 text-pink-300" />
                  <span className="max-w-[80px] sm:max-w-[100px] truncate">
                    {profile?.displayName || user.email?.split('@')[0] || 'Profile'}
                  </span>
                </Link>

                <Link
                  href="/chat-ui"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#801456] hover:from-[#FF4FA3] hover:to-[#B31372] shadow-lg shadow-[#E52A83]/25 hover:shadow-[#E52A83]/40 hover:scale-[1.02] transition-all cursor-pointer border border-[#FF4FA3]/30"
                >
                  <span>Workspace</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-[#F5F5F7] hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5 text-pink-300" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/chat-ui"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 sm:px-4.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#E52A83] via-[#B31372] to-[#801456] hover:from-[#FF4FA3] hover:to-[#B31372] shadow-lg shadow-[#E52A83]/25 hover:shadow-[#E52A83]/40 hover:scale-[1.02] transition-all cursor-pointer border border-[#FF4FA3]/30"
                >
                  <span>Launch Nyra</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#16091F]/80 text-[#F5F5F7] hover:text-white hover:bg-[#24103A] cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto mt-2.5 overflow-hidden md:hidden rounded-3xl border border-white/10 bg-[#07040B]/95 backdrop-blur-2xl p-4 shadow-2xl shadow-black/90 w-full max-w-[1240px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#A7A7B0] hover:bg-[#16091F] hover:text-[#F5F5F7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-pink-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-pink-400/50" />
                </a>
              );
            })}

            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/chat-ui"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] py-2.5 text-xs font-bold text-white shadow-md shadow-[#E52A83]/30"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Open Workspace</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#16091F]/80 py-2.5 text-xs font-semibold text-[#F5F5F7] hover:text-white"
                  >
                    <LogIn className="h-3.5 w-3.5 text-pink-300" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/chat-ui"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E52A83] to-[#B31372] py-2.5 text-xs font-bold text-white shadow-md shadow-[#E52A83]/30"
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


