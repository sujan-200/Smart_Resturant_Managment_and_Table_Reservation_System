import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const roleOptions = ['customer', 'admin', 'waiter', 'kitchen'];

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function buildProfileFromUser(user, overrides = {}) {
  const metadata = user?.user_metadata || {};

  return {
    id: overrides.id || user?.id || '',
    name: overrides.name || metadata.name || user?.email?.split('@')[0] || 'Restaurant user',
    email: overrides.email || user?.email || '',
    role: overrides.role || metadata.role || 'customer',
    phone: overrides.phone || metadata.phone || '',
    avatar: overrides.avatar || metadata.avatar || '',
  };
}

export async function upsertProfile(client, profileInput) {
  if (!client || !profileInput?.id) {
    return null;
  }

  const payload = {
    id: profileInput.id,
    name: profileInput.name || 'Restaurant user',
    email: profileInput.email || '',
    role: roleOptions.includes(profileInput.role) ? profileInput.role : 'customer',
    phone: profileInput.phone || '',
    avatar: profileInput.avatar || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('profiles').upsert(payload, { onConflict: 'id' }).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchProfile(client, userId) {
  if (!client || !userId) {
    return null;
  }

  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
