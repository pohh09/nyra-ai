import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val.trim();
  }
}

const groqApiKey = env.GROQ_API_KEY;

async function testScenario(name, model, messages, extraBody = {}) {
  const t0 = Date.now();
  let tFirstToken = null;
  let tFirstTextToken = null;
  let fullText = '';
  let chunkCount = 0;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 500,
        ...extraBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log(`[${name}] ${model} ERROR ${res.status}: ${errText}`);
      return;
    }

    const tResponseHeaders = Date.now() - t0;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const json = JSON.parse(trimmed.slice(5).trim());
          chunkCount++;
          const delta = json.choices?.[0]?.delta;

          if (!tFirstToken) {
            tFirstToken = Date.now() - t0;
          }

          if (delta?.content) {
            if (!tFirstTextToken) {
              tFirstTextToken = Date.now() - t0;
            }
            fullText += delta.content;
          }
        } catch (e) {}
      }
    }

    const totalTime = Date.now() - t0;
    console.log(`\n========================================`);
    console.log(`Scenario: ${name}`);
    console.log(`Model:    ${model}`);
    console.log(`- Time to HTTP response headers: ${tResponseHeaders}ms`);
    console.log(`- Time to First Chunk:           ${tFirstToken}ms`);
    console.log(`- Time to First Text Token:      ${tFirstTextToken}ms`);
    console.log(`- Total Duration:                ${totalTime}ms`);
    console.log(`- Chunks received:               ${chunkCount}`);
    console.log(`- Output preview: "${fullText.replace(/\n+/g, ' ').slice(0, 100)}..."`);
    return { tResponseHeaders, tFirstToken, tFirstTextToken, totalTime };
  } catch (err) {
    console.error(`[${name}] Exception:`, err.message);
  }
}

async function run() {
  console.log('Testing Latency across request scenarios with optimized models:\n');

  // Scenario A: Simple Text
  await testScenario(
    'A. Simple Text ("Hello Nyra")',
    'qwen/qwen3.8-27b',
    [{ role: 'user', content: 'Hello Nyra' }]
  );

  // Scenario B: Normal Question
  await testScenario(
    'B. Normal Question ("What is photosynthesis?")',
    'qwen/qwen3.8-27b',
    [{ role: 'user', content: 'What is photosynthesis in 2 sentences?' }]
  );

  // Scenario C: Longer Question
  await testScenario(
    'C. Longer Question ("Transformer encoders vs decoders")',
    'qwen/qwen3.8-27b',
    [{ role: 'user', content: 'Explain the core difference between Transformer encoders and decoders.' }]
  );

  // Scenario D: GPT-OSS-20B (Fast Mode)
  await testScenario(
    'D. Fast Mode (openai/gpt-oss-20b with low reasoning)',
    'openai/gpt-oss-20b',
    [{ role: 'user', content: 'What is 15 * 24?' }],
    { reasoning_effort: 'low' }
  );

  // Scenario E: Advanced Mode (openai/gpt-oss-120b with low reasoning)
  await testScenario(
    'E. Advanced Mode (openai/gpt-oss-120b with low reasoning)',
    'openai/gpt-oss-120b',
    [{ role: 'user', content: 'Explain zero-knowledge proofs briefly.' }],
    { reasoning_effort: 'low' }
  );

  // Scenario F: Web Search Context (Simulated augmented prompt)
  const webSearchPrompt = `Context from web search:
[1] Title: Latest Mars Rover Discovery
Snippet: NASA's Perseverance rover recently discovered unique mineral deposits in Jezero Crater indicating prolonged water presence.

User query: What did the Mars rover recently find in Jezero crater?`;

  await testScenario(
    'F. Web Search Request (Simulated RAG/Search Context)',
    'qwen/qwen3.8-27b',
    [
      { role: 'system', content: 'You are Nyra, an AI assistant. Answer using the provided web search context.' },
      { role: 'user', content: webSearchPrompt }
    ]
  );
}

run();
