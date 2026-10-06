import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const envSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const envSupabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

let dynamicSupabaseUrl = '';
let dynamicSupabaseAnonKey = '';
let clientInstance: any = null;

export function setDynamicSupabaseConfig(url: string, anonKey: string): void {
  if (url && anonKey) {
    dynamicSupabaseUrl = url.trim();
    dynamicSupabaseAnonKey = anonKey.trim();
    clientInstance = createBrowserClient(dynamicSupabaseUrl, dynamicSupabaseAnonKey);
  }
}

export function isSupabaseConfigured(): boolean {
  const url = dynamicSupabaseUrl || envSupabaseUrl;
  const key = dynamicSupabaseAnonKey || envSupabaseAnonKey;
  return Boolean(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-anon-key' &&
    !url.includes('placeholder')
  );
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const url = dynamicSupabaseUrl || envSupabaseUrl;
  const key = dynamicSupabaseAnonKey || envSupabaseAnonKey;

  if (!isSupabaseConfigured()) {
    const dummyHandler: ProxyHandler<any> = {
      get(_target, prop) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({
              data: { user: null, session: null },
              error: { message: 'Supabase authentication is not configured in this environment.' },
            }),
            signUp: async () => ({
              data: { user: null, session: null },
              error: { message: 'Supabase authentication is not configured in this environment.' },
            }),
            signOut: async () => ({ error: null }),
          };
        }
        if (prop === 'from') {
          return () => {
            const chainable: any = {
              select: () => chainable,
              insert: () => chainable,
              update: () => chainable,
              upsert: () => chainable,
              delete: () => chainable,
              eq: () => chainable,
              in: () => chainable,
              order: () => chainable,
              single: async () => ({ data: null, error: null }),
              maybeSingle: async () => ({ data: null, error: null }),
              then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
            };
            return chainable;
          };
        }
        if (prop === 'rpc') {
          return async () => ({ data: null, error: null });
        }
        return () => {};
      },
    };
    clientInstance = new Proxy({}, dummyHandler);
    return clientInstance;
  }

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}

export const supabase = getSupabaseBrowserClient();
