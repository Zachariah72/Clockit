import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/utils/api";

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
  spotifyTokens: { accessToken: string; refreshToken: string; expiresAt: number } | null;
  setSpotifyTokens: React.Dispatch<React.SetStateAction<{ accessToken: string; refreshToken: string; expiresAt: number } | null>>;
  signInWithSpotify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotifyTokens, setSpotifyTokens] = useState<{ accessToken: string; refreshToken: string; expiresAt: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/auth/verify`, {
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

    const storedSpotifyTokens = localStorage.getItem('spotify_tokens');
    if (storedSpotifyTokens) {
      try {
        setSpotifyTokens(JSON.parse(storedSpotifyTokens));
      } catch (e) {
        console.error('Error parsing spotify tokens', e);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('onAuthStateChange triggered:', _event, session ? 'with session' : 'no session');
      setSession(session);
      
      // If session exists, ensure backend token is saved and get MongoDB user id
      if (session && session.user) {
        try {
          // Always verify/refresh token for OAuth users
          console.log('Calling /auth/oauth-verify...');
          const response = await fetch(`${getApiUrl()}/auth/oauth-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: session.user.email,
              userId: session.user.id
            })
          });
          
          console.log('OAuth verify response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              localStorage.setItem('auth_token', data.token);
              console.log('✅ Backend token saved for OAuth user');
              // Use MongoDB ObjectId from backend, not Supabase UUID
              setUser({ id: data.user.id, email: data.user.email });
            }
          } else {
            // Fallback to Supabase session user
            setUser({ id: session.user.id, email: session.user.email });
            const error = await response.json();
            console.error('OAuth verify failed:', error);
          }
        } catch (e) {
          // Fallback to Supabase session user
          setUser({ id: session.user.id, email: session.user.email });
          console.warn('Failed to create backend token for OAuth user:', e);
        }
      } else {
        setUser(null);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('getSession result:', session ? 'has session' : 'no session');
      setSession(session);
      
      if (session && session.user) {
        try {
          const response = await fetch(`${getApiUrl()}/auth/oauth-verify`, {
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
            localStorage.setItem('auth_token', data.token);
            setUser({ id: data.user.id, email: data.user.email });
          } else {
            setUser({ id: session.user.id, email: session.user.email });
          }
        } catch (e) {
          setUser({ id: session.user.id, email: session.user.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
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
        const response = await fetch(`${getApiUrl()}/auth/register`, {
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
        const response = await fetch(`${getApiUrl()}/auth/login`, {
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

  const signInWithSpotify = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/spotify/auth-url`);
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Failed to get Spotify auth URL', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token'); // Also clear backend token
    localStorage.removeItem('spotify_tokens');
    setUser(null);
    setSession(null);
    setProfile(null);
    setSpotifyTokens(null);
  }, []);

  const value = useMemo(() => ({
    user, session, profile, loading, signUp, signIn, signInWithOAuth, signOut,
    spotifyTokens, setSpotifyTokens, signInWithSpotify
  }), [user, session, profile, loading, signUp, signIn, signInWithOAuth, signOut, spotifyTokens, setSpotifyTokens, signInWithSpotify]);

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
