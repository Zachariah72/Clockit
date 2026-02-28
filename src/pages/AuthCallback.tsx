import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getApiUrl = () => {
  if (import.meta.env.DEV) return 'http://localhost:5000/api';
  return import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com/api';
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the code from the URL
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const error_description = searchParams.get('error_description');

      if (error) {
        console.error('Auth callback error:', error, error_description);
        navigate('/auth?error=' + encodeURIComponent(error_description || error));
        return;
      }

      if (code) {
        // Exchange the code for a session
        try {
          const { error: sessionError, data } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) {
            console.error('Session exchange error:', sessionError);
            navigate('/auth?error=' + encodeURIComponent(sessionError.message));
            return;
          }

          // After Supabase session is created, also create backend JWT token
          if (data?.session?.user) {
            const user = data.session.user;
            try {
              // Call backend to verify OAuth user and get JWT token
              const response = await fetch(`${getApiUrl()}/auth/oauth-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  userId: user.id
                })
              });

              if (response.ok) {
                const data = await response.json();
                if (data.token) {
                  localStorage.setItem('auth_token', data.token);
                  console.log('✅ Backend token saved after OAuth');
                }
              }
            } catch (backendError) {
              console.warn('Backend token creation failed:', backendError);
            }
          }

          // Session will be restored by the onAuthStateChange listener in AuthContext
          // Navigate to home after successful auth
          navigate('/', { replace: true });
        } catch (err) {
          console.error('Unexpected error during auth callback:', err);
          navigate('/auth?error=unexpected_error');
        }
      } else {
        // No code parameter, redirect to auth
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
