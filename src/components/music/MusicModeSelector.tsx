import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sparkles, PartyPopper, Brain, Dumbbell, 
  CloudMoon, Coffee, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type MusicMode = "chill" | "meditating" | "happy" | "party" | "focus" | "workout" | "sleep";

interface MusicModeConfig {
  id: MusicMode;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
}

const modes: MusicModeConfig[] = [
  { 
    id: "chill", 
    label: "Chill", 
    icon: Coffee, 
    color: "text-cyan",
    gradient: "from-cyan/20 to-cyan/5",
    description: "Relaxed vibes for unwinding"
  },
  { 
    id: "meditating", 
    label: "Meditate", 
    icon: Moon, 
    color: "text-purple",
    gradient: "from-purple/20 to-purple/5",
    description: "Calm sounds for mindfulness"
  },
  { 
    id: "happy", 
    label: "Happy", 
    icon: Sparkles, 
    color: "text-yellow-400",
    gradient: "from-yellow-400/20 to-yellow-400/5",
    description: "Uplifting tunes to boost mood"
  },
  { 
    id: "party", 
    label: "Party", 
    icon: PartyPopper, 
    color: "text-magenta",
    gradient: "from-magenta/20 to-magenta/5",
    description: "High energy bangers"
  },
  { 
    id: "focus", 
    label: "Focus", 
    icon: Brain, 
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5",
    description: "Music to help you concentrate"
  },
  { 
    id: "workout", 
    label: "Workout", 
    icon: Dumbbell, 
    color: "text-orange-400",
    gradient: "from-orange-400/20 to-orange-400/5",
    description: "Pump up your training"
  },
  { 
    id: "sleep", 
    label: "Sleep", 
    icon: CloudMoon, 
    color: "text-indigo-400",
    gradient: "from-indigo-400/20 to-indigo-400/5",
    description: "Drift off peacefully"
  },
];

interface MusicModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: MusicMode) => void;
  currentMode: MusicMode | null;
}

export const MusicModeSelector = ({ isOpen, onClose, onSelect, currentMode }: MusicModeSelectorProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
          >
            <div className="glass-card rounded-3xl p-6 max-w-lg mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Set Your Mood</h2>
                  <p className="text-sm text-muted-foreground">Choose how you're feeling</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modes Grid */}
              <div className="grid grid-cols-2 gap-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = currentMode === mode.id;
                  
                  return (
                    <motion.button
                      key={mode.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onSelect(mode.id);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl text-left transition-all border-2 ${
                        isSelected 
                          ? `border-primary bg-gradient-to-br ${mode.gradient}` 
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-background/50 flex items-center justify-center mb-3 ${mode.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-foreground">{mode.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              {/* Current Mode Indicator */}
              {currentMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {(() => {
                      const CurrentIcon = modes.find(m => m.id === currentMode)?.icon || Sparkles;
                      return <CurrentIcon className="w-4 h-4 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">
                      Currently in {modes.find(m => m.id === currentMode)?.label} mode
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your recommendations are personalized
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for managing music mode
export const useMusicMode = () => {
  const [mode, setMode] = useState<MusicMode | null>(() => {
    const saved = localStorage.getItem("clockit_music_mode");
    return saved as MusicMode | null;
  });

  useEffect(() => {
    if (mode) {
      localStorage.setItem("clockit_music_mode", mode);
    }
  }, [mode]);

  return { mode, setMode };
};

export default MusicModeSelector;
