
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics: ${event}]`, metadata || {});
    }

    if ((window as any).va) {
      (window as any).va('event', { name: event, data: metadata });
    }
  } catch {}
}
