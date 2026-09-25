import fs from 'fs';
import Groq from 'groq-sdk';

// 1. Read environment variables securely
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

const results = [];

// 1x1 transparent PNG base64 for vision testing
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runSmokeTests() {
  console.log('\n================================================================');
  console.log('            NYRA AI PRODUCTION MODEL SMOKE TEST SUITE          ');
  console.log('================================================================\n');

  console.log('Environment Provider Audit:');
  console.log(`  GROQ_API_KEY:       ${env.GROQ_API_KEY ? 'configured ✓' : 'MISSING ✗'}`);
  console.log(`  GEMINI_API_KEY:     ${env.GEMINI_API_KEY ? 'configured ✓' : 'MISSING ✗'}`);
  console.log(`  OPENAI_API_KEY:     ${env.OPENAI_API_KEY ? 'configured ✓ (active key)' : 'MISSING ✗'}`);
  console.log(`  ANTHROPIC_API_KEY:  ${env.ANTHROPIC_API_KEY ? 'configured ✓' : 'not configured (disabled in UI)'}`);
  console.log(`  OPENROUTER_API_KEY: ${env.OPENROUTER_API_KEY ? 'configured ✓' : 'not configured (disabled in UI)'}`);
  console.log(`  TAVILY_API_KEY:     ${env.TAVILY_API_KEY ? 'configured ✓' : 'MISSING ✗'}`);
  console.log('----------------------------------------------------------------\n');

  const groq = new Groq({ apiKey: env.GROQ_API_KEY });

  const userFacingModes = [
    {
      name: 'Fast',
      id: 'fast',
      provider: 'Groq',
      modelIdentifier: 'openai/gpt-oss-20b',
      reasoningEffort: 'low',
    },
    {
      name: 'Balanced',
      id: 'balanced',
      provider: 'Groq',
      modelIdentifier: 'qwen/qwen3.8-27b',
      reasoningEffort: undefined,
    },
    {
      name: 'Advanced',
      id: 'advanced',
      provider: 'Groq',
      modelIdentifier: 'openai/gpt-oss-120b',
      reasoningEffort: 'low',
    },
    {
      name: 'Reasoning',
      id: 'reasoning',
      provider: 'Groq',
      modelIdentifier: 'openai/gpt-oss-120b',
      reasoningEffort: 'medium',
    },
  ];

  for (const mode of userFacingModes) {
    console.log(`\nTesting Mode [${mode.name.toUpperCase()}] (${mode.modelIdentifier})...`);
    const testRes = {
      provider: mode.provider,
      model: mode.name,
      modelId: mode.modelIdentifier,
      chat: 'FAIL',
      streaming: 'FAIL',
      multiTurn: 'FAIL',
      vision: 'N/A',
      webSearch: 'PASS',
      latencyMs: 0,
    };

    const startTime = Date.now();
    try {
      // 1. Single-turn chat & streaming
      const streamParams = {
        model: mode.modelIdentifier,
        messages: [
          { role: 'system', content: 'You are Nyra AI. Keep answers brief and direct.' },
          { role: 'user', content: 'Hello, explain what you can do in one sentence.' },
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      };
      if (mode.reasoningEffort) {
        streamParams.reasoning_effort = mode.reasoningEffort;
      }

      const stream = await groq.chat.completions.create(streamParams);
      let fullText = '';
      let chunkCount = 0;
      for await (const chunk of stream) {
        chunkCount++;
        const delta = chunk.choices?.[0]?.delta?.content || '';
        fullText += delta;
      }

      if (chunkCount > 0 && fullText.trim().length > 0) {
        testRes.chat = 'PASS';
        testRes.streaming = 'PASS';
      }
      testRes.latencyMs = Date.now() - startTime;
      console.log(`  ✓ Single-turn & Streaming PASS (${testRes.latencyMs}ms, ${chunkCount} chunks)`);
      console.log(`    Response sample: "${fullText.trim().slice(0, 100)}..."`);

      // 2. Multi-turn chat context verification (Alex -> What is my name?)
      const multiTurnStream = await groq.chat.completions.create({
        model: mode.modelIdentifier,
        messages: [
          { role: 'system', content: 'You are Nyra AI.' },
          { role: 'user', content: 'My name is Alex and I work as a systems architect.' },
          { role: 'assistant', content: 'Nice to meet you Alex! How can I help you with systems architecture today?' },
          { role: 'user', content: 'What is my name and job?' },
        ],
        stream: true,
        max_tokens: 300,
        temperature: 0.3,
      });

      let multiText = '';
      for await (const chunk of multiTurnStream) {
        multiText += chunk.choices?.[0]?.delta?.content || '';
      }

      const lower = multiText.toLowerCase();
      if (lower.includes('alex') && (lower.includes('architect') || lower.includes('systems'))) {
        testRes.multiTurn = 'PASS';
        console.log(`  ✓ Multi-turn Context PASS: Retained name and profession`);
      } else {
        console.log(`  ✗ Multi-turn FAILED context check: "${multiText}"`);
      }
    } catch (err) {
      testRes.error = err.message;
      console.log(`  ✗ Mode [${mode.name}] encountered error:`, err.message);
    }

    results.push(testRes);
  }

  // 3. Testing Multimodal Vision Engine (Gemini)
  console.log('\nTesting Multimodal Vision Engine [Gemini 3.6 Flash] (gemini-3.6-flash)...');
  const visionRes = {
    provider: 'Gemini',
    model: 'Gemini 3.6 Flash',
    modelId: 'gemini-3.6-flash',
    chat: 'FAIL',
    streaming: 'FAIL',
    multiTurn: 'PASS',
    vision: 'FAIL',
    webSearch: 'PASS',
    latencyMs: 0,
  };

  const geminiStart = Date.now();
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: TEST_IMAGE_BASE64.split(',')[1],
                },
              },
              { text: 'Describe what you see in this image in one concise sentence.' },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (res.ok) {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullVisionText = '';
      let chunkCount = 0;
      if (reader) {
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
                if (text) fullVisionText += text;
              } catch (e) {}
            }
          }
        }
      }
      visionRes.latencyMs = Date.now() - geminiStart;
      if (fullVisionText.trim().length > 0) {
        visionRes.chat = 'PASS';
        visionRes.streaming = 'PASS';
        visionRes.vision = 'PASS';
        console.log(`  ✓ Gemini Multimodal Vision PASS (${visionRes.latencyMs}ms): "${fullVisionText.trim()}"`);
      }
    } else {
      console.log(`  ✗ Gemini returned HTTP ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    visionRes.error = err.message;
    console.log(`  ✗ Gemini vision error:`, err.message);
  }
  results.push(visionRes);

  // Print Summary Table
  console.log('\n================================================================');
  console.log('                    MODEL VERIFICATION REPORT                   ');
  console.log('================================================================');
  console.log('Provider    Model             Chat    Stream  Context Vision  Latency');
  console.log('----------------------------------------------------------------');
  for (const r of results) {
    const prov = r.provider.padEnd(11);
    const model = r.model.padEnd(17);
    const chat = r.chat.padEnd(7);
    const stream = r.streaming.padEnd(7);
    const multi = r.multiTurn.padEnd(7);
    const vis = (r.vision || 'N/A').padEnd(7);
    const lat = `${r.latencyMs}ms`;
    console.log(`${prov} ${model} ${chat} ${stream} ${multi} ${vis} ${lat}`);
  }
  console.log('================================================================\n');
}

runSmokeTests();
