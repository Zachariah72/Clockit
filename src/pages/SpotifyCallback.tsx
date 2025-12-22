import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSpotifyTokens } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        navigate('/auth');
        return;
      }

      if (code) {
        try {
          const response = await fetch('/api/spotify/callback?code=' + code);
          const data = await response.json();

          if (data.accessToken) {
            setSpotifyTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: Date.now() + (data.expiresIn * 1000)
            });

            // Store in localStorage for persistence
            localStorage.setItem('spotify_tokens', JSON.stringify({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: Date.now() + (data.expiresIn * 1000)
            }));

            navigate('/music');
          } else {
            console.error('No access token received');
            navigate('/auth');
          }
        } catch (error) {
          console.error('Error handling Spotify callback:', error);
          navigate('/auth');
        }
      } else {
        navigate('/auth');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setSpotifyTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;