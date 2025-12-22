import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import backgroundImage from '@/assets/pexels-anntarazevich-7229081.jpg';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  // Auto-redirect to auth after showing the beautiful landing page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/auth');
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-md">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white text-gradient">
              Clockit
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Share stories, stream music, chat with friends, and discover amazing content.
            </p>
          </div>

          {/* Loading indicator */}
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto"></div>
            <p className="text-white/80 text-sm">Preparing your experience...</p>
          </div>

          {/* Get Started button */}
          <Button
            onClick={() => {
              localStorage.setItem('onboardingCompleted', 'true');
              navigate('/auth');
            }}
            className="bg-white text-purple-900 hover:bg-white/90 font-semibold px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;