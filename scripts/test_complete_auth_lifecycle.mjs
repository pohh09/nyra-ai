const SUPABASE_URL = 'https://vqchjvlzzvecadehdoek.supabase.co';
const ANON_KEY = 'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U';

async function testCompleteLifecycle() {
  console.log('=== NYRA FULL END-TO-END AUTHENTICATION LIFECYCLE TEST ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  const testId = Date.now();
  const testEmail = `nyra_user_${testId}@gmail.com`;
  const testPassword = 'Password123!Secure';
  const testDisplayName = 'Nyra Tester';

  // Step 1: Sign Up
  console.log('1. Testing Sign Up (Creating fresh user)...');
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      data: { display_name: testDisplayName },
    }),
  });

  const signupData = await signupRes.json();
  assert(signupRes.status === 200, 'Sign Up returns HTTP 200', `Got status ${signupRes.status}`);
  assert(!!signupData.access_token, 'Sign Up immediately returns active JWT access_token');
  assert(!!signupData.user?.id, 'Sign Up creates valid user ID');
  assert(!!signupData.user?.email_confirmed_at, 'Sign Up user is immediately confirmed (email_confirmed_at is set)');

  const userId = signupData.user?.id;
  const initialAccessToken = signupData.access_token;
  console.log(`   Created User ID: ${userId}, Email: ${testEmail}`);

  // Step 2: Test User Profile Creation via REST
  console.log('\n2. Verifying User Profile Retrieval with Auth Token...');
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${initialAccessToken}`,
    },
  });
  const userData = await userRes.json();
  assert(userRes.status === 200, 'Authenticated user endpoint returns HTTP 200');
  assert(userData.id === userId, 'Retrieved user matches created user ID');

  // Step 3: Sign Out (Simulated by clearing token, then signing in)
  console.log('\n3. Testing Sign In with same Email + Password...');
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

  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Sign In returns HTTP 200', `Got status ${loginRes.status}`);
  assert(!!loginData.access_token, 'Sign In returns new valid access_token');
  assert(loginData.user?.id === userId, 'Sign In authenticates correct user ID');
  assert(!!loginData.user?.email_confirmed_at, 'Sign In user remains confirmed');

  // Step 4: Test Session Refresh (Refresh Token)
  console.log('\n4. Testing Session Refresh using refresh_token...');
  const refreshRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      refresh_token: loginData.refresh_token,
    }),
  });
  const refreshData = await refreshRes.json();
  assert(refreshRes.status === 200, 'Session refresh returns HTTP 200');
  assert(!!refreshData.access_token, 'Session refresh issues valid refreshed access_token');

  // Step 5: Test Duplicate Email Handling
  console.log('\n5. Testing Duplicate Account Registration...');
  const dupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
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
  const dupData = await dupRes.json();
  const isDuplicateSafelyHandled =
    dupRes.status === 400 ||
    dupRes.status === 422 ||
    (dupData.user?.identities && dupData.user.identities.length === 0);
  assert(isDuplicateSafelyHandled, 'Duplicate signup detected safely without exposing secrets');

  // Step 6: Test Invalid Password Rejection
  console.log('\n6. Testing Invalid Password Rejection...');
  const badLoginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'IncorrectPassword999!',
    }),
  });
  assert(badLoginRes.status === 400, 'Invalid password rejected with HTTP 400');

  console.log(`\n========================================`);
  console.log(`LIFECYCLE TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

testCompleteLifecycle().catch((err) => {
  console.error('Lifecycle test error:', err);
  process.exit(1);
});
