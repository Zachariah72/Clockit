import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) {
            console.error('Session exchange error:', sessionError);
            navigate('/auth?error=' + encodeURIComponent(sessionError.message));
            return;
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
