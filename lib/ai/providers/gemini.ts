import { StreamProviderOptions } from '../types';
import { extractImageContext } from '../../multimodal/contract';

export function parseImageData(img: string): { mimeType: string; data: string } | null {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();

  if (trimmed.startsWith('data:')) {
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx !== -1) {
      const header = trimmed.slice(5, commaIdx).toLowerCase();
      const rawData = trimmed.slice(commaIdx + 1).replace(/\s+/g, '');

      let mimeType = 'image/jpeg';
      const match = header.match(/^([a-z0-9]+\/[a-z0-9-.+]+)/);
      if (match) {
        mimeType = match[1];
      }
      return { mimeType, data: rawData };
    }
  }

  // Fallback for pure base64
  const clean = trimmed.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(clean.slice(0, 100))) {
    return { mimeType: 'image/jpeg', data: clean };
  }

  return null;
}

export async function streamGemini(options: StreamProviderOptions, onChunk: (text: string) => void): Promise<void> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google Gemini API key is not configured.');
  }

  const contents: any[] = [];

  for (const msg of options.messages) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    const imageList = extractImageContext(msg.attachments, msg.image, msg.images);

    if (imageList.length > 0) {
      if (!options.modelConfig.supportsVision) {
        throw new Error(`The selected model (${options.modelConfig.name}) does not support vision/image analysis. Please select a vision-capable model.`);
      }

      for (const img of imageList) {
        const parsed = parseImageData(img);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
        } else if (img.startsWith('http://') || img.startsWith('https://')) {
          try {
            const fetched = await fetch(img);
            if (fetched.ok) {
              const mime = fetched.headers.get('content-type') || 'image/jpeg';
              const buffer = await fetched.arrayBuffer();
              const b64 = Buffer.from(buffer).toString('base64');
              parts.push({
                inlineData: {
                  mimeType: mime,
                  data: b64,
                },
              });
            }
          } catch (e) {
            console.warn('Failed to fetch remote image for Gemini:', e);
          }
        }
      }
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  // Candidate Gemini models to try in order of capability & speed
  const candidateModels = [
    options.modelConfig.modelIdentifier,
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: options.systemPrompt }],
          },
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 8192,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Gemini API error');
        let errMsg = errText;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed?.error?.message || errText;
        } catch { }

        console.warn(`[GEMINI FALLBACK] Model ${modelName} failed (${response.status}):`, errMsg);

        // If model not found or rate limited, try next candidate model
        if (response.status === 404 || response.status === 429 || response.status === 503) {
          lastError = new Error(errMsg);
          continue;
        }
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error('No response body from Gemini');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(dataStr);
            const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (textChunk) {
              chunkCount++;
              onChunk(textChunk);
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

      console.log('[GEMINI PROVIDER FINISHED]', {
        model: modelName,
        chunkCount,
      });

      return;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message?.toLowerCase() || '';
      if (errMsg.includes('not found') || errMsg.includes('404') || errMsg.includes('429')) {
        continue;
      }
      throw err;
    }
  }

  if (lastError) {
    throw lastError;
  }
}
