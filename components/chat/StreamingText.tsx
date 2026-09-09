'use client';

import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  streaming: boolean;
};

export default function StreamingText({ children, streaming }: Props) {
  return (
    <>
      {children}
      {streaming && (
        <motion.span
          className="inline-block w-[2px] h-4 ml-1 rounded-full bg-sky-400 align-middle shadow-[0_0_8px_rgba(56,189,248,0.85)]"
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
          }}
        />
      )}
    </>
  );
}