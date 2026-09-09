import { NextResponse } from 'next/server';
import { isProviderConfigured, DEFAULT_MODEL_ID, USER_FACING_MODELS } from '@/lib/ai/models';

export async function GET() {
  const configuredProviders = {
    groq: isProviderConfigured('groq'),
    openai: isProviderConfigured('openai'),
    anthropic: isProviderConfigured('anthropic'),
    gemini: isProviderConfigured('gemini'),
    openrouter: isProviderConfigured('openrouter'),
  };

  const availableModels = USER_FACING_MODELS.filter(
    (m) => configuredProviders[m.provider]
  );

  return NextResponse.json({
    configuredProviders,
    defaultModelId: configuredProviders['groq'] ? DEFAULT_MODEL_ID : availableModels[0]?.id || DEFAULT_MODEL_ID,
    availableModels,
  });
}
