import { AIModelConfig, AIProvider, ChatMessage, StreamProviderOptions } from './types';
import { getModelConfig, isProviderConfigured, getProviderEnvKey, resolveActiveModelConfig, AI_MODELS } from './models';
import { streamGroq } from './providers/groq';
import { streamOpenAI } from './providers/openai';
import { streamAnthropic } from './providers/anthropic';
import { streamGemini } from './providers/gemini';
import { streamOpenRouter } from './providers/openrouter';

/**
 * Filter out <think>...</think> reasoning blocks on the fly during streaming.
 * Handles split tags across chunks (<think> and </think>), and ensures no text
 * is swallowed if chunks are split or if the model finishes inside a reasoning block.
 */
function createThinkingFilter(onCleanText: (text: string) => void) {
  let insideThink = false;
  let buffer = '';
  let thinkBuffer = '';
  let emittedChars = 0;

  return {
    push(chunk: string) {
      if (!chunk) return;
      buffer += chunk;

      while (buffer.length > 0) {
        if (!insideThink) {
          const thinkIndex = buffer.indexOf('<think>');
          if (thinkIndex === -1) {
            // Check for partial '<think>' at the end of buffer (e.g. '<', '<t', '<th', ...)
            let partialMatchLen = 0;
            for (let i = '<think>'.length - 1; i >= 1; i--) {
              if (buffer.endsWith('<think>'.slice(0, i))) {
                partialMatchLen = i;
                break;
              }
            }
            if (partialMatchLen > 0) {
              const toEmit = buffer.slice(0, -partialMatchLen);
              if (toEmit) {
                emittedChars += toEmit.length;
                onCleanText(toEmit);
              }
              buffer = buffer.slice(-partialMatchLen);
              break; // Wait for next chunk
            } else {
              emittedChars += buffer.length;
              onCleanText(buffer);
              buffer = '';
              break;
            }
          } else {
            if (thinkIndex > 0) {
              const toEmit = buffer.slice(0, thinkIndex);
              emittedChars += toEmit.length;
              onCleanText(toEmit);
            }
            insideThink = true;
            thinkBuffer = '';
            buffer = buffer.slice(thinkIndex + '<think>'.length);
          }
        } else {
          const endThinkIndex = buffer.indexOf('</think>');
          if (endThinkIndex === -1) {
            // Check for partial '</think>' at the end of buffer (e.g. '<', '</', '</t', ...)
            let partialMatchLen = 0;
            for (let i = '</think>'.length - 1; i >= 1; i--) {
              if (buffer.endsWith('</think>'.slice(0, i))) {
                partialMatchLen = i;
                break;
              }
            }
            if (partialMatchLen > 0) {
              thinkBuffer += buffer.slice(0, -partialMatchLen);
              buffer = buffer.slice(-partialMatchLen);
              break; // Wait for next chunk to complete '</think>'
            } else {
              thinkBuffer += buffer;
              buffer = '';
              break;
            }
          } else {
            insideThink = false;
            thinkBuffer += buffer.slice(0, endThinkIndex);
            buffer = buffer.slice(endThinkIndex + '</think>'.length).replace(/^\n+/, '');
          }
        }
      }
    },
    flush() {
      if (buffer.length > 0) {
        if (!insideThink) {
          emittedChars += buffer.length;
          onCleanText(buffer);
        } else {
          thinkBuffer += buffer;
        }
        buffer = '';
      }
      // Safety guard: if stream ended while inside think or if thinkBuffer has un-emitted text,
      // output the buffered text so the user receives the complete response
      if (insideThink && thinkBuffer.trim().length > 0) {
        onCleanText(thinkBuffer.trim());
      } else if (emittedChars === 0 && thinkBuffer.trim().length > 0) {
        onCleanText(thinkBuffer.trim());
      }
    },
  };
}

export interface ResolveStreamParams {
  modelId?: string;
  messages: ChatMessage[];
  systemPrompt: string;
  webSources?: Array<{ title: string; url: string; domain?: string; snippet?: string }>;
}

export interface DynamicBudgetParams {
  provider: AIProvider;
  modelId: string;
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokensOverride?: number;
}

export interface PdfBudgetCalculationParams {
  provider: AIProvider;
  systemPrompt: string;
  historyMessages: ChatMessage[];
  userPrompt: string;
  reservedOutputTokens?: number;
}

/**
 * Strips any legacy embedded document context blocks or raw base64 data URLs
 * from historical messages and trims older turns if total history exceeds the max allowance.
 */
export function sanitizeAndTrimConversationHistory(
  rawMessages: Array<{ role?: string; content?: string; [key: string]: any }>,
  maxHistoryTokens = 4000
): ChatMessage[] {
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) return [];

  // Step 1: Sanitize content of all messages
  const cleaned: ChatMessage[] = rawMessages
    .map((m) => {
      let content = m.content || '';
      if (content.includes('[ATTACHED DOCUMENT CONTEXT')) {
        content = content.replace(/\[ATTACHED DOCUMENT CONTEXT:[^\]]*\][\s\S]*?\[USER REQUEST\]\s*/gi, '');
      }
      // Remove any accidental raw base64 data URLs from content string
      if (content.includes('data:image/')) {
        content = content.replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/g, '[Attached Image]');
      }
      const role: 'user' | 'assistant' | 'system' =
        m.role === 'assistant' || m.role === 'system' ? m.role : 'user';
      return {
        ...m,
        role,
        content: content.trim(),
      };
    })
    .filter((m) => m.content.length > 0);

  // Step 2: Trim older messages from the beginning if total tokens exceed maxHistoryTokens
  let totalChars = cleaned.reduce((acc, m) => acc + m.content.length, 0);
  let totalTokens = Math.ceil(totalChars / 3.8);

  const trimmed = [...cleaned];
  // Preserve at least the last 2 messages (recent exchange) while dropping oldest messages if overflowing
  while (trimmed.length > 2 && totalTokens > maxHistoryTokens) {
    const dropped = trimmed.shift();
    if (dropped) {
      totalChars -= dropped.content.length;
      totalTokens = Math.ceil(totalChars / 3.8);
    }
  }

  return trimmed;
}

/**
 * Intelligently budgets PDF document text context against model & provider limits
 * (Available PDF tokens = Model context limit - System prompt - History - User prompt - Output tokens reserve).
 * Base64 image payloads are NOT counted as text tokens.
 */
export function calculatePdfContextBudget(params: PdfBudgetCalculationParams): {
  maxPdfChars: number;
  maxOutputTokens: number;
  availablePdfTokens: number;
} {
  const { provider, systemPrompt, historyMessages, userPrompt, reservedOutputTokens } = params;

  // Calculate text character count excluding image base64
  let baseChars = (systemPrompt?.length || 0) + (userPrompt?.length || 0);
  for (const m of historyMessages) {
    let clean = m.content || '';
    if (clean.includes('[ATTACHED DOCUMENT CONTEXT')) {
      clean = clean.replace(/\[ATTACHED DOCUMENT CONTEXT:[^\]]*\][\s\S]*?\[USER REQUEST\]\s*/i, '');
    }
    baseChars += clean.length;
  }

  const baseTokens = Math.ceil(baseChars / 3.8);

  if (provider === 'gemini') {
    const maxOutputTokens = reservedOutputTokens || 8192;
    return {
      maxPdfChars: 300000, // Gemini has 1M+ token context window
      maxOutputTokens,
      availablePdfTokens: 80000,
    };
  }

  if (provider === 'openai' || provider === 'anthropic' || provider === 'openrouter') {
    const maxOutputTokens = reservedOutputTokens || 4096;
    const totalContextLimit = provider === 'anthropic' ? 180000 : provider === 'openai' ? 100000 : 48000;
    const availablePdfTokens = Math.max(2000, totalContextLimit - baseTokens - maxOutputTokens);
    return {
      maxPdfChars: Math.min(Math.floor(availablePdfTokens * 3.8), 120000),
      maxOutputTokens,
      availablePdfTokens,
    };
  }

  if (provider === 'groq') {
    // Groq token budgeting: reserve full 4,096 output tokens for comprehensive responses
    const totalSafeLimit = 7800;
    const maxOutputTokens = Math.min(4096, reservedOutputTokens || 3072);
    const availablePdfTokens = Math.max(1000, totalSafeLimit - baseTokens - maxOutputTokens - 100);
    const maxPdfChars = Math.floor(availablePdfTokens * 3.8);

    return {
      maxPdfChars,
      maxOutputTokens,
      availablePdfTokens,
    };
  }

  return {
    maxPdfChars: 30000,
    maxOutputTokens: reservedOutputTokens || 4096,
    availablePdfTokens: 8000,
  };
}

export function calculateDynamicTokenBudget(params: DynamicBudgetParams): {
  estimatedInputTokens: number;
  maxOutputTokens: number;
  maxPdfChars: number;
} {
  const { provider, systemPrompt, messages, maxTokensOverride } = params;

  let totalChars = systemPrompt.length;
  for (const m of messages) {
    // Only count text content; ignore any raw base64 data URLs
    const content = m.content || '';
    if (!content.startsWith('data:image')) {
      totalChars += content.length;
    }
  }

  // ~3.8 characters per token average for English text, Markdown, & code
  const estimatedInputTokens = Math.ceil(totalChars / 3.8);

  if (provider === 'gemini') {
    return {
      estimatedInputTokens,
      maxOutputTokens: maxTokensOverride || 8192,
      maxPdfChars: 300000,
    };
  }

  if (provider === 'openai' || provider === 'anthropic' || provider === 'openrouter') {
    return {
      estimatedInputTokens,
      maxOutputTokens: maxTokensOverride || 8192,
      maxPdfChars: 120000,
    };
  }

  if (provider === 'groq') {
    // Groq models support up to 8,192 max output tokens.
    // Ensure full multi-paragraph and complete code block generation without early cutoffs.
    const maxSafeTotal = 7800;
    const safeOutputBudget = Math.max(3072, maxSafeTotal - estimatedInputTokens - 100);
    const maxOutputTokens = Math.min(8192, maxTokensOverride || safeOutputBudget);

    return {
      estimatedInputTokens,
      maxOutputTokens,
      maxPdfChars: Math.floor(Math.max(500, maxSafeTotal - estimatedInputTokens - maxOutputTokens) * 3.8),
    };
  }

  return {
    estimatedInputTokens,
    maxOutputTokens: maxTokensOverride || 4096,
    maxPdfChars: 30000,
  };
}

export interface ResolveStreamParams {
  modelId?: string;
  messages: ChatMessage[];
  systemPrompt: string;
  webSources?: Array<{ title: string; url: string; domain?: string; snippet?: string }>;
  maxTokens?: number;
}

export async function resolveAIStream(params: ResolveStreamParams): Promise<Response> {
  const hasImages = params.messages.some(
    (m) => m.image || (Array.isArray(m.images) && m.images.length > 0)
  );

  // Safely resolve to an active, configured model with automatic fallback
  const modelConfig = resolveActiveModelConfig(params.modelId, hasImages);

  // Safety guard: if absolutely no providers are configured in the environment
  if (!isProviderConfigured(modelConfig.provider)) {
    return new Response(
      `No active AI providers are configured. Please check your GROQ_API_KEY or other provider environment variables.`,
      { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // Calculate dynamic token budget to guarantee complete responses without hitting TPM limits
  const budget = calculateDynamicTokenBudget({
    provider: modelConfig.provider,
    modelId: modelConfig.modelIdentifier,
    systemPrompt: params.systemPrompt,
    messages: params.messages,
    maxTokensOverride: params.maxTokens,
  });

  const options: StreamProviderOptions = {
    modelConfig,
    messages: params.messages,
    systemPrompt: params.systemPrompt,
    webSources: params.webSources,
    maxTokens: budget.maxOutputTokens,
  };

  const encoder = new TextEncoder();
  const streamStartTime = Date.now();
  let totalChunksEnqueued = 0;
  let totalCleanCharsEmitted = 0;

  const modelTokenLimit = modelConfig.provider === 'groq' ? 8000 : 128000;
  const calculatedTotal = budget.estimatedInputTokens + budget.maxOutputTokens;
  const remainingBudget = Math.max(0, modelTokenLimit - calculatedTotal);

  console.log('[PDF TOKEN CALCULATION]', {
    provider: modelConfig.provider,
    model: modelConfig.modelIdentifier,
    pdfTextLength: params.messages.find((m) => m.content?.includes('[ATTACHED DOCUMENT')) ? 'attached' : 'none',
    conversationMessageCount: params.messages.length,
    estimatedInputTokens: budget.estimatedInputTokens,
    requestedOutputTokens: budget.maxOutputTokens,
    modelTokenLimit,
    calculatedTotal,
    remainingBudget,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const filter = createThinkingFilter((cleanChunk: string) => {
          if (cleanChunk) {
            totalChunksEnqueued++;
            totalCleanCharsEmitted += cleanChunk.length;
            controller.enqueue(encoder.encode(cleanChunk));
          }
        });

        const onChunk = (chunk: string) => {
          filter.push(chunk);
        };

        // Resilient provider runner with automatic fallback for vision, text & rate limits
        const providerOrder: AIProvider[] = [modelConfig.provider];
        if (isProviderConfigured('groq') && !providerOrder.includes('groq')) providerOrder.push('groq');
        if (isProviderConfigured('gemini') && !providerOrder.includes('gemini')) providerOrder.push('gemini');
        if (isProviderConfigured('openai') && !providerOrder.includes('openai')) providerOrder.push('openai');
        if (isProviderConfigured('anthropic') && !providerOrder.includes('anthropic')) providerOrder.push('anthropic');
        if (isProviderConfigured('openrouter') && !providerOrder.includes('openrouter')) providerOrder.push('openrouter');

        let providerSuccess = false;
        let lastStreamErr: any = null;

        for (const currentProv of providerOrder) {
          try {
            let currentOptions = options;
            if (currentProv !== modelConfig.provider) {
              const fallbackConfig =
                AI_MODELS.find((m) => m.provider === currentProv && (!hasImages || m.supportsVision)) ||
                modelConfig;
              currentOptions = {
                ...options,
                modelConfig: fallbackConfig,
              };
            }

            switch (currentProv) {
              case 'groq':
                await streamGroq(currentOptions, onChunk);
                break;
              case 'openai':
                await streamOpenAI(currentOptions, onChunk);
                break;
              case 'anthropic':
                await streamAnthropic(currentOptions, onChunk);
                break;
              case 'gemini':
                await streamGemini(currentOptions, onChunk);
                break;
              case 'openrouter':
                await streamOpenRouter(currentOptions, onChunk);
                break;
              default:
                throw new Error(`Unsupported AI provider: ${currentProv}`);
            }

            providerSuccess = true;
            break;
          } catch (err: any) {
            lastStreamErr = err;
            console.warn(`[RESOLVER STREAM FALLBACK] Provider ${currentProv} failed:`, err?.message);
            // If already streaming chunks to the user, we cannot switch mid-stream
            if (totalChunksEnqueued > 0) {
              throw err;
            }
          }
        }

        if (!providerSuccess && lastStreamErr) {
          throw lastStreamErr;
        }

        filter.flush();

        // Append live web search sources if present
        if (params.webSources && params.webSources.length > 0) {
          controller.enqueue(
            encoder.encode('\n\n__SOURCES__\n' + JSON.stringify(params.webSources))
          );
        }

        console.log('[AI STREAM COMPLETED]', {
          provider: modelConfig.provider,
          model: modelConfig.modelIdentifier,
          durationMs: Date.now() - streamStartTime,
          totalChunksEnqueued,
          totalCleanCharsEmitted,
          streamEndedNormally: true,
        });

        controller.close();
      } catch (streamErr: any) {
        console.error(`AI Provider Stream Error (${modelConfig.provider}):`, streamErr);
        const errMsg = streamErr?.message?.toLowerCase() || '';

        let normalizedMsg = streamErr?.message || 'An error occurred while generating the response.';
        if (
          errMsg.includes('413') ||
          errMsg.includes('too large') ||
          errMsg.includes('tpm limit') ||
          errMsg.includes('maximum context length') ||
          errMsg.includes('tokens per minute')
        ) {
          normalizedMsg = hasImages
            ? 'The attached image or request is too large for the provider token limit. Please try using a smaller image or compressed screenshot.'
            : 'This document or request is too large for the selected model token limit. Try asking about a specific section or use a shorter document.';
        } else if (errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('resource_exhausted')) {
          normalizedMsg = `This model (${modelConfig.name}) has temporarily reached its rate or token limit. Please try again in a few moments or switch to another model.`;
        } else if (errMsg.includes('api key') || errMsg.includes('unauthorized') || errMsg.includes('401') || errMsg.includes('not configured')) {
          normalizedMsg = `API key for ${modelConfig.providerDisplayName} is not configured in the environment. Please select an active model.`;
        } else if (errMsg.includes('not exist') || errMsg.includes('not found') || errMsg.includes('model_not_found') || errMsg.includes('404')) {
          normalizedMsg = `The selected model (${modelConfig.name}) is currently unavailable on this provider tier. Please select another model.`;
        }

        controller.enqueue(encoder.encode(`\n\n✦ Error: ${normalizedMsg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'X-Model-Id': modelConfig.id,
      'X-Provider': modelConfig.provider,
    },
  });
}
