import fs from 'fs';
import Groq from 'groq-sdk';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

async function inspectModels() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const activeModels = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'groq/compound-mini',
    'groq/compound',
  ];

  for (const model of activeModels) {
    console.log(`\n================ Testing ${model} ================`);
    const start = Date.now();
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say "Hello Nyra" and explain gravity in 1 sentence.' }],
        stream: true,
        max_tokens: 100,
      });

      let firstChunkTime = null;
      let chunks = [];
      let totalText = '';
      let reasoningText = '';

      for await (const chunk of stream) {
        if (firstChunkTime === null) firstChunkTime = Date.now() - start;
        const choice = chunk.choices?.[0];
        const delta = choice?.delta;
        chunks.push(delta);
        if (delta?.content) totalText += delta.content;
        if (delta?.reasoning || delta?.reasoning_content) {
          reasoningText += delta.reasoning || delta.reasoning_content;
        }
      }

      console.log(`Time to First Chunk: ${firstChunkTime}ms | Total Time: ${Date.now() - start}ms`);
      console.log(`Chunks count: ${chunks.length}`);
      console.log(`First 3 raw deltas:`, JSON.stringify(chunks.slice(0, 3)));
      console.log(`Total Text Length: ${totalText.length}`);
      console.log(`Reasoning Text Length: ${reasoningText.length}`);
      console.log(`Text Output: "${totalText.slice(0, 120)}..."`);
      if (reasoningText) {
        console.log(`Reasoning Output: "${reasoningText.slice(0, 120)}..."`);
      }
    } catch (err) {
      console.log(`Error on ${model}:`, err.message);
    }
  }
}

inspectModels();
