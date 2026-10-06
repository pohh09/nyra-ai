'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CinematicIntro3D from '@/components/landing/CinematicIntro3D';

export default function AppStartupIntro() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setMounted(true);

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
