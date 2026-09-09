/**
 * Environment Variable Validation for Nyra AI
 * Safely checks for required server-side & public variables without printing secret values.
 */

export interface EnvValidationResult {
  valid: boolean;
  missingRequired: string[];
  configuredProviders: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const missingRequired: string[] = [];
  const warnings: string[] = [];
  const configuredProviders: string[] = [];

  // Public Supabase variables (Used in browser & SSR)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingRequired.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingRequired.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // AI Providers validation
  if (process.env.GROQ_API_KEY) {
    configuredProviders.push('Groq (Default)');
  }
  if (process.env.OPENAI_API_KEY) {
    configuredProviders.push('OpenAI');
  }
  if (process.env.ANTHROPIC_API_KEY) {
    configuredProviders.push('Anthropic');
  }
  if (process.env.GEMINI_API_KEY) {
    configuredProviders.push('Google Gemini');
  }
  if (process.env.OPENROUTER_API_KEY) {
    configuredProviders.push('OpenRouter');
  }

  if (configuredProviders.length === 0) {
    warnings.push('No AI provider API keys found. Please set at least GROQ_API_KEY for conversational AI.');
  }

  // Web Search validation
  if (!process.env.TAVILY_API_KEY) {
    warnings.push('TAVILY_API_KEY is not set. Live Web Search will be unavailable.');
  }

  // Image Upload validation
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    warnings.push('Cloudinary environment variables not fully set. Local data URIs will be used for images.');
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    configuredProviders,
    warnings,
  };
}
