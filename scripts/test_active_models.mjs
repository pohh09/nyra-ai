import fs from 'fs';
import Groq from 'groq-sdk';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
}

async function testGroqModels() {
  console.log('====================================');
  console.log('TESTING ACTIVE GROQ MODELS');
  console.log('====================================');
  const groq = new Groq({ apiKey: env.GROQ_API_KEY });

  const models = [
    { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B' },
    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B' },
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B' }
  ];

  for (const m of models) {
    process.stdout.write(`\nTesting Groq model: ${m.name} (${m.id})...\n`);
    const start = Date.now();
    try {
      const completion = await groq.chat.completions.create({
        model: m.id,
        messages: [
          { role: 'system', content: 'You are Nyra AI.' },
          { role: 'user', content: 'Say hello and explain what you can do in one sentence.' }
        ],
        stream: true,
        max_tokens: 200,
      });

      let fullText = '';
      let chunkCount = 0;
      for await (const chunk of completion) {
        chunkCount++;
        const delta = chunk.choices?.[0]?.delta?.content || '';
        fullText += delta;
      }
      const latency = Date.now() - start;
      console.log(`  -> Status: PASS`);
      console.log(`  -> TTFT / Total Latency: ${latency}ms`);
      console.log(`  -> Chunks: ${chunkCount}`);
      console.log(`  -> Response: "${fullText.trim()}"`);
    } catch (err) {
      console.log(`  -> Status: FAIL (${err.message})`);
    }
  }
}

async function testGeminiModels() {
  console.log('\n====================================');
  console.log('TESTING ACTIVE GEMINI MODELS');
  console.log('====================================');

  const models = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash'
  ];

  for (const modelId of models) {
    process.stdout.write(`\nTesting Gemini model: ${modelId}...\n`);
    const start = Date.now();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello, explain what you can do in one sentence.' }] }],
          generationConfig: { maxOutputTokens: 300 }
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log(`  -> Status: FAIL (HTTP ${res.status}: ${txt})`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) fullText += text;
            } catch (e) {}
          }
        }
      }
      const latency = Date.now() - start;
      console.log(`  -> Status: PASS`);
      console.log(`  -> Latency: ${latency}ms`);
      console.log(`  -> Chunks: ${chunkCount}`);
      console.log(`  -> Response: "${fullText.trim()}"`);
    } catch (err) {
      console.log(`  -> Status: FAIL (${err.message})`);
    }
  }
}

async function run() {
  await testGroqModels();
  await testGeminiModels();
}

run();
