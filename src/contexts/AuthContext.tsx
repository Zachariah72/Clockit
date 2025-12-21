import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, phone?: string, avatar?: File) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
    }
  };

  const createBackendToken = async (email: string) => {
    try {
      // For existing Supabase users, we need to create a backend account
      // Since we don't have the password, we'll use a default one or skip
      // This is a temporary solution - in production, you'd want proper account linking
      console.log('Backend token creation attempted for:', email);
      // For now, we'll skip automatic backend token creation
      // Users will need to sign up through the proper flow
    } catch (error) {
      console.warn('Failed to create backend token:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);

          // Ensure backend token exists for API calls
          if (!localStorage.getItem('auth_token')) {
            // Try to create backend token if user exists
            createBackendToken(session.user.email || '');
          }
        } else {
          setProfile(null);
          localStorage.removeItem('auth_token');
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, phone?: string, avatar?: File) => {
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
  };

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
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
  };

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token'); // Also clear backend token
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithOAuth, signOut }}>
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
