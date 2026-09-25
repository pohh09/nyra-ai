import fs from 'fs';

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

async function testGeminiRest() {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-3.6-flash'];

  for (const model of models) {
    const start = Date.now();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say hello in 5 words.' }] }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(`❌ Gemini ${model} failed (${res.status}): ${err.slice(0, 100)}`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let ttft = null;
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (ttft === null) ttft = Date.now() - start;
        const chunk = decoder.decode(value);
        text += chunk;
      }

      console.log(`✅ Gemini ${model}: TTFT=${ttft}ms | Total=${Date.now() - start}ms`);
    } catch (e) {
      console.log(`❌ Gemini ${model} error: ${e.message}`);
    }
  }
}

testGeminiRest();
