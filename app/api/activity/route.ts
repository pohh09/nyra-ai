import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userId, email, provider, metadata } = body;

    const validEvents = [
      'signup',
      'login',
      'logout',
      'google_login',
      'failed_login',
      'guest_started',
      'guest_limit_reached',
    ];

    if (!eventType || !validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl) {
      const cookieStore = await cookies();
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined;
      const userAgent = request.headers.get('user-agent') || undefined;

      // Prefer service role client if configured, otherwise standard client
      if (supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        await adminClient.from('auth_activity').insert({
          user_id: userId || null,
          email: email || null,
          event_type: eventType,
          provider: provider || 'email',
          ip_address: ip,
          user_agent: userAgent,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        });
      } else if (supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        });

        await supabase.from('auth_activity').insert({
          user_id: userId || null,
          email: email || null,
          event_type: eventType,
          provider: provider || 'email',
          ip_address: ip,
          user_agent: userAgent,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Return graceful 200 so background activity logging never throws in caller
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
