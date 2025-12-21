import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Play, Music, Users, Trophy, MessageCircle, Phone, BarChart3, SkipForward } from 'lucide-react';

const slides = [
  {
    icon: <Clock className="w-16 h-16 text-primary" />,
    headline: 'Welcome to Clockit',
    value: 'Your ultimate social media and music experience awaits.',
  },
  {
    icon: <Play className="w-16 h-16 text-primary" />,
    headline: 'Short-Form Videos & Stories',
    value: 'Discover engaging content in bite-sized formats.',
  },
  {
    icon: <Music className="w-16 h-16 text-primary" />,
    headline: 'Music Streaming & Mood Modes',
    value: 'Stream music tailored to your current mood.',
  },
  {
    icon: <Users className="w-16 h-16 text-primary" />,
    headline: 'Social Interaction',
    value: 'Connect with friends and like-minded people.',
  },
  {
    icon: <Trophy className="w-16 h-16 text-primary" />,
    headline: 'Streaks & Communities',
    value: 'Build streaks and join vibrant communities.',
  },
  {
    icon: <MessageCircle className="w-16 h-16 text-primary" />,
    headline: 'Messaging',
    value: 'Chat seamlessly with your network.',
  },
  {
    icon: <Phone className="w-16 h-16 text-primary" />,
    headline: 'Audio & Video Calls',
    value: 'Stay connected with high-quality calls.',
  },
  {
    icon: <BarChart3 className="w-16 h-16 text-primary" />,
    headline: 'Personalization & Analytics',
    value: 'Get insights and personalized recommendations.',
  },
];

const musicGenres = [
  'Pop', 'Hip-Hop/Rap', 'R&B/Soul', 'Classic Rock', 'Alternative Rock', 'Indie Rock', 'Metal', 'Punk',
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass', 'Jazz', 'Blues', 'Classical', 'Gospel',
  'Reggae', 'Dancehall', 'Afrobeat', 'Afropop', 'Amapiano', 'Reggaeton', 'Salsa', 'Bachata', 'Latin Pop',
  'Country', 'Folk', 'Indie', 'K-Pop', 'J-Pop', 'C-Pop', 'Bollywood', 'Indian Classical', 'Indian Pop',
  'Arabic', 'Middle Eastern', 'Caribbean', 'Lo-Fi', 'Instrumental', 'Soundtracks', 'Scores', 'Experimental', 'Alternative'
];
const moodModes = ['Chill', 'Meditating', 'Happy', 'Party', 'Sad', 'Workout', 'Late Night', 'Trending'];
const contentInterests = ['Music Videos', 'Short Films', 'Comedy', 'Education', 'News', 'Sports', 'Fashion', 'Food'];
const hobbiesActivities = ['Reading', 'Gaming', 'Cooking', 'Travel', 'Photography', 'Fitness', 'Art', 'Dancing'];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const totalSteps = slides.length + 4; // slides + 4 selection screens

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === slides.length - 1) {
      setCurrentStep(slides.length); // to genres
    } else if (currentStep === slides.length) {
      setCurrentStep(slides.length + 1); // to moods
    } else if (currentStep === slides.length + 1) {
      setCurrentStep(slides.length + 2); // to interests
    } else if (currentStep === slides.length + 2) {
      setCurrentStep(slides.length + 3); // to hobbies
    }
  };

  const handleSkip = () => {
    setCurrentStep(totalSteps - 1);
  };

  const handleFinish = () => {
    // Save to localStorage for now, will sync after sign-up
    const preferences = {
      musicGenres: selectedGenres,
      moodModes: selectedMoods,
      contentInterests: selectedInterests,
      hobbiesActivities: selectedHobbies,
    };
    localStorage.setItem('onboardingPreferences', JSON.stringify(preferences));
    // TODO: Navigate to sign-up or next step
  };

  const renderSlide = (slide: typeof slides[0], index: number) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {slide.icon}
      <h2 className="text-2xl font-bold mt-4">{slide.headline}</h2>
      <p className="text-lg mt-2">{slide.value}</p>
      <div className="mt-8 flex space-x-4">
        <Button variant="outline" onClick={handleSkip}>
          <SkipForward className="w-4 h-4 mr-2" />
          Skip
        </Button>
        <Button onClick={handleNext}>
          {index === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );

  const renderSelection = (title: string, options: string[], selected: string[], setSelected: (value: string[]) => void) => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={selected.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelected([...selected, option]);
                } else {
                  setSelected(selected.filter((s) => s !== option));
                }
              }}
            />
            <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {option}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
          Back
        </Button>
        <Button onClick={currentStep === totalSteps - 1 ? handleFinish : handleNext}>
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-0">
            <Progress value={(currentStep + 1) / totalSteps * 100} className="rounded-none" />
            {currentStep < slides.length ? (
              <Carousel>
                <CarouselContent>
                  {slides.map((slide, index) => (
                    <CarouselItem key={index}>
                      {renderSlide(slide, index)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : currentStep === slides.length ? (
              renderSelection('Select Music Genres', musicGenres, selectedGenres, setSelectedGenres)
            ) : currentStep === slides.length + 1 ? (
              renderSelection('Select Mood Modes', moodModes, selectedMoods, setSelectedMoods)
            ) : currentStep === slides.length + 2 ? (
              renderSelection('Select Content Interests', contentInterests, selectedInterests, setSelectedInterests)
            ) : (
              renderSelection('Select Hobbies & Activities', hobbiesActivities, selectedHobbies, setSelectedHobbies)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;