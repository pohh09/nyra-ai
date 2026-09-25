import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vqchjvlzzvecadehdoek.supabase.co',
  'sb_publishable_evM8b4bJhu47bZTzkngD4w_WjRZnF7U'
);

async function test() {
  const testEmail = 'test_signup_' + Date.now() + '@example.com';
  console.log('Testing signup with:', testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
  });
  console.log('Error:', error);
  console.log('User:', data?.user?.id, data?.user?.email, 'confirmed_at:', data?.user?.email_confirmed_at);
  console.log('Session present:', !!data?.session);
}

test();
