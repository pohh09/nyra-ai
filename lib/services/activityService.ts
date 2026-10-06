'use client';

export type AuthEventType =
  | 'signup'
  | 'login'
  | 'logout'
  | 'google_login'
  | 'failed_login'
  | 'guest_started'
  | 'guest_limit_reached';

export interface ActivityPayload {
  eventType: AuthEventType;
  userId?: string | null;
  email?: string | null;
  provider?: string;
  metadata?: Record<string, any>;
}

export async function recordAuthActivity(payload: ActivityPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const cleanPayload = {
      eventType: payload.eventType,
      userId: payload.userId || null,
      email: payload.email ? payload.email.trim().toLowerCase() : null,
      provider: payload.provider || 'email',
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: Date.now(),
        ...(payload.metadata || {}),
      },
    };

    fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanPayload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
