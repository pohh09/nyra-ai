'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NyraOrb({ size }: { size?: number } = {}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [blink, setBlink] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll();
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 900]);

  // Head tilt (spring physics, never snaps)
  const rotateX = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(mouseX, { stiffness: 120, damping: 18 });

  // Eye tracking — derived transforms, not stale .get() reads
  const eyeX = useSpring(useTransform(mouseX, (v) => v * 0.35), {
    stiffness: 220,
    damping: 14,
  });
  const eyeY = useSpring(useTransform(mouseY, (v) => v * 0.35), {
    stiffness: 220,
    damping: 14,
  });
  const smileX = useSpring(useTransform(mouseX, (v) => v * 0.18), {
    stiffness: 180,
    damping: 16,
  });

  useEffect(() => {
    setMounted(true);

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * -18;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  // Random natural blinking, 4–7s intervals, 120–180ms duration
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 3000;
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120 + Math.random() * 60);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="relative flex items-center justify-center w-full h-full"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: [0, -18, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        rotateX,
        rotateY,
        y: scrollY,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* ========= BACK GLOW ========= */}
      <motion.div
        animate={{
          scale: hovered ? [1.08, 1.16, 1.08] : [1, 1.12, 1],
          opacity: hovered ? [0.7, 0.95, 0.7] : [0.55, 0.85, 0.55],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute
          h-[520px]
          w-[520px]
          rounded-full
          blur-[150px]
          bg-gradient-to-br
          from-purple-600/40
          via-violet-400/25
          to-fuchsia-300/20
        "
      />

      {/* ========= ORB ========= */}
      <motion.div
        animate={{
          scale: hovered ? [1.02, 1.06, 1.02] : [1, 1.02, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.04 }}
        className="
          relative
          h-[380px]
          w-[380px]
          rounded-full
          overflow-hidden
          shadow-[0_50px_120px_rgba(120,87,255,.35)]
        "
      >
        {/* Main Gradient */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 28% 18%,
              #ffffff 0%,
              #f8f4ff 12%,
              #ece6ff 24%,
              #d8c7ff 40%,
              #b996ff 60%,
              #9d7dff 78%,
              #f2a7d5 100%)
            `,
          }}
        />

        {/* Soft Rim */}
        <div className="absolute inset-2 rounded-full border border-white/40" />

        {/* Large Reflection */}
        <motion.div
          animate={{ x: [-6, 8, -6], y: [-3, 6, -3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-12 top-10 h-44 w-28 rounded-full bg-white/50 blur-2xl"
        />

        {/* Reflection 2 */}
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-16 top-16 h-16 w-16 rounded-full bg-white/30 blur-xl"
        />

        {/* Reflection 3 */}
        <div className="absolute left-24 bottom-20 h-8 w-20 rounded-full bg-white/10 blur-xl" />

        {/* Glass Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 via-transparent to-black/5" />

        {/* Inner Light */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/10 to-transparent" />

        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Moving Glass Shine */}
        <motion.div
          animate={{
            rotate: [0, 8, -5, 0],
            x: [-10, 18, -10],
            opacity: hovered ? [0.5, 0.8, 0.5] : [0.35, 0.6, 0.35],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-10 top-0 h-[260px] w-[90px] rounded-full bg-white/20 blur-3xl rotate-12"
        />

        {/* Inner Glow */}
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-10 rounded-full bg-gradient-to-br from-sky-300/40 via-cyan-200/10 to-transparent blur-2xl"
        />

        {/* ================= FACE ================= */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* LEFT EYE */}
          <motion.div
            className="absolute left-[29%] top-[41%]"
            style={{ x: eyeX, y: eyeY, scaleY: blink ? 0.08 : 1 }}
          >
            <svg width="52" height="24" viewBox="0 0 52 24" fill="none">
              <path
                d="M6 12C14 21 38 21 46 12"
                stroke="#1F2156"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* RIGHT EYE */}
          <motion.div
            className="absolute right-[29%] top-[41%]"
            style={{ x: eyeX, y: eyeY, scaleY: blink ? 0.08 : 1 }}
          >
            <svg width="52" height="24" viewBox="0 0 52 24" fill="none">
              <path
                d="M6 12C14 21 38 21 46 12"
                stroke="#1F2156"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* SMILE */}
          <motion.div
            className="absolute left-1/2 top-[58%] -translate-x-1/2"
            style={{ x: smileX }}
            animate={{
              y: [0, 2, 0],
              scaleX: hovered ? [1.05, 1.12, 1.05] : [1, 1.05, 1],
              scaleY: hovered ? [1.05, 1.1, 1.05] : [1, 1, 1],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="90" height="40" viewBox="0 0 90 40" fill="none">
              <path
                d="M15 12C28 33 62 33 75 12"
                stroke="#1F2156"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* LEFT CHEEK */}
          <motion.div
            animate={{ opacity: hovered ? [0.28, 0.45, 0.28] : [0.18, 0.32, 0.18] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute left-[24%] top-[56%] h-8 w-8 rounded-full bg-pink-300 blur-xl"
          />

          {/* RIGHT CHEEK */}
          <motion.div
            animate={{ opacity: hovered ? [0.28, 0.45, 0.28] : [0.18, 0.32, 0.18] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute right-[24%] top-[56%] h-8 w-8 rounded-full bg-pink-300 blur-xl"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}