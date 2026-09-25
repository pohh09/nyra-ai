import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/chat-ui';

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Can happen in Server Components
            }
          },
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        // Log Google OAuth login activity
        try {
          await supabase.from('auth_activity').insert({
            user_id: data.user.id,
            email: data.user.email,
            event_type: 'google_login',
            provider: 'google',
            created_at: new Date().toISOString(),
          });
        } catch {}

        // Check if user has completed onboarding
        let targetRoute = '/chat-ui';
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single();

          if (!profile || profile.onboarding_completed === false) {
            targetRoute = '/onboarding';
          }
        } catch {
          // If profile check fails, route to onboarding for safety
          targetRoute = '/onboarding';
        }

        return NextResponse.redirect(`${origin}${targetRoute}`);
      }
    }
  }

  // Return user to login with error message if exchange failed
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
