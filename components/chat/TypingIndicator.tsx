'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2 py-1 select-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-[#8B6FC9] dark:bg-purple-400 rounded-full shadow-[0_0_6px_rgba(139,111,201,0.5)]"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.16,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}