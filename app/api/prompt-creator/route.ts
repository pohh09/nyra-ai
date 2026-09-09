import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

interface PromptCreatorRequest {
  action?: 'create' | 'improve';
  // Create mode fields
  goal?: string;
  description?: string;
  category?: string;
  roleTone?: string;
  desiredOutput?: string;
  constraints?: string;
  additionalRequirements?: string;
  contextExamples?: string;
  // Improve mode fields
  prompt?: string;
  improvementType?: 'detailed' | 'short' | 'professional' | 'examples' | 'clarity' | 'custom';
  instructions?: string;
}

const VALID_CATEGORIES = [
  'Coding',
  'Writing',
  'Image Generation',
  'Learning',
  'Career',
  'Research',
  'Custom',
  'General',
] as const;

function matchCategory(inputCategory?: string, fallback = 'General'): string {
  if (!inputCategory) return fallback;
  const lower = inputCategory.toLowerCase().trim();
  if (lower.includes('code') || lower.includes('dev') || lower.includes('program') || lower.includes('software')) return 'Coding';
  if (lower.includes('writ') || lower.includes('copy') || lower.includes('blog') || lower.includes('essay')) return 'Writing';
  if (lower.includes('image') || lower.includes('art') || lower.includes('draw') || lower.includes('midjourney') || lower.includes('visual')) return 'Image Generation';
  if (lower.includes('learn') || lower.includes('study') || lower.includes('tutor') || lower.includes('explain')) return 'Learning';
  if (lower.includes('career') || lower.includes('resume') || lower.includes('job') || lower.includes('interview') || lower.includes('cover letter')) return 'Career';
  if (lower.includes('research') || lower.includes('analysis') || lower.includes('data') || lower.includes('report')) return 'Research';
  if (lower.includes('custom')) return 'Custom';
  return 'General';
}

function extractJsonFromText(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Direct parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Markdown code block extraction
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {}
  }

  // 3. Outermost brace matching
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const sliced = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    } catch {}
  }

  return null;
}

// 1. Execute via Google Gemini
async function tryGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const models = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
  ];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Gemini ${model} HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`[PROMPT-CREATOR] Gemini model ${model} failed, trying next:`, err);
    }
  }

  throw lastErr || new Error('All Gemini models failed');
}

// 2. Execute via Groq
async function tryGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const groq = new Groq({ apiKey });
  const models = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'qwen/qwen3.6-27b',
    'groq/compound-mini',
    'groq/compound',
  ];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content;
      if (text && text.trim()) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`[PROMPT-CREATOR] Groq model ${model} failed, trying next:`, err);
    }
  }

  throw lastErr || new Error('All Groq models failed');
}

// 3. Execute via OpenRouter
async function tryOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const openrouter = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://nyra-ai.workspace',
      'X-Title': 'Nyra AI Prompt Creator',
    },
  });

  const models = [
    'meta-llama/llama-3.3-70b-instruct',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
  ];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content;
      if (text && text.trim()) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`[PROMPT-CREATOR] OpenRouter model ${model} failed, trying next:`, err);
    }
  }

  throw lastErr || new Error('All OpenRouter models failed');
}

// 4. Execute via OpenAI
async function tryOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 1500,
  });

  const text = completion.choices[0]?.message?.content;
  if (text && text.trim()) return text;
  throw new Error('OpenAI returned empty response');
}

// Resilient Multi-Provider Fallback Dispatcher
async function runWithMultiProviderFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  const errors: { provider: string; error: string }[] = [];

  // Provider Chain: Gemini -> Groq -> OpenRouter -> OpenAI
  const providers = [
    { name: 'Gemini', fn: tryGemini },
    { name: 'Groq', fn: tryGroq },
    { name: 'OpenRouter', fn: tryOpenRouter },
    { name: 'OpenAI', fn: tryOpenAI },
  ];

  for (const { name, fn } of providers) {
    try {
      const result = await fn(systemPrompt, userPrompt);
      if (result) return result;
    } catch (err: any) {
      errors.push({ provider: name, error: err?.message || 'Unknown error' });
    }
  }

  const summary = errors.map((e) => `${e.provider}: ${e.error}`).join(' | ');
  throw new Error(`All configured AI providers failed. Diagnostics: [${summary}]`);
}

export async function POST(req: Request) {
  try {
    const body: PromptCreatorRequest = await req.json().catch(() => ({}));
    const action = body.action || 'create';

    // =========================================================
    // ACTION 1: IMPROVE EXISTING PROMPT
    // =========================================================
    if (action === 'improve') {
      const rawPrompt = (body.prompt || '').trim();
      if (!rawPrompt) {
        return NextResponse.json(
          { error: 'Please provide the existing prompt text to improve.' },
          { status: 400 }
        );
      }

      const improvementType = body.improvementType || 'detailed';
      const customInstructions = (body.instructions || '').trim();

      const typeDescriptions: Record<string, string> = {
        detailed: 'Make it comprehensive and detailed: Add role clarity, step-by-step instructions, constraints, and structured output formatting.',
        short: 'Make it concise, punchy, and direct: Keep essential goals while removing fluff and unnecessary words.',
        professional: 'Make it highly professional, authoritative, and industry-grade: Use refined terminology, executive phrasing, and clear criteria.',
        examples: 'Add high-quality practical examples, template placeholders (e.g. {{variables}}), and input/output demonstration blocks.',
        clarity: 'Improve readability, structure, and eliminate ambiguity: Use bullet points, bold section headers, and unambiguous instructions.',
        custom: customInstructions || 'Enhance the prompt with best-in-class prompt engineering techniques.',
      };

      const improvementGoal = typeDescriptions[improvementType] || typeDescriptions.detailed;

      const systemPrompt = `You are a world-class AI prompt engineer.
Your task is to refine and transform an existing raw or basic prompt into an exceptionally high-performing, structured, and effective prompt.

IMPROVEMENT GOAL:
${improvementGoal}
${customInstructions ? `Additional User Instructions: ${customInstructions}` : ''}

OUTPUT FORMAT REQUIREMENTS:
Return ONLY a valid JSON object matching this schema:
{
  "name": "Short Descriptive Title (3-5 words)",
  "prompt": "The complete, enhanced, production-ready prompt text with clear formatting, sections, and {{variables}} if applicable",
  "category": "Coding" | "Writing" | "Image Generation" | "Learning" | "Career" | "Research" | "Custom" | "General",
  "changesSummary": "A 1-2 sentence beginner-friendly explanation of what was improved (e.g. 'Added clear output structure and edge-case handling.')"
}`;

      const userPrompt = `ORIGINAL PROMPT TO IMPROVE:
"""
${rawPrompt}
"""`;

      const rawResponse = await runWithMultiProviderFallback(systemPrompt, userPrompt);
      const parsed = extractJsonFromText(rawResponse);

      if (!parsed || !parsed.prompt) {
        return NextResponse.json({
          name: parsed?.name || 'Improved Prompt',
          prompt: rawResponse.trim(),
          category: matchCategory(parsed?.category, 'General'),
          changesSummary: 'Refined prompt with structured instructions.',
        });
      }

      return NextResponse.json({
        name: String(parsed.name || 'Improved Prompt').trim(),
        prompt: String(parsed.prompt).trim(),
        category: matchCategory(parsed.category, 'General'),
        changesSummary: String(parsed.changesSummary || 'Enhanced clarity, role definition, and output structure.').trim(),
      });
    }

    // =========================================================
    // ACTION 2: CREATE NEW PROMPT FROM GOAL
    // =========================================================
    const goal = (body.goal || body.description || '').trim();
    if (!goal) {
      return NextResponse.json(
        { error: 'Please describe what you want the prompt to do.' },
        { status: 400 }
      );
    }

    const category = body.category ? matchCategory(body.category) : undefined;
    const roleTone = (body.roleTone || '').trim();
    const desiredOutput = (body.desiredOutput || '').trim();
    const constraints = (body.constraints || body.additionalRequirements || '').trim();
    const contextExamples = (body.contextExamples || '').trim();

    const systemPrompt = `You are an elite AI prompt engineer.
Your task is to generate a comprehensive, highly effective, professional, and reusable prompt template based on the user's objective.

Requirements:
1. "name": A concise, descriptive, professional title (e.g. "React 19 Architecture Reviewer", "Executive Brief Synthesizer", "Full-Stack Career Coach").
2. "prompt": A well-structured prompt template with clear role definition, core objective, step-by-step instructions, output format rules, constraints, and reusable {{variable}} tags where appropriate (e.g. {{topic}}, {{role}}, {{framework}}).
3. "category": Must be one of: "Coding", "Writing", "Image Generation", "Learning", "Career", "Research", "Custom", "General".

Return ONLY a valid JSON object in this exact schema:
{
  "name": "Concise Prompt Name",
  "prompt": "Full well-structured prompt text...",
  "category": "Coding" | "Writing" | "Image Generation" | "Learning" | "Career" | "Research" | "Custom" | "General"
}`;

    const parts: string[] = [`Core Objective / Goal:\n${goal}`];
    if (category) parts.push(`Preferred Category: ${category}`);
    if (roleTone) parts.push(`Target Role / Persona / Tone:\n${roleTone}`);
    if (desiredOutput) parts.push(`Desired Output Format & Structure:\n${desiredOutput}`);
    if (constraints) parts.push(`Constraints & Guidelines:\n${constraints}`);
    if (contextExamples) parts.push(`Context & Examples:\n${contextExamples}`);

    const userPrompt = parts.join('\n\n');

    const rawResponse = await runWithMultiProviderFallback(systemPrompt, userPrompt);
    const parsed = extractJsonFromText(rawResponse);

    if (!parsed || !parsed.prompt) {
      return NextResponse.json({
        name: parsed?.name || 'Custom Prompt',
        prompt: rawResponse.trim(),
        category: category || 'General',
      });
    }

    return NextResponse.json({
      name: String(parsed.name || 'Custom Prompt').trim(),
      prompt: String(parsed.prompt).trim(),
      category: matchCategory(parsed.category || category, 'General'),
    });
  } catch (error: any) {
    console.error('Error in /api/prompt-creator:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate prompt with AI. Please check your API key configuration.' },
      { status: 500 }
    );
  }
}
