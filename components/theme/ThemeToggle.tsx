'use client';

import {
  Moon,
  Sun,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

export default function ThemeToggle() {

  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState<'light' | 'dark'>(
      'dark'
    );

  useEffect(() => {

    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        'theme'
      ) as 'light' | 'dark' | null;

    const currentTheme =
      savedTheme || 'dark';

    setTheme(currentTheme);

  }, []);

  const toggleTheme = () => {

    const newTheme =
      theme === 'dark'
        ? 'light'
        : 'dark';

    setTheme(newTheme);

    localStorage.setItem(
      'theme',
      newTheme
    );

    document.documentElement.classList.remove(
      'light',
      'dark'
    );

    document.documentElement.classList.add(
      newTheme
    );
  };

  if (!mounted) {
    return null;
  }

  return (

    <button
      onClick={toggleTheme}

      className="
        w-10 h-10

        rounded-2xl

        border
        border-black/5
        dark:border-white/10

        bg-white/70
        dark:bg-white/[0.05]

        backdrop-blur-2xl

        shadow-lg

        flex items-center justify-center

        transition-all duration-300
      "
    >

      {theme === 'dark' ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}

    </button>

  );
}