import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { buildProfileFromUser, fetchProfile, isSupabaseConfigured, upsertProfile, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function mapSupabaseUser(supabaseUser, profile = null) {
  const fallback = buildProfileFromUser(supabaseUser);
  return {
    id: profile?.id || supabaseUser?.id,
    name: profile?.name || fallback.name,
    email: profile?.email || fallback.email,
    role: profile?.role || fallback.role,
    phone: profile?.phone || fallback.phone,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('restaurant-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('restaurant-token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let isMounted = true;

    async function hydrateSupabaseSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted || !session?.user) {
        return;
      }

      try {
        const profile = await fetchProfile(supabase, session.user.id);
        const mappedUser = mapSupabaseUser(session.user, profile);
        const tokenKey = 'restaurant-token';
        const storedToken = localStorage.getItem(tokenKey);

        if (!storedToken) {
          const response = await api.post('/auth/supabase-login', {
            name: mappedUser.name,
            email: mappedUser.email,
            role: mappedUser.role,
            phone: mappedUser.phone,
          });

          setUser(response.data.user);
          setToken(response.data.token);
          localStorage.setItem('restaurant-user', JSON.stringify(response.data.user));
          localStorage.setItem(tokenKey, response.data.token);
          return;
        }

        setUser(mappedUser);
        localStorage.setItem('restaurant-user', JSON.stringify(mappedUser));
      } catch (error) {
        console.error('Failed to hydrate Supabase session', error);
      }
    }

    hydrateSupabaseSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setToken('');
        localStorage.removeItem('restaurant-user');
        localStorage.removeItem('restaurant-token');
        return;
      }

      try {
        const profile = await fetchProfile(supabase, session.user.id).catch(() => null);
        const mappedUser = mapSupabaseUser(session.user, profile);
        setUser(mappedUser);
        localStorage.setItem('restaurant-user', JSON.stringify(mappedUser));
      } catch (error) {
        console.error('Failed to refresh Supabase profile', error);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          throw error;
        }

        const profile = await fetchProfile(supabase, data.user.id).catch(() => null);
        const mappedUser = mapSupabaseUser(data.user, profile);
        const response = await api.post('/auth/supabase-login', {
          name: mappedUser.name,
          email: mappedUser.email,
          role: mappedUser.role,
          phone: mappedUser.phone,
        });

        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('restaurant-user', JSON.stringify(response.data.user));
        localStorage.setItem('restaurant-token', response.data.token);
        return response.data;
      }

      const response = await api.post('/auth/login', credentials);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('restaurant-user', JSON.stringify(response.data.user));
      localStorage.setItem('restaurant-token', response.data.token);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const role = payload.role || 'customer';
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              phone: payload.phone || '',
              role,
            },
          },
        });

        if (error) {
          throw error;
        }

        const safeUser = data?.user || { id: crypto.randomUUID(), email: payload.email, user_metadata: { name: payload.name, phone: payload.phone || '', role } };
        const profile = await upsertProfile(supabase, {
          id: safeUser.id,
          name: payload.name,
          email: payload.email,
          role,
          phone: payload.phone || '',
        }).catch(() => null);

        await supabase.auth.updateUser({
          data: {
            name: payload.name,
            phone: payload.phone || '',
            role,
          },
        }).catch(() => null);

        const mappedUser = mapSupabaseUser(safeUser, profile);
        const response = await api.post('/auth/supabase-register', {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role,
          phone: payload.phone || '',
        });

        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('restaurant-user', JSON.stringify(response.data.user));
        localStorage.setItem('restaurant-token', response.data.token);
        return response.data;
      }

      const response = await api.post('/auth/register', payload);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('restaurant-user', JSON.stringify(response.data.user));
      localStorage.setItem('restaurant-token', response.data.token);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setToken('');
    localStorage.removeItem('restaurant-user');
    localStorage.removeItem('restaurant-token');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
