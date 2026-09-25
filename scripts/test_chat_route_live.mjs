// Test all models and features against http://localhost:3000/api/chat
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function sendChatRequest(body) {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunkCount++;
    fullText += decoder.decode(value, { stream: true });
  }

  return { fullText: fullText.trim(), chunkCount };
}

async function runEndToEndChatTests() {
  console.log('\n================================================================');
  console.log('       TESTING /api/chat ENDPOINTS ACROSS ALL 4 MODES           ');
  console.log('================================================================\n');

  const modes = ['fast', 'balanced', 'advanced', 'reasoning'];

  for (const mode of modes) {
    process.stdout.write(`Testing /api/chat with Mode [${mode.toUpperCase()}]... `);
    const start = Date.now();
    try {
      const { fullText, chunkCount } = await sendChatRequest({
        modelId: mode,
        messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
      });
      const latency = Date.now() - start;
      console.log(`[PASS] (${latency}ms, ${chunkCount} chunks): "${fullText.replace(/\n/g, ' ')}"`);
    } catch (e) {
      console.log(`[FAIL]: ${e.message}`);
    }
  }

  // Test Web Search integration
  process.stdout.write('\nTesting /api/chat with [WEB SEARCH ENABLED]... ');
  try {
    const start = Date.now();
    const { fullText, chunkCount } = await sendChatRequest({
      modelId: 'balanced',
      webSearch: true,
      messages: [{ role: 'user', content: 'What is the capital of France and what is the current year?' }],
    });
    const latency = Date.now() - start;
    console.log(`[PASS] (${latency}ms, ${chunkCount} chunks): "${fullText.slice(0, 100)}..."`);
  } catch (e) {
    console.log(`[FAIL]: ${e.message}`);
  }

  // Test Image Vision integration
  process.stdout.write('\nTesting /api/chat with [IMAGE ATTACHMENT]... ');
  try {
    const start = Date.now();
    const { fullText, chunkCount } = await sendChatRequest({
      modelId: 'balanced',
      messages: [
        {
          role: 'user',
          content: 'What color is this image?',
          image: TEST_IMAGE_BASE64,
        },
      ],
    });
    const latency = Date.now() - start;
    console.log(`[PASS] (${latency}ms, ${chunkCount} chunks): "${fullText.slice(0, 100)}..."`);
  } catch (e) {
    console.log(`[FAIL]: ${e.message}`);
  }

  // Test PDF Document integration
  process.stdout.write('\nTesting /api/chat with [ATTACHED PDF DOCUMENT]... ');
  try {
    const start = Date.now();
    const { fullText, chunkCount } = await sendChatRequest({
      modelId: 'balanced',
      pdfText: 'Company Revenue in 2025 was $42.5 Million USD with 84% gross margins.',
      messages: [{ role: 'user', content: 'What was the revenue and gross margin according to the document?' }],
    });
    const latency = Date.now() - start;
    console.log(`[PASS] (${latency}ms, ${chunkCount} chunks): "${fullText.slice(0, 100)}..."`);
  } catch (e) {
    console.log(`[FAIL]: ${e.message}`);
  }

  // Test Model Switching in Multi-turn
  process.stdout.write('\nTesting [MULTI-TURN MODEL SWITCHING] (Fast -> Advanced -> Reasoning)... ');
  try {
    const start = Date.now();
    // Turn 1 with Fast
    const turn1 = await sendChatRequest({
      modelId: 'fast',
      messages: [{ role: 'user', content: 'Remember the secret code: NYRA-9988' }],
    });

    // Turn 2 with Advanced
    const turn2 = await sendChatRequest({
      modelId: 'advanced',
      messages: [
        { role: 'user', content: 'Remember the secret code: NYRA-9988' },
        { role: 'assistant', content: turn1.fullText },
        { role: 'user', content: 'What is the secret code I gave you earlier?' },
      ],
    });

    // Turn 3 with Reasoning
    const turn3 = await sendChatRequest({
      modelId: 'reasoning',
      messages: [
        { role: 'user', content: 'Remember the secret code: NYRA-9988' },
        { role: 'assistant', content: turn1.fullText },
        { role: 'user', content: 'What is the secret code I gave you earlier?' },
        { role: 'assistant', content: turn2.fullText },
        { role: 'user', content: 'Repeat only the secret code.' },
      ],
    });

    const latency = Date.now() - start;
    if (turn2.fullText.includes('NYRA-9988') && turn3.fullText.includes('NYRA-9988')) {
      console.log(`[PASS] (${latency}ms): Context persisted seamlessly across all 3 models!`);
    } else {
      console.log(`[FAIL]: Context lost during model switch`);
    }
  } catch (e) {
    console.log(`[FAIL]: ${e.message}`);
  }

  console.log('\n================================================================\n');
}

runEndToEndChatTests();
