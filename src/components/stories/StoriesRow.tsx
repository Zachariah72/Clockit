import { StoryCircle } from "./StoryCircle";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

interface Story {
  id: string;
  username: string;
  image: string;
  hasUnseenStory: boolean;
}

const mockStories: Story[] = [
  { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true },
  { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true },
  { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true },
  { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false },
  { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false },
  { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true },
];

interface Story {
  id: string;
  username: string;
  image: string;
  hasUnseenStory: boolean;
}

interface StoriesRowProps {
  stories?: Story[];
  onStoryClick?: (storyId: string) => void;
  onCreateStory?: () => void;
}

export const StoriesRow = ({ stories = mockStories, onStoryClick, onCreateStory }: StoriesRowProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-4 py-2">
        <StoryCircle
          image={avatar1}
          username="Your story"
          isOwn
          hasUnseenStory={false}
          onClick={onCreateStory}
        />
        {stories.map((story) => (
          <StoryCircle
            key={story.id}
            image={story.image}
            username={story.username}
            hasUnseenStory={story.hasUnseenStory}
            onClick={() => onStoryClick?.(story.id)}
          />
        ))}
      </div>
    </div>
  );
};
