import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqchjvlzzvecadehdoek.supabase.co';
const ANON_KEY = 'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U';

async function runTests() {
  console.log('=== NYRA AUTHENTICATION TEST SUITE ===\n');
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

  // 1. Password rejection check
  console.log('1. Testing Invalid Password Rejection...');
  const badLoginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: 'pujad@gmail.com',
      password: 'WrongPassword999!',
    }),
  });
  const badLoginData = await badLoginRes.json();
  assert(badLoginRes.status === 400, 'Invalid password is rejected with HTTP 400', JSON.stringify(badLoginData));

  // 2. Client Code Integrity: Check AuthContext & Signup page
  console.log('\n2. Verifying App Code Integrity...');
  const fs = await import('fs');
  const authContextContent = fs.readFileSync('lib/auth/AuthContext.tsx', 'utf-8');
  const signupPageContent = fs.readFileSync('app/signup/[[...signup]]/page.tsx', 'utf-8');
  const loginPageContent = fs.readFileSync('app/login/[[...login]]/page.tsx', 'utf-8');

  assert(!authContextContent.includes('requiresEmailConfirmation'), 'AuthContext does not enforce requiresEmailConfirmation');
  assert(!signupPageContent.includes('confirmationSent'), 'Signup page does not display check-your-email block');
  assert(signupPageContent.includes('/onboarding'), 'Signup redirects directly to /onboarding on success');
  assert(!loginPageContent.includes('email not confirmed'), 'Login page does not prompt for email confirmation link');

  // 3. Database Schema check: Auto confirm trigger exists
  console.log('\n3. Verifying SQL Schema Configuration...');
  const schemaContent = fs.readFileSync('lib/supabase/schema.sql', 'utf-8');
  assert(schemaContent.includes('auto_confirm_new_user'), 'Schema includes auto_confirm_new_user trigger function');
  assert(schemaContent.includes('on_auth_user_auto_confirm'), 'Schema includes on_auth_user_auto_confirm trigger on auth.users');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
