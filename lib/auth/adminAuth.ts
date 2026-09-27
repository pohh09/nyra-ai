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

export const DESIGNATED_ADMIN_EMAIL = 'pooja@gmail.com';

/**
 * Get configured admin emails. Always includes the designated Nyra administrator pooja@gmail.com,
 * along with any additional admin emails from environment variables.
 */
export function getAdminEmails(): string[] {
  const envEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!envEmails.includes(DESIGNATED_ADMIN_EMAIL)) {
    envEmails.push(DESIGNATED_ADMIN_EMAIL);
  }
  return envEmails;
}

/**
 * Server-side strict validation for administrator authorization.
 * Checks:
 * 1. Authenticated session exists in Supabase (validated cryptographically via getUser).
 * 2. Authenticated user's email is in ADMIN_EMAILS (including pooja@gmail.com) OR profile role is 'admin'.
 */
export async function verifyAdminUser(request?: NextRequest): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isAuthorized: false,
      user: null,
      error: 'Supabase credentials are not configured.',
      status: 401,
    };
  }

  let authenticatedUser: { id: string; email?: string } | null = null;

  // 1. Try bearer token authorization if header is present
  const authHeader = request?.headers.get('authorization') || request?.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  if (bearerToken) {
    try {
      const { data: { user: tokenUser }, error: tokenErr } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenErr) {
        authenticatedUser = { id: tokenUser.id, email: tokenUser.email };
      }
    } catch (err) {
      console.warn('Admin auth bearer token check exception:', err);
    }
  }

  // 2. Fall back to cookie session lookup if bearer token was not provided or invalid
  if (!authenticatedUser) {
    try {
      const { data: { user: cookieUser }, error: cookieErr } = await supabase.auth.getUser();
      if (cookieUser && !cookieErr) {
        authenticatedUser = { id: cookieUser.id, email: cookieUser.email };
      }
    } catch (err) {
      console.warn('Admin auth cookie session lookup exception:', err);
    }
  }

  // If not authenticated via Supabase session or token, deny access (401 Unauthorized)
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

  // 1. Check if authenticated email matches pooja@gmail.com or configured ADMIN_EMAILS
  if (callerEmail && adminEmails.includes(callerEmail)) {
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
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    if (!profError && profile && profile.role === 'admin') {
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
  } catch (err) {
    console.warn('Admin profile role check exception:', err);
  }

  // Access Forbidden for normal non-admin users (403 Forbidden)
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
