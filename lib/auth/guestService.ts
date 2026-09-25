'use client';

export const GUEST_MESSAGE_LIMIT = 5;
export const GUEST_FLAG_KEY = 'nyra_is_guest';
export const GUEST_COUNT_KEY = 'nyra_guest_message_count';
export const GUEST_CHAT_KEY = 'nyra_chats_guest';

/**
 * Check if the current browser session is in guest mode.
 */
export function isGuestSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(GUEST_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Start or continue a fresh guest session.
 * Purges any previous guest conversations so new guests start with a clean slate.
 */
export function startGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_FLAG_KEY, 'true');
    // Fresh guest session: clear old guest chats & reset message count so new guests start completely fresh
    localStorage.removeItem(GUEST_CHAT_KEY);
    localStorage.setItem(GUEST_COUNT_KEY, '0');
    // Clear session storage prompt cache
    try {
      sessionStorage.removeItem('nyra_initial_prompt');
    } catch { }

    // Set cookie so middleware detects guest session
    if (typeof document !== 'undefined') {
      document.cookie = `${GUEST_FLAG_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
    }
  } catch (e) {
    console.error('Failed to initialize guest session:', e);
  }
}

/**
 * Clear all guest flags and temporary guest data.
 */
export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_FLAG_KEY);
    localStorage.removeItem(GUEST_CHAT_KEY);
    // Remove cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${GUEST_FLAG_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {
    console.error('Failed to clear guest session:', e);
  }
}

/**
 * Retrieve current user message count for the guest session.
 */
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

/**
 * Increment the guest message count by 1 and return the updated count.
 */
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

/**
 * Returns true if the guest has used all 5 free messages.
 */
export function isGuestLimitReached(): boolean {
  return getGuestMessageCount() >= GUEST_MESSAGE_LIMIT;
}

/**
 * Returns remaining guest messages (0 to 5).
 */
export function getRemainingGuestMessages(): number {
  return Math.max(0, GUEST_MESSAGE_LIMIT - getGuestMessageCount());
}
