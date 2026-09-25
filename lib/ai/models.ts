import { AIModelConfig, AIProvider } from './types';

/**
 * 4 Simplified Workspace AI Modes
 * Clear, purposeful modes mapped internally to optimal neural models
 */
export const USER_FACING_MODELS: AIModelConfig[] = [
  {
    id: 'fast',
    name: 'Fast',
    provider: 'groq',
    providerDisplayName: 'Groq Ultra-Fast',
    modelIdentifier: 'openai/gpt-oss-20b',
    modelInfo: 'GPT-OSS 20B',
    description: 'Instant sub-second answers, rapid chat, and quick drafting',
    badge: '⚡ Fast',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: false,
      streaming: true,
      maxContextChars: 32000,
      maxOutputTokens: 4096,
      tpmLimit: 128000,
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    provider: 'groq',
    providerDisplayName: 'Groq Neural Engine',
    modelIdentifier: 'qwen/qwen3.8-27b',
    modelInfo: 'Qwen 3.8 27B',
    description: 'Everyday intelligence, multi-PDF document analysis & deep understanding',
    badge: '✦ Default & Fast',
    badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 64000,
      maxOutputTokens: 4096,
      tpmLimit: 128000,
    },
  },
  {
    id: 'advanced',
    name: 'Advanced',
    provider: 'groq',
    providerDisplayName: 'Groq Cloud',
    modelIdentifier: 'openai/gpt-oss-120b',
    modelInfo: 'GPT-OSS 120B',
    description: 'Deep coding, architecture, structured logic & refactoring',
    badge: '💻 Code & Logic',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 64000,
      maxOutputTokens: 4096,
      tpmLimit: 128000,
    },
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    provider: 'groq',
    providerDisplayName: 'Groq Neural Engine',
    modelIdentifier: 'openai/gpt-oss-120b',
    modelInfo: 'GPT-OSS 120B',
    description: 'Step-by-step problem solving, math & complex analysis',
    badge: '🧠 Deep Think',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 64000,
      maxOutputTokens: 4096,
      tpmLimit: 128000,
    },
  },
];

/**
 * Full Model Catalog (Preserved for backend stream resolvers, fallback resilience & API compatibility)
 */
export const AI_MODELS: AIModelConfig[] = [
  ...USER_FACING_MODELS,

  // Additional Backend & Extended Models
  {
    id: 'openai-gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    providerDisplayName: 'OpenAI',
    modelIdentifier: 'gpt-4o-mini',
    description: 'Fast, cost-efficient multimodal model for lightweight everyday tasks',
    badge: 'Fast & Vision',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: false,
      streaming: true,
      maxContextChars: 60000,
      maxOutputTokens: 8192,
      tpmLimit: 128000,
    },
  },
  {
    id: 'openai-o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'openai',
    providerDisplayName: 'OpenAI',
    modelIdentifier: 'o1-mini',
    description: 'Specialized deep reasoning model for complex STEM, math, and algorithmic coding',
    badge: 'Deep Reasoning',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
    available: true,
    supportsVision: false,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: false,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 60000,
      maxOutputTokens: 8192,
      tpmLimit: 128000,
    },
  },
  {
    id: 'anthropic-claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    providerDisplayName: 'Anthropic',
    modelIdentifier: 'claude-3-5-haiku-20241022',
    description: 'Lightning-fast next-gen compact model with high responsiveness',
    badge: 'Fast & Smart',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: false,
      streaming: true,
      maxContextChars: 80000,
      maxOutputTokens: 8192,
      tpmLimit: 200000,
    },
  },
  {
    id: 'google-gemini-3-6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'gemini',
    providerDisplayName: 'Google DeepMind',
    modelIdentifier: 'gemini-3.6-flash',
    description: 'Next-generation multimodal model with real-time speed, high accuracy and vision',
    badge: 'Gemini Flash',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 160000,
      maxOutputTokens: 8192,
      tpmLimit: 1000000,
    },
  },
  {
    id: 'google-gemini-3-7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    providerDisplayName: 'Google DeepMind',
    modelIdentifier: 'gemini-3.7-flash',
    description: 'Advanced reasoning model with multimodal comprehension',
    badge: 'Gemini 3.7',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 160000,
      maxOutputTokens: 8192,
      tpmLimit: 1000000,
    },
  },
  {
    id: 'openrouter-auto',
    name: 'OpenRouter Auto',
    provider: 'openrouter',
    providerDisplayName: 'OpenRouter Unified',
    modelIdentifier: 'openrouter/auto',
    description: 'Intelligently routes prompts to the highest performing available AI engine',
    badge: 'Universal',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
    available: true,
    supportsVision: true,
    supportsPdf: true,
    supportsText: true,
    supportsStreaming: true,
    capabilities: {
      text: true,
      vision: true,
      webSearch: true,
      pdf: true,
      reasoning: true,
      streaming: true,
      maxContextChars: 60000,
      maxOutputTokens: 8192,
      tpmLimit: 128000,
    },
  },
];

export const DEFAULT_MODEL_ID = 'balanced';
export const DEFAULT_VISION_MODEL_ID = 'google-gemini-3-6-flash';

export function getModelConfig(modelId: string): AIModelConfig {
  if (!modelId) return USER_FACING_MODELS[1];

  // Direct ID match in user-facing models
  const directFacing = USER_FACING_MODELS.find((m) => m.id === modelId);
  if (directFacing) return directFacing;

  // Map legacy IDs to new simplified workspace modes
  if (modelId === 'llama-3.1-8b-instant') return USER_FACING_MODELS[0]; // Fast
  if (modelId === 'qwen/qwen3.6-27b' || modelId === 'default') return USER_FACING_MODELS[1]; // Balanced
  if (modelId === 'llama-3.3-70b-versatile' || modelId === 'code') return USER_FACING_MODELS[2]; // Advanced
  if (modelId === 'deepseek-r1-distill-llama-70b' || modelId === 'openrouter-deepseek-r1') return USER_FACING_MODELS[3]; // Reasoning

  // Check full AI_MODELS list or modelIdentifier
  const fullMatch = AI_MODELS.find(
    (m) => m.id === modelId || m.modelIdentifier === modelId
  );
  if (fullMatch) return fullMatch;

  return USER_FACING_MODELS[1];
}

export function validateModelCapabilities(
  modelId: string,
  options: { hasImages?: boolean; hasPdfs?: boolean }
): { valid: boolean; error?: string; suggestedModelId?: string } {
  // In the browser, non-public process.env keys are not exposed.
  // The server-side API route dynamically validates and routes models with active environment keys.
  if (typeof window !== 'undefined') {
    return { valid: true };
  }

  if (options.hasImages) {
    const hasAnyVisionProvider =
      isProviderConfigured('gemini') ||
      isProviderConfigured('openai') ||
      isProviderConfigured('openrouter') ||
      isProviderConfigured('anthropic');

    if (!hasAnyVisionProvider) {
      return {
        valid: false,
        error: `No vision-capable AI provider (Gemini / OpenAI) is configured in your environment.`,
        suggestedModelId: DEFAULT_VISION_MODEL_ID,
      };
    }
  }

  return { valid: true };
}

export function getProviderEnvKey(provider: AIProvider): string {
  switch (provider) {
    case 'groq':
      return 'GROQ_API_KEY';
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'anthropic':
      return 'ANTHROPIC_API_KEY';
    case 'gemini':
      return 'GEMINI_API_KEY';
    case 'openrouter':
      return 'OPENROUTER_API_KEY';
    default:
      return '';
  }
}

export function isProviderConfigured(provider: AIProvider): boolean {
  if (typeof process === 'undefined' || !process.env) return false;
  switch (provider) {
    case 'groq':
      return Boolean(process.env.GROQ_API_KEY);
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY);
    case 'anthropic':
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case 'gemini':
      return Boolean(
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
      );
    case 'openrouter':
      return Boolean(process.env.OPENROUTER_API_KEY);
    default:
      return false;
  }
}

/**
 * Safely resolves an active, configured model.
 * If the requested model is unconfigured (e.g. OpenAI when OPENAI_API_KEY is missing),
 * it seamlessly falls back to the primary working configured model.
 * When needsVision is true, automatically routes to a configured vision model (Gemini / OpenAI).
 */
export function resolveActiveModelConfig(modelId?: string, needsVision?: boolean): AIModelConfig {
  const requested = modelId ? getModelConfig(modelId) : null;

  if (needsVision) {
    // If requested model natively supports vision and its provider is configured, use it
    if (requested && requested.supportsVision && isProviderConfigured(requested.provider) && requested.provider !== 'groq') {
      return requested;
    }

    // Automatically route to configured vision model (Gemini -> OpenAI -> OpenRouter -> Anthropic)
    if (isProviderConfigured('gemini')) {
      return (
        AI_MODELS.find((m) => m.provider === 'gemini' && m.supportsVision) ||
        getModelConfig('google-gemini-2-0-flash')
      );
    }
    if (isProviderConfigured('openai')) {
      return (
        AI_MODELS.find((m) => m.provider === 'openai' && m.supportsVision) ||
        getModelConfig('openai-gpt-4o-mini')
      );
    }
    if (isProviderConfigured('openrouter')) {
      return (
        AI_MODELS.find((m) => m.provider === 'openrouter' && m.supportsVision) ||
        getModelConfig('openrouter-auto')
      );
    }
  }

  // If the requested model belongs to a configured provider, use it
  if (requested && isProviderConfigured(requested.provider)) {
    return requested;
  }

  // Otherwise find the best available model among configured providers
  const configuredModels = USER_FACING_MODELS.filter((m) => isProviderConfigured(m.provider));

  if (configuredModels.length > 0) {
    const qwen = configuredModels.find((m) => m.id === 'balanced' || m.modelIdentifier === 'qwen/qwen3.6-27b');
    if (qwen) return qwen;
    return configuredModels[0];
  }

  // Fallback to default Nyra model
  return USER_FACING_MODELS[1];
}
