import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Helper to clear session manually if refresh token is invalid
const clearStaleSession = () => {
  console.warn("Global catch: Clearing stale Supabase session from localStorage");
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase.auth.token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // If we're on a protected page, force a reload to login
    const protectedPaths = ['/dashboard', '/reviews', '/insights', '/qr-code', '/google-link', '/subscribe', '/settings'];
    const isProtected = protectedPaths.some(path => window.location.pathname.startsWith(path));
    
    if (isProtected) {
      window.location.href = '/login?reason=session_expired';
    }
  } catch (e) {
    console.error("Error clearing stale session:", e);
  }
};

// Intercept auth errors in a way that works for most calls
// Note: This is a bit of a hack since Supabase JS doesn't have official interceptors
const originalFrom = supabaseClient.from.bind(supabaseClient);
supabaseClient.from = ((table: string) => {
  const queryBuilder = originalFrom(table);
  
  // We wrap the thenable to catch errors
  const originalThen = queryBuilder.then.bind(queryBuilder);
  queryBuilder.then = (onfulfilled?: any, onrejected?: any) => {
    return originalThen((result: any) => {
      if (result?.error) {
        const msg = result.error.message || String(result.error);
        if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token") || msg.includes("refresh_token_not_found")) {
          clearStaleSession();
        }
      }
      return onfulfilled ? onfulfilled(result) : result;
    }, (error: any) => {
      const msg = error?.message || String(error);
      if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token") || msg.includes("refresh_token_not_found")) {
        clearStaleSession();
      }
      return onrejected ? onrejected(error) : Promise.reject(error);
    });
  };
  
  return queryBuilder;
}) as any;

// Wrap auth methods too
const originalGetUser = supabaseClient.auth.getUser.bind(supabaseClient.auth);
supabaseClient.auth.getUser = (async (jwt?: string) => {
  const result = await originalGetUser(jwt);
  if (result.error) {
    const msg = result.error.message || String(result.error);
    if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token") || msg.includes("refresh_token_not_found")) {
      clearStaleSession();
    }
  }
  return result;
}) as any;

const originalGetSession = supabaseClient.auth.getSession.bind(supabaseClient.auth);
supabaseClient.auth.getSession = (async () => {
  const result = await originalGetSession();
  if (result.error) {
    const msg = result.error.message || String(result.error);
    if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token") || msg.includes("refresh_token_not_found")) {
      clearStaleSession();
    }
  }
  return result;
}) as any;

const originalOnAuthStateChange = supabaseClient.auth.onAuthStateChange.bind(supabaseClient.auth);
supabaseClient.auth.onAuthStateChange = ((callback: any) => {
  return originalOnAuthStateChange(async (event: any, session: any) => {
    if (event === 'TOKEN_REFRESH_REVOKED') {
      clearStaleSession();
    }
    return callback(event, session);
  });
}) as any;

export const supabase = supabaseClient;

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
};
