import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key' &&
    !supabaseUrl.includes('placeholder')
  );
}

let clientInstance: any = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  if (!isSupabaseConfigured()) {
    // Safe proxy client that avoids throwing websocket/network errors when unconfigured
    const dummyHandler: ProxyHandler<any> = {
      get(_target, prop) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase unconfigured' } }),
            signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase unconfigured' } }),
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

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}

export const supabase = getSupabaseBrowserClient();
