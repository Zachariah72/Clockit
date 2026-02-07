import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  streak_count: number;
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, phone?: string, avatar?: File) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'facebook' | 'spotify') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json()).then(data => {
        if (data.user) {
          setUser({ email: data.user.email, id: data.user.id });
        }
      }).catch(() => {
        localStorage.removeItem('auth_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session ? { id: session.user.id, email: session.user.email } : null);
      
      // If session exists, ensure backend token is saved
      if (session && session.user) {
        try {
          // Check if we already have a token
          if (!localStorage.getItem('auth_token')) {
            // Get backend token for OAuth user
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/oauth-verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: session.user.email,
                userId: session.user.id
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.token) {
                localStorage.setItem('auth_token', data.token);
                console.log('✅ Backend token saved for OAuth user');
              }
            }
          }
        } catch (e) {
          console.warn('Failed to create backend token for OAuth user:', e);
        }
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string, phone?: string, avatar?: File) => {
    const redirectUrl = `${window.location.origin}/`;

    let avatarUrl = null;
    if (avatar) {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${Date.now()}_${avatar.name}`, avatar);
      if (uploadError) {
        return { error: uploadError };
      }
      avatarUrl = data.path;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: username,
          phone,
          avatar_url: avatarUrl,
        }
      }
    });

    // If Supabase signup successful, also create backend account
    if (!error) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token);
        }
      } catch (backendError) {
        console.warn('Backend registration failed:', backendError);
        // Don't fail the signup if backend registration fails
      }
    }

    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase login successful, also create backend token
    if (!error) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token);
        }
      } catch (backendError) {
        console.warn('Backend authentication failed:', backendError);
        // Don't fail the login if backend auth fails
      }
    }

    return { error };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple' | 'facebook') => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    return { error };
  }, []);


  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token'); // Also clear backend token
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo(() => ({
    user, session, profile, loading, signUp, signIn, signInWithOAuth, signOut
  }), [user, session, profile, loading, signUp, signIn, signInWithOAuth, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
