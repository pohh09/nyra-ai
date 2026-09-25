const SUPABASE_URL = 'https://vqchjvlzzvecadehdoek.supabase.co';
const ANON_KEY = 'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U';

async function runAudit() {
  console.log('=== REAL-TIME SUPABASE AUTH DIAGNOSTIC ===');
  console.log('Target Project:', SUPABASE_URL);

  const testEmail = `live_diag_${Date.now()}@gmail.com`;
  const testPassword = 'Password123!Secure';

  console.log('\n1. Calling POST /auth/v1/signup with fresh email:', testEmail);
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  console.log('Signup HTTP Status:', signupRes.status);
  const signupJson = await signupRes.json();
  console.log('Signup Response:', JSON.stringify(signupJson, null, 2));

  console.log('\n2. Calling POST /auth/v1/token?grant_type=password immediately...');
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  console.log('Login HTTP Status:', loginRes.status);
  const loginJson = await loginRes.json();
  console.log('Login Response:', JSON.stringify(loginJson, null, 2));
}

runAudit().catch(console.error);
