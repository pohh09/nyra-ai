import { ChatAttachment } from '../multimodal/contract';

export type { ChatAttachment };
export type AIProvider = 'groq' | 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface AIModelCapabilities {
  text: boolean;
  vision: boolean;
  webSearch: boolean;
  pdf: boolean;
  reasoning: boolean;
  streaming: boolean;
  maxContextChars?: number;
  maxOutputTokens?: number;
  tpmLimit?: number;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  providerDisplayName: string;
  modelIdentifier: string;
  description: string;
  modelInfo?: string;
  badge?: string;
  badgeColor?: string;
  capabilities: AIModelCapabilities;
  available: boolean;
  supportsVision: boolean;
  supportsPdf: boolean;
  supportsText: boolean;
  supportsStreaming: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: string;
  images?: string[];
  pdfContext?: string;
  attachments?: ChatAttachment[];
}

export interface StreamProviderOptions {
  modelConfig: AIModelConfig;
  messages: ChatMessage[];
  systemPrompt: string;
  webContext?: string;
  webSources?: Array<{ title: string; url: string; domain?: string; snippet?: string }>;
  temperature?: number;
  maxTokens?: number;
}
