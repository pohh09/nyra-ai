import OpenAI from 'openai';
import { StreamProviderOptions } from '../types';
import { extractImageContext } from '../../multimodal/contract';

export async function streamOpenRouter(options: StreamProviderOptions, onChunk: (text: string) => void): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured.');
  }

  const openrouter = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://nyra-ai.workspace',
      'X-Title': 'Nyra AI',
    },
  });

  const formattedMessages: any[] = [
    { role: 'system', content: options.systemPrompt },
  ];

  for (const msg of options.messages) {
    if (msg.role === 'user') {
      const imageList = extractImageContext(msg.attachments, msg.image, msg.images);

      if (imageList.length > 0) {
        if (!options.modelConfig.supportsVision) {
          throw new Error(`The selected model (${options.modelConfig.name}) does not support vision/image analysis. Please select a vision-capable model.`);
        }

        const contentParts: any[] = [
          { type: 'text', text: msg.content?.trim() || 'Describe and analyze the attached media.' },
        ];
        for (const img of imageList) {
          contentParts.push({
            type: 'image_url',
            image_url: { url: img },
          });
        }
        formattedMessages.push({ role: 'user', content: contentParts });
      } else {
        formattedMessages.push({ role: 'user', content: msg.content || '' });
      }
    } else if (msg.role === 'assistant') {
      formattedMessages.push({ role: 'assistant', content: msg.content || '' });
    }
  }

  const completion = await openrouter.chat.completions.create({
    model: options.modelConfig.modelIdentifier,
    messages: formattedMessages,
    stream: true,
    max_tokens: options.maxTokens ?? 8192,
    temperature: options.temperature ?? 0.7,
  });

  for await (const chunk of completion as any) {
    const delta = chunk.choices?.[0]?.delta?.content || '';
    if (delta) {
      onChunk(delta);
    }
  }
}
