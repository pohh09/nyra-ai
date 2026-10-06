import { NextResponse } from 'next/server';
import {
  isProviderConfigured,
  USER_FACING_MODELS,
  AI_MODELS,
  resolveActiveModelConfig,
} from '@/lib/ai/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const configuredProviders = {
    groq: isProviderConfigured('groq'),
    openai: isProviderConfigured('openai'),
    anthropic: isProviderConfigured('anthropic'),
    gemini: isProviderConfigured('gemini'),
    openrouter: isProviderConfigured('openrouter'),
  };

  const availableModels = configuredProviders.groq
    ? USER_FACING_MODELS
    : AI_MODELS.filter((m) => configuredProviders[m.provider]);

  const activeModel = resolveActiveModelConfig();

  return NextResponse.json(
    {
      configuredProviders,
      defaultModelId: activeModel.id,
      availableModels,
      totalConfigured: Object.values(configuredProviders).filter(Boolean).length,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
