import fs from 'fs';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const keys = [];
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        keys.push(trimmed.slice(0, idx).trim());
      }
    }
  }
  console.log('Configured keys in .env.local:', keys);
} catch (e) {
  console.error(e.message);
}
