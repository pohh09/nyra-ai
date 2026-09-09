'use client';

import { motion } from 'framer-motion';
import NyraLogo from './NyraLogo';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 bg-[#0b0f1a] flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Logo */}
      <NyraLogo />

      {/* Brand name */}
      <motion.h1
        className="mt-6 text-2xl font-semibold text-white tracking-wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        nyra
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-sm text-zinc-400 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Think faster. Build smarter.
      </motion.p>

      {/* Animated dots */}
      <div className="flex gap-1 mt-6">
        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </motion.div>
  );
}