import Groq from 'groq-sdk';
import { StreamProviderOptions } from '../types';
import { extractImageContext } from '../../multimodal/contract';

export async function streamGroq(options: StreamProviderOptions, onChunk: (text: string) => void): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is not configured.');
  }

  const groq = new Groq({ apiKey });

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

  const modelId = options.modelConfig.modelIdentifier;
  const maxTokens = options.maxTokens || 4096;

  const isVisionRequest = options.messages.some(
    (m) => m.image || (Array.isArray(m.images) && m.images.length > 0)
  );

  const candidateModels = isVisionRequest
    ? [modelId, 'llama-3.2-11b-vision-preview', 'llama-3.3-70b-versatile'].filter((m, idx, arr) => m && arr.indexOf(m) === idx)
    : [
      modelId,
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'deepseek-r1-distill-llama-70b',
      'gemma2-9b-it',
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (const candidateModel of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        model: candidateModel,
        messages: formattedMessages,
        stream: true,
        max_tokens: maxTokens,
        temperature: options.temperature ?? 0.7,
      });

      let finishReason = '';
      let chunkCount = 0;
      let totalDeltaChars = 0;

      for await (const chunk of completion) {
        chunkCount++;
        const choice = chunk.choices?.[0];
        const delta = choice?.delta?.content || '';
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
        if (delta) {
          totalDeltaChars += delta.length;
          onChunk(delta);
        }
      }

      console.log('[GROQ PROVIDER FINISHED]', {
        model: candidateModel,
        maxTokens,
        chunkCount,
        totalDeltaChars,
        finishReason: finishReason || 'stop',
      });

      return;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message?.toLowerCase() || '';
      console.warn(`[GROQ FALLBACK] Model ${candidateModel} failed:`, err?.message);

      // If rate limited or model not found, try the next available candidate model
      if (
        errMsg.includes('rate limit') ||
        errMsg.includes('429') ||
        errMsg.includes('limit reached') ||
        errMsg.includes('not exist') ||
        errMsg.includes('not found') ||
        errMsg.includes('404')
      ) {
        continue;
      }
      throw err;
    }
  }

  if (lastError) {
    throw lastError;
  }
}
