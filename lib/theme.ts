export type ThemeMode = 'dark' | 'light' | 'system';

export function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('theme', theme);

  const isLight =
    theme === 'light' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

  if (isLight) {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return;

  const savedTheme = (localStorage.getItem('theme') as ThemeMode) || 'dark';
  applyTheme(savedTheme);

  // Listen for system theme changes if user selected 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  const handler = () => {
    const currentMode = localStorage.getItem('theme') as ThemeMode;
    if (currentMode === 'system') {
      applyTheme('system');
    }
  };

  try {
    mediaQuery.addEventListener('change', handler);
  } catch {
    mediaQuery.addListener(handler);
  }
}
