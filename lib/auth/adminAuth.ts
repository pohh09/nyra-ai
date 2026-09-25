import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface AdminAuthResult {
  isAuthorized: boolean;
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
  error?: string;
  status: 200 | 401 | 403;
}

/**
 * Get configured admin emails from environment variables.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Server-side strict validation for administrator authorization.
 * Checks:
 * 1. Authenticated session exists in Supabase.
 * 2. Profile role in public.profiles is 'admin' OR email is in ADMIN_EMAILS list.
 */
export async function verifyAdminUser(request?: NextRequest): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isAuthorized: false,
      user: null,
      error: 'Supabase credentials are not configured.',
      status: 401,
    };
  }

  let authenticatedUser: { id: string; email?: string } | null = null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (user && !authError) {
      authenticatedUser = { id: user.id, email: user.email };
    }
  } catch (err) {
    console.warn('Admin auth session lookup error:', err);
  }

  // If not authenticated via Supabase session cookies, deny access
  if (!authenticatedUser || !authenticatedUser.id) {
    return {
      isAuthorized: false,
      user: null,
      error: 'Unauthorized: Authentication required to access administration dashboard.',
      status: 401,
    };
  }

  const callerEmail = (authenticatedUser.email || '').toLowerCase().trim();
  const adminEmails = getAdminEmails();

  // 1. Check if email is in explicit environment ADMIN_EMAILS list
  if (callerEmail && adminEmails.length > 0 && adminEmails.includes(callerEmail)) {
    return {
      isAuthorized: true,
      user: {
        id: authenticatedUser.id,
        email: callerEmail,
        role: 'admin',
      },
      status: 200,
    };
  }

  // 2. Query public.profiles table for database-backed role === 'admin'
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    if (!profError && profile) {
      if (profile.role === 'admin') {
        return {
          isAuthorized: true,
          user: {
            id: profile.id,
            email: profile.email || callerEmail,
            role: 'admin',
          },
          status: 200,
        };
      }
    }
  } catch (err) {
    console.warn('Admin profile role check exception:', err);
  }

  // Access Forbidden for normal non-admin users
  return {
    isAuthorized: false,
    user: {
      id: authenticatedUser.id,
      email: callerEmail,
      role: 'user',
    },
    error: 'Forbidden: You do not possess administrator permissions for Nyra AI.',
    status: 403,
  };
}
