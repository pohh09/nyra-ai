import { NextResponse } from 'next/server';
import { isProviderConfigured } from '@/lib/ai/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

interface ProviderDiagnostic {
  provider: string;
  envVar: string;
  configured: boolean;
}

export async function GET(req: Request) {
  const providers: ProviderDiagnostic[] = [
    {
      provider: 'Groq',
      envVar: 'GROQ_API_KEY',
      configured: isProviderConfigured('groq'),
    },
    {
      provider: 'OpenAI',
      envVar: 'OPENAI_API_KEY',
      configured: isProviderConfigured('openai'),
    },
    {
      provider: 'Anthropic',
      envVar: 'ANTHROPIC_API_KEY',
      configured: isProviderConfigured('anthropic'),
    },
    {
      provider: 'Gemini',
      envVar: 'GEMINI_API_KEY',
      configured: isProviderConfigured('gemini'),
    },
    {
      provider: 'OpenRouter',
      envVar: 'OPENROUTER_API_KEY',
      configured: isProviderConfigured('openrouter'),
    },
  ];

  const services = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    tavily: Boolean(process.env.TAVILY_API_KEY?.trim()),
    cloudinary: Boolean(
      (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)?.trim()
    ),
  };

  const configuredCount = providers.filter((p) => p.configured).length;
  const anyConfigured = configuredCount > 0;

  // Build clean ASCII diagnostic table
  const lines = [
    'Provider       Environment Variable       Configured',
    '-----------------------------------------------------',
  ];
  for (const p of providers) {
    const provCol = p.provider.padEnd(15, ' ');
    const varCol = p.envVar.padEnd(27, ' ');
    const valCol = p.configured ? 'YES' : 'NO';
    lines.push(`${provCol}${varCol}${valCol}`);
  }

  const tableText = lines.join('\n');

  // If text format requested via ?format=text or header
  const url = new URL(req.url);
  if (url.searchParams.get('format') === 'text') {
    return new Response(tableText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  return NextResponse.json(
    {
      status: anyConfigured ? 'ok' : 'no_active_providers',
      configuredCount,
      totalProviders: providers.length,
      providers,
      services,
      diagnosticReport: tableText,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
