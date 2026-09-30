'use client';

import { motion } from 'framer-motion';
import { NyraIcon } from '@/components/brand/NyraIcon';

export default function NyraLogo({ size = 80 }: { size?: number }) {
  const iconSize = Math.round(size * 0.65);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Rotating ambient glow ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-pink-500/30"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      />

      {/* Inner radial aura */}
      <div className="absolute inset-2 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-600/20 to-cyan-500/20 blur-xl" />

      {/* Distinctive Nyra Brand Vector Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-center"
      >
        <NyraIcon size={iconSize} variant="primary" glow />
      </motion.div>
    </div>
  );
}