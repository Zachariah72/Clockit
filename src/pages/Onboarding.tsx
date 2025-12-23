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
    }, 6000); // Show for 6 seconds

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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90"></div>
      {/* Blackish tint */}
      <div className="absolute inset-0 bg-black/15"></div>

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


          {/* Get Started button */}
          <Button
            onClick={() => {
              localStorage.setItem('onboardingCompleted', 'true');
              navigate('/auth');
            }}
            variant="gradient"
            className="font-semibold px-8 py-3 text-lg rounded-xl"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;