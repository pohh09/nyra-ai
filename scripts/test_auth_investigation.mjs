import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vqchjvlzzvecadehdoek.supabase.co';
const ANON_KEY = 'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U';

async function runInvestigation() {
  console.log('=== NYRA AUTHENTICATION DIAGNOSTIC & INVESTIGATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, detail) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }
  console.log('1. Checking Project Environment Configuration...');
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  assert(envContent.includes(SUPABASE_URL), 'Supabase URL matches between client and server');
  assert(envContent.includes(ANON_KEY), 'Supabase publishable key matches between client and server');
  console.log('\n2. Verifying Email Normalization & Safe Fallback...');
  const authContext = fs.readFileSync('lib/auth/AuthContext.tsx', 'utf-8');
  const authCard = fs.readFileSync('components/auth/AuthCard.tsx', 'utf-8');

  assert(authContext.includes('email.trim().toLowerCase()'), 'AuthContext normalizes email to lowercase');
  assert(authCard.includes('loginEmail.trim().toLowerCase()'), 'AuthCard normalizes login email to lowercase');
  assert(authCard.includes('signupEmail.trim().toLowerCase()'), 'AuthCard normalizes signup email to lowercase');
  console.log('\n3. Testing Supabase Login Error Response...');
  const badLoginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: 'nonexistent_user_999@gmail.com',
      password: 'WrongPassword123!',
    }),
  });
  const badLoginData = await badLoginRes.json();
  console.log('   Bad login response:', badLoginRes.status, badLoginData.msg || badLoginData.error_description);
  assert(badLoginRes.status === 400, 'Supabase correctly rejects non-existent/invalid credentials with 400');
  console.log('\n4. Verifying No Local PBKDF2 Fallback when Supabase is Configured...');
  assert(!authContext.includes('if (!localRes.success && configured)'), 'No local auth fallback triggered when Supabase configured');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runInvestigation().catch((err) => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
