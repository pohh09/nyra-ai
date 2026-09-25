async function testSignupApi() {
  const testEmail = `nyra_tester_${Date.now()}@gmail.com`;
  console.log('Testing Supabase Auth endpoint with:', testEmail);
  
  const res = await fetch('https://vqchjvlzzvecadehdoek.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U',
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      data: { display_name: 'Nyra Test User' }
    })
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response keys:', Object.keys(data));
  console.log('User ID:', data.user?.id);
  console.log('User Email:', data.user?.email);
  console.log('Confirmed at:', data.user?.email_confirmed_at || data.user?.confirmed_at);
  console.log('Identities count:', data.user?.identities?.length);
  console.log('Access token present:', !!data.access_token);
  console.log('Session present (data.session or access_token):', !!(data.session || data.access_token));
}

testSignupApi();
