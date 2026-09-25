import fs from 'fs';

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

async function testGeminiSpeed() {
  const models = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash'
  ];

  for (const m of models) {
    const start = Date.now();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Explain in one sentence what you can do.' }] }],
          generationConfig: {
            maxOutputTokens: 1000,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });

      if (!res.ok) {
        console.log(`${m}: FAIL (HTTP ${res.status} - ${await res.text()})`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let firstTokenTime = 0;
      let fullText = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!firstTokenTime) firstTokenTime = Date.now() - start;
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
      const totalTime = Date.now() - start;
      console.log(`${m}: PASS | TTFT: ${firstTokenTime}ms | Total: ${totalTime}ms | Chunks: ${chunkCount} | Response: "${fullText.trim()}"`);
    } catch (e) {
      console.log(`${m}: ERROR: ${e.message}`);
    }
  }
}

testGeminiSpeed();
