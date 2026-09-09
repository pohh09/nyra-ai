import { StreamProviderOptions } from '../types';
import { extractImageContext } from '../../multimodal/contract';

export async function streamAnthropic(options: StreamProviderOptions, onChunk: (text: string) => void): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured.');
  }

  const anthropicMessages: any[] = [];

  for (const msg of options.messages) {
    if (msg.role === 'user') {
      const imageList = extractImageContext(msg.attachments, msg.image, msg.images);

      if (imageList.length > 0) {
        if (!options.modelConfig.supportsVision) {
          throw new Error(`The selected model (${options.modelConfig.name}) does not support vision/image analysis. Please select a vision-capable model.`);
        }

        const contentParts: any[] = [];
        for (const img of imageList) {
          // Format base64 image part for Anthropic
          if (img.startsWith('data:')) {
            const match = img.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              contentParts.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: match[1],
                  data: match[2],
                },
              });
            }
          }
        }
        contentParts.push({ type: 'text', text: msg.content || 'Describe and analyze the attached image.' });
        anthropicMessages.push({ role: 'user', content: contentParts });
      } else {
        anthropicMessages.push({ role: 'user', content: msg.content || '' });
      }
    } else if (msg.role === 'assistant') {
      anthropicMessages.push({ role: 'assistant', content: msg.content || '' });
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.modelConfig.modelIdentifier,
      max_tokens: options.maxTokens ?? 8192,
      system: options.systemPrompt,
      messages: anthropicMessages,
      stream: true,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Anthropic API error');
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed?.error?.message || 'Anthropic API request failed');
    } catch {
      throw new Error(errText || 'Anthropic API request failed');
    }
  }

  if (!response.body) throw new Error('No response body from Anthropic');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]') return;
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // Ignore JSON parse errors in partial stream line
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      processLine(line);
    }
  }

  // Drain any remaining buffered text
  buffer += decoder.decode();
  if (buffer.trim()) {
    processLine(buffer);
  }
}
