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

async function testGptOss20b() {
  const groq = new Groq({ apiKey: env.GROQ_API_KEY });
  const start = Date.now();
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: 'You are Nyra AI.' },
      { role: 'user', content: 'Explain in one sentence what you can do.' }
    ],
    max_tokens: 1000,
    reasoning_effort: 'low',
    stream: true,
  });

  let raw = '';
  for await (const chunk of completion) {
    raw += chunk.choices?.[0]?.delta?.content || '';
  }
  console.log(`Time: ${Date.now() - start}ms`);
  console.log('Raw Output:\n', raw);
}

testGptOss20b();
