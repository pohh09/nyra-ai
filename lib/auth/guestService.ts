'use client';

export const GUEST_MESSAGE_LIMIT = 5;
export const GUEST_FLAG_KEY = 'nyra_is_guest';
export const GUEST_COUNT_KEY = 'nyra_guest_message_count';
export const GUEST_CHAT_KEY = 'nyra_chats_guest';

export function isGuestSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(GUEST_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function startGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_FLAG_KEY, 'true');
    localStorage.removeItem(GUEST_CHAT_KEY);
    localStorage.setItem(GUEST_COUNT_KEY, '0');
    try {
      sessionStorage.removeItem('nyra_initial_prompt');
    } catch { }

    if (typeof document !== 'undefined') {
      document.cookie = `${GUEST_FLAG_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
    }
  } catch (e) {
    console.error('Failed to initialize guest session:', e);
  }
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_FLAG_KEY);
    localStorage.removeItem(GUEST_CHAT_KEY);
    if (typeof document !== 'undefined') {
      document.cookie = `${GUEST_FLAG_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {
    console.error('Failed to clear guest session:', e);
  }
}

export function getGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(GUEST_COUNT_KEY);
    const count = parseInt(val || '0', 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

export function incrementGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getGuestMessageCount();
    const next = current + 1;
    localStorage.setItem(GUEST_COUNT_KEY, next.toString());
    return next;
  } catch {
    return 0;
  }
}

export function isGuestLimitReached(): boolean {
  return getGuestMessageCount() >= GUEST_MESSAGE_LIMIT;
}

export function getRemainingGuestMessages(): number {
  return Math.max(0, GUEST_MESSAGE_LIMIT - getGuestMessageCount());
}
