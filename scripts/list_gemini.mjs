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

async function listGeminiModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Gemini Models list:', data.models?.map(m => ({ name: m.name, supportedGenerationMethods: m.supportedGenerationMethods })));
}

listGeminiModels();
