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

    const savedAccent = localStorage.getItem('nyra_accent') || 'blue';
    document.documentElement.setAttribute('data-accent', savedAccent);
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}