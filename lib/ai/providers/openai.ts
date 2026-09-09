import OpenAI from 'openai';
import { StreamProviderOptions } from '../types';
import { extractImageContext } from '../../multimodal/contract';

export async function streamOpenAI(options: StreamProviderOptions, onChunk: (text: string) => void): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured in the environment.');
  }

  const openai = new OpenAI({ apiKey });
  const isReasoningModel = options.modelConfig.modelIdentifier.startsWith('o1');

  const formattedMessages: any[] = [];

  // o1 models do not support 'system' role; they use 'developer' or prepended context
  if (options.systemPrompt) {
    if (isReasoningModel) {
      formattedMessages.push({ role: 'developer', content: options.systemPrompt });
    } else {
      formattedMessages.push({ role: 'system', content: options.systemPrompt });
    }
  }

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

  const params: any = {
    model: options.modelConfig.modelIdentifier,
    messages: formattedMessages,
    stream: true,
  };

  if (isReasoningModel) {
    params.max_completion_tokens = options.maxTokens ?? 8192;
    // Note: o1 models do not support custom temperature
  } else {
    params.temperature = options.temperature ?? 0.7;
    params.max_tokens = options.maxTokens ?? 4096;
  }

  const completion = await openai.chat.completions.create(params);

  for await (const chunk of completion as any) {
    const delta = chunk.choices?.[0]?.delta?.content || '';
    if (delta) {
      onChunk(delta);
    }
  }
}
