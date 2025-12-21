import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoryCircleProps {
  image: string;
  username: string;
  isOwn?: boolean;
  hasUnseenStory?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export const StoryCircle = ({
  image,
  username,
  isOwn = false,
  hasUnseenStory = true,
  onClick,
  size = "md",
}: StoryCircleProps) => {
  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const innerSizeClasses = {
    sm: "w-[52px] h-[52px]",
    md: "w-[60px] h-[60px]",
    lg: "w-[76px] h-[76px]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-fit"
    >
      <div
        className={cn(
          "relative rounded-full p-[3px]",
          hasUnseenStory
            ? "story-ring-unseen"
            : "story-ring-seen",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "rounded-full bg-background p-[2px]",
            innerSizeClasses[size]
          )}
        >
          <img
            src={image}
            alt={username}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        {isOwn && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            <span className="text-primary-foreground text-xs font-bold">+</span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground font-medium truncate max-w-[64px]">
        {isOwn ? "Your story" : username}
      </span>
    </motion.button>
  );
};
