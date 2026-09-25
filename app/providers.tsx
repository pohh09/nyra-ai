'use client';

import React, { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { initTheme } from '@/lib/theme';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initTheme();

    const savedAccent = localStorage.getItem('nyra_accent') || 'purple';
    document.documentElement.setAttribute('data-accent', savedAccent);

    const savedFontSize = localStorage.getItem('nyra_font_size') || 'normal';
    document.documentElement.setAttribute('data-font-size', savedFontSize);
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}