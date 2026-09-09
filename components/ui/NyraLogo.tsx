'use client';

import { motion } from 'framer-motion';

export default function NyraLogo({ size = 80 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Rotating glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-sky-400/30"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
      />

      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-sky-500/15 blur-xl" />

      {/* Logo text */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 font-bold text-4xl"
      >
        N
      </motion.div>
    </div>
  );
}