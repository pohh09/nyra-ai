/**
 * Privacy-Preserving Product Analytics for Nyra AI
 * Tracks user interaction milestones without recording private prompts, messages, or files.
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'launch_app_click'
  | 'chat_created'
  | 'message_sent'
  | 'web_search_toggled'
  | 'image_attached'
  | 'pdf_attached'
  | 'voice_stt_used'
  | 'voice_tts_used'
  | 'prompt_used'
  | 'chat_exported'
  | 'conversation_shared'
  | 'model_switched';

export function trackEvent(event: AnalyticsEvent, metadata?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  try {
    // Only log high-level event names and safe metadata (e.g. model name, count)
    // Never include user prompt text, document contents, or private keys
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics: ${event}]`, metadata || {});
    }

    // Custom window analytics hook if configured (e.g. Vercel Analytics / Plausible / Custom)
    if ((window as any).va) {
      (window as any).va('event', { name: event, data: metadata });
    }
  } catch {
    // Fail silently without disrupting user experience
  }
}
