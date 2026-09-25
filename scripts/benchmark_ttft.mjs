import fs from 'fs';
import Groq from 'groq-sdk';

// Read .env.local manually
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
} catch (e) {
  console.warn('Could not read .env.local:', e.message);
}

async function testGroqModels() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('GROQ_API_KEY present:', Boolean(apiKey));
  if (!apiKey) return;

  const groq = new Groq({ apiKey });

  // List available models from Groq API
  try {
    const list = await groq.models.list();
    console.log('\n--- Real Active Groq Models on this API Key ---');
    const modelIds = list.data.map((m) => m.id);
    console.log(modelIds);
  } catch (e) {
    console.error('Failed to list Groq models:', e.message);
  }

  const testList = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'deepseek-r1-distill-llama-70b',
  ];

  console.log('\n--- Testing Time-To-First-Token on Groq Models ---');
  for (const model of testList) {
    const start = Date.now();
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
        stream: true,
        max_tokens: 50,
      });

      let firstTokenTime = null;
      let firstCleanTokenTime = null;
      let totalTokens = 0;
      let fullText = '';

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          if (firstTokenTime === null) {
            firstTokenTime = Date.now() - start;
          }
          fullText += delta;
          if (!fullText.includes('<think>') && firstCleanTokenTime === null) {
            firstCleanTokenTime = Date.now() - start;
          } else if (fullText.includes('</think>') && firstCleanTokenTime === null) {
            firstCleanTokenTime = Date.now() - start;
          }
          totalTokens++;
        }
      }
      const totalTime = Date.now() - start;
      console.log(`\nModel: ${model}`);
      console.log(`  TTFT (raw): ${firstTokenTime}ms`);
      console.log(`  TTFT (clean text): ${firstCleanTokenTime}ms`);
      console.log(`  Total time: ${totalTime}ms`);
      console.log(`  Output snippet: ${fullText.slice(0, 80).replace(/\n/g, ' ')}`);
    } catch (e) {
      console.log(`\nModel ${model} FAILED (${Date.now() - start}ms): ${e.message}`);
    }
  }
}

testGroqModels();
