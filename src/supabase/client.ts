import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function signUp(email: string, password: string): Promise<{ success: boolean; needConfirm?: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  // session 为 null 说明需要邮箱确认
  if (!data.session) return { success: true, needConfirm: true };
  return { success: true };
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}