'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CinematicIntro3D from '@/components/landing/CinematicIntro3D';

/**
 * AppStartupIntro controls the application-wide startup intro sequence.
 * It plays on initial app launch, page refresh, and installed PWA launch.
 * It does NOT replay on internal client-side navigation between pages because
 * root layout remains mounted.
 */
export default function AppStartupIntro() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Safety fallback: ensure intro finishes and unmounts even if browser throttles RAF
    const timer = setTimeout(() => {
      setShowIntro(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nyra:intro-complete'));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = useCallback(() => {
    setShowIntro(false);
    // Notify any page listeners (e.g. landing page hero orchestrations)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nyra:intro-complete'));
    }
  }, []);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#030006] pointer-events-auto">
      {mounted ? (
        <CinematicIntro3D onComplete={handleComplete} />
      ) : (
        <div className="fixed inset-0 z-[99999] bg-[#030006]" />
      )}
    </div>
  );
}
