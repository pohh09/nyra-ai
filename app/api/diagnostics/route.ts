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

  const rawSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const rawSupabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  let supabaseHost: string | null = null;
  try {
    if (rawSupabaseUrl) {
      supabaseHost = new URL(rawSupabaseUrl).host;
    }
  } catch {}

  const supabaseConfigured = Boolean(
    rawSupabaseUrl &&
    rawSupabaseKey &&
    rawSupabaseUrl !== 'https://your-project.supabase.co' &&
    rawSupabaseKey !== 'your-anon-key' &&
    !rawSupabaseUrl.includes('placeholder')
  );

  const authMode = supabaseConfigured ? 'supabase' : 'local_fallback';

  const adminEmailsRaw = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').trim();
  const adminEmailsList = adminEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const expectedAdminEmail = 'pooja@gmail.com';
  const expectedAdminEmailPresent = adminEmailsList.includes(expectedAdminEmail);

  const services = {
    supabaseConfigured,
    supabaseHost,
    authMode,
    supabaseUrl: Boolean(rawSupabaseUrl),
    supabaseAnonKey: Boolean(rawSupabaseKey),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    adminConfigured: adminEmailsList.length > 0,
    expectedAdminEmailPresent,
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

  lines.push('\nService        Status                     Details');
  lines.push('-----------------------------------------------------');
  lines.push(`Supabase Auth  ${supabaseConfigured ? 'CONNECTED' : 'UNCONFIGURED'}               Host: ${supabaseHost || 'NONE'}`);
  lines.push(`Auth Mode      ${authMode.toUpperCase()}                  ${supabaseConfigured ? 'Cloud PostgreSQL' : 'Local Storage Fallback'}`);
  lines.push(`Admin Config   ${expectedAdminEmailPresent ? 'YES' : 'NO'}                        pooja@gmail.com recognized`);

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

  const detectedEnvVarNames = Object.keys(process.env)
    .filter((k) => /SUPABASE|AUTH|GROQ|OPENAI|ANTHROPIC|GEMINI|OPENROUTER|ADMIN/i.test(k))
    .sort();

  const vercelMetadata = {
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    projectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
    gitRepo: process.env.VERCEL_GIT_REPO_SLUG || null,
    gitOwner: process.env.VERCEL_GIT_REPO_OWNER || null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
  };

  return NextResponse.json(
    {
      status: anyConfigured && supabaseConfigured ? 'ok' : 'degraded',
      supabaseConfigured,
      supabaseHost,
      authMode,
      configuredCount,
      totalProviders: providers.length,
      providers,
      services,
      detectedEnvVarNames,
      vercelMetadata,
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
