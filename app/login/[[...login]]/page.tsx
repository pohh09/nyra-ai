'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#030006] text-white flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-[#E52A83]" />
        </main>
      }
    >
      <AuthCard initialMode="login" />
    </Suspense>
  );
}