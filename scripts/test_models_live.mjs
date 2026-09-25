import fs from 'fs';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// Read .env.local
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

async function checkGroq() {
  console.log('\n--- TESTING GROQ ---');
  if (!env.GROQ_API_KEY) {
    console.log('GROQ_API_KEY missing');
    return;
  }
  const groq = new Groq({ apiKey: env.GROQ_API_KEY });
  try {
    const list = await groq.models.list();
    console.log('Groq Available Models count:', list.data.length);
    const activeModelIds = list.data.map((m) => m.id);
    console.log('Groq Model IDs:', activeModelIds);

    // Test each model configured in our app with a real completion
    const testIds = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'qwen-2.5-32b',
      'deepseek-r1-distill-llama-70b'
    ];

    for (const modelId of testIds) {
      const isListed = activeModelIds.includes(modelId);
      process.stdout.write(`Testing Groq model: ${modelId} (in list: ${isListed})... `);
      const start = Date.now();
      try {
        const res = await groq.chat.completions.create({
          model: modelId,
          messages: [{ role: 'user', content: 'Say hello in 5 words' }],
          max_tokens: 30,
        });
        const latency = Date.now() - start;
        console.log(`[PASS] (${latency}ms): "${res.choices[0]?.message?.content?.trim()}"`);
      } catch (err) {
        const latency = Date.now() - start;
        console.log(`[FAIL] (${latency}ms): ${err.message}`);
      }
    }
  } catch (e) {
    console.error('Groq list error:', e.message);
  }
}

async function checkOpenAI() {
  console.log('\n--- TESTING OPENAI ---');
  if (!env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY missing');
    return;
  }
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const testIds = ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o3-mini', 'gpt-3.5-turbo'];
  for (const modelId of testIds) {
    process.stdout.write(`Testing OpenAI model: ${modelId}... `);
    const start = Date.now();
    try {
      const isO1 = modelId.startsWith('o1') || modelId.startsWith('o3');
      const params = {
        model: modelId,
        messages: [{ role: 'user', content: 'Say hello in 5 words' }],
      };
      if (isO1) {
        params.max_completion_tokens = 50;
      } else {
        params.max_tokens = 30;
      }
      const res = await openai.chat.completions.create(params);
      const latency = Date.now() - start;
      console.log(`[PASS] (${latency}ms): "${res.choices[0]?.message?.content?.trim()}"`);
    } catch (err) {
      const latency = Date.now() - start;
      console.log(`[FAIL] (${latency}ms): ${err.message}`);
    }
  }
}

async function checkGemini() {
  console.log('\n--- TESTING GEMINI ---');
  if (!env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY missing');
    return;
  }
  const testIds = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];

  for (const modelId of testIds) {
    process.stdout.write(`Testing Gemini model: ${modelId}... `);
    const start = Date.now();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${env.GEMINI_API_KEY}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say hello in 5 words' }] }],
          generationConfig: { maxOutputTokens: 30 }
        })
      });
      const data = await res.json();
      const latency = Date.now() - start;
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`[PASS] (${latency}ms): "${data.candidates[0].content.parts[0].text.trim()}"`);
      } else {
        console.log(`[FAIL] (${latency}ms): HTTP ${res.status} - ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      const latency = Date.now() - start;
      console.log(`[FAIL] (${latency}ms): ${err.message}`);
    }
  }
}

async function checkAnthropic() {
  console.log('\n--- TESTING ANTHROPIC ---');
  if (!env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not configured in .env.local (Provider should be marked unavailable)');
    return;
  }
}

async function checkOpenRouter() {
  console.log('\n--- TESTING OPENROUTER ---');
  if (!env.OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY not configured in .env.local (Provider should be marked unavailable)');
    return;
  }
}

async function run() {
  await checkGroq();
  await checkOpenAI();
  await checkGemini();
  await checkAnthropic();
  await checkOpenRouter();
}

run();
