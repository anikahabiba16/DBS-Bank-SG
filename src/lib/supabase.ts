import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function getProjectRef(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return host.endsWith('.supabase.co') ? host.slice(0, -'.supabase.co'.length) : null;
  } catch {
    return null;
  }
}

function getLegacyKeyProjectRef(key: string): string | null {
  if (!key.startsWith('eyJ')) return null;
  try {
    const payload = key.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    const claims = JSON.parse(decoded);
    return typeof claims.ref === 'string' ? claims.ref : null;
  } catch {
    return null;
  }
}

const urlProjectRef = getProjectRef(supabaseUrl);
const keyProjectRef = getLegacyKeyProjectRef(supabaseAnonKey);
const hasValidUrl = Boolean(
  supabaseUrl.startsWith('https://') &&
  urlProjectRef &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project-id')
);
const hasValidKey = Boolean(
  supabaseAnonKey &&
  !supabaseAnonKey.includes('dummy') &&
  !supabaseAnonKey.includes('...')
);
const projectMatches = !keyProjectRef || !urlProjectRef || keyProjectRef === urlProjectRef;

export const isSupabaseConfigured = hasValidUrl && hasValidKey && projectMatches;

/**
 * Persistent storage adapter for Supabase Auth to guarantee session persistence across page reloads.
 */
const inMemoryAuthStorage = {
  _store: new Map<string, string>(),
  getItem: (key: string): string | null => {
    let val = inMemoryAuthStorage._store.get(key) ?? null;
    if (val === null && typeof window !== 'undefined') {
      try {
        val = window.sessionStorage?.getItem(key) ?? null;
        if (val !== null) inMemoryAuthStorage._store.set(key, val);
      } catch {}
    }
    return val;
  },
  setItem: (key: string, value: string): void => {
    inMemoryAuthStorage._store.set(key, value);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage?.setItem(key, value);
      } catch {}
    }
  },
  removeItem: (key: string): void => {
    inMemoryAuthStorage._store.delete(key);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage?.removeItem(key);
      } catch {}
    }
  },
};

export const supabase = createClient(
  hasValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
  hasValidKey ? supabaseAnonKey : 'placeholder-public-key-not-configured',
  {
    auth: {
      persistSession: true,
      storage: inMemoryAuthStorage, // Strict Zero-LocalStorage in-memory adapter
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // Provide custom non-blocking lock to prevent browser Web Locks API contention
      // and eliminate "@supabase/gotrue-js: Lock was not released within 5000ms" console warnings
      lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
        return await fn();
      },
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);
