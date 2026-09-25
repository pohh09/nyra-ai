import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

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

async function testOtherProviders() {
  if (process.env.GEMINI_API_KEY) {
    console.log('\n--- Testing Gemini 2.5 Flash & 1.5 Flash ---');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const m of geminiModels) {
      const start = Date.now();
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContentStream('Say hello in 5 words.');
        let ttft = null;
        let text = '';
        for await (const chunk of result.stream) {
          if (ttft === null) ttft = Date.now() - start;
          text += chunk.text();
        }
        console.log(`  ✅ Gemini ${m}: TTFT=${ttft}ms | Total=${Date.now() - start}ms | Output: "${text.trim()}"`);
      } catch (e) {
        console.log(`  ❌ Gemini ${m} failed (${Date.now() - start}ms): ${e.message}`);
      }
    }
  }

  if (process.env.OPENAI_API_KEY) {
    console.log('\n--- Testing OpenAI Models ---');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const oaiModels = ['gpt-4o-mini'];
    for (const m of oaiModels) {
      const start = Date.now();
      try {
        const stream = await openai.chat.completions.create({
          model: m,
          messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
          stream: true,
          max_tokens: 50,
        });
        let ttft = null;
        let text = '';
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta) {
            if (ttft === null) ttft = Date.now() - start;
            text += delta;
          }
        }
        console.log(`  ✅ OpenAI ${m}: TTFT=${ttft}ms | Total=${Date.now() - start}ms | Output: "${text.trim()}"`);
      } catch (e) {
        console.log(`  ❌ OpenAI ${m} failed (${Date.now() - start}ms): ${e.message}`);
      }
    }
  }
}

testOtherProviders();
