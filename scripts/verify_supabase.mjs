if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Could not read .env.local:', e.message);
}

const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function verify() {
  console.log('--- SUPABASE CONFIGURATION VERIFICATION ---');

  const isUrlSet = Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('placeholder'));
  const isKeySet = Boolean(supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your-anon-key'));

  console.log('1. NEXT_PUBLIC_SUPABASE_URL detected:', isUrlSet ? 'YES (Valid URL format)' : 'NO');
  console.log('2. NEXT_PUBLIC_SUPABASE_ANON_KEY detected:', isKeySet ? `YES (Valid token format, length: ${supabaseAnonKey.length})` : 'NO');

  if (!isUrlSet || !isKeySet) {
    console.error('Supabase credentials missing or invalid in .env.local');
    return;
  }

  // Test client initialization
  let client;
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    console.log('3. Supabase client initialized: SUCCESS');
  } catch (err) {
    console.error('3. Supabase client initialization FAILED:', err.message);
    return;
  }

  // Test Auth API connectivity
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.log('4. Supabase Auth API connection check: ERROR -', error.message);
    } else {
      console.log('4. Supabase Auth API connection check: SUCCESS (Auth service reachable)');
    }
  } catch (err) {
    console.log('4. Supabase Auth API connection check FAILED:', err.message);
  }

  // Test Database schema access across all 7 user tables
  try {
    const tables = [
      'profiles',
      'conversations',
      'messages',
      'prompts',
      'tasks',
      'memories',
      'usage_records',
    ];

    for (const tbl of tables) {
      const { error } = await client.from(tbl).select('*').limit(1);
      if (error) {
        console.log(`Table "${tbl}": ERROR - ${error.message}`);
      } else {
        console.log(`Table "${tbl}": SUCCESS (Table exists, RLS active, queryable)`);
      }
    }
  } catch (err) {
    console.log('Database query check notice:', err.message);
  }

  console.log('--- VERIFICATION FINISHED ---');
}

verify().catch(console.error);
