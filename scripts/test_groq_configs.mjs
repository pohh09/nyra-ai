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

async function testConfigurations() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const tests = [
    {
      name: 'Qwen 3.8 27B (Direct Stream)',
      model: 'qwen/qwen3.8-27b',
      params: {},
    },
    {
      name: 'Compound Mini (Direct Stream)',
      model: 'groq/compound-mini',
      params: {},
    },
    {
      name: 'Compound (Direct Stream)',
      model: 'groq/compound',
      params: {},
    },
    {
      name: 'GPT-OSS 120B with reasoning_effort: "low"',
      model: 'openai/gpt-oss-120b',
      params: { reasoning_effort: 'low' },
    },
    {
      name: 'GPT-OSS 20B with reasoning_effort: "low"',
      model: 'openai/gpt-oss-20b',
      params: { reasoning_effort: 'low' },
    },
  ];

  for (const t of tests) {
    console.log(`\nTesting ${t.name}...`);
    const start = Date.now();
    try {
      const stream = await groq.chat.completions.create({
        model: t.model,
        messages: [{ role: 'user', content: 'What are the three laws of motion? Give 1 sentence each.' }],
        stream: true,
        max_tokens: 250,
        ...t.params,
      });

      let ttft = null;
      let fullText = '';
      let chunkCount = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          if (ttft === null) ttft = Date.now() - start;
          fullText += delta;
        }
        chunkCount++;
      }

      console.log(`  ✅ TTFT: ${ttft}ms | Total: ${Date.now() - start}ms | Chunks: ${chunkCount}`);
      console.log(`  Sample: "${fullText.slice(0, 100).replace(/\n/g, ' ')}..."`);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }
}

testConfigurations();
