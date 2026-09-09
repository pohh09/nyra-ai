import { UserPreferences } from './types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  accentColor: 'blue',
  fontSize: 'normal',
  defaultModel: 'qwen/qwen3.6-27b',
  voiceRate: 1,
};

const PREFERENCES_KEY = 'nyra_user_preferences';

export function loadLocalPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      // Migrate legacy separate keys if present
      const theme = (localStorage.getItem('theme') as any) || 'dark';
      const accentColor = localStorage.getItem('nyra_accent') || 'blue';
      const fontSize = (localStorage.getItem('nyra_font_size') as any) || 'normal';
      const defaultModel = localStorage.getItem('nyra_selected_model') || 'qwen/qwen3.6-27b';
      const voiceName = localStorage.getItem('nyra_selected_voice') || undefined;
      const voiceRateRaw = localStorage.getItem('nyra_voice_rate');
      const voiceRate = voiceRateRaw ? parseFloat(voiceRateRaw) : 1;

      return {
        theme,
        accentColor,
        fontSize,
        defaultModel,
        voiceName,
        voiceRate,
      };
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load local preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}

export function saveLocalPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = loadLocalPreferences();
    const updated: UserPreferences = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));

    // Also mirror to legacy keys for compatibility
    if (prefs.theme) {
      localStorage.setItem('theme', prefs.theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(prefs.theme === 'system' ? 'dark' : prefs.theme);
      document.documentElement.setAttribute('data-theme', prefs.theme);
    }
    if (prefs.accentColor) {
      localStorage.setItem('nyra_accent', prefs.accentColor);
      document.documentElement.setAttribute('data-accent', prefs.accentColor);
    }
    if (prefs.fontSize) {
      localStorage.setItem('nyra_font_size', prefs.fontSize);
    }
    if (prefs.defaultModel) {
      localStorage.setItem('nyra_selected_model', prefs.defaultModel);
    }
    if (prefs.voiceName) {
      localStorage.setItem('nyra_selected_voice', prefs.voiceName);
    }
    if (prefs.voiceRate) {
      localStorage.setItem('nyra_voice_rate', String(prefs.voiceRate));
    }

    return updated;
  } catch (err) {
    console.error('Failed to save local preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}
