import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Moon, Sun, Heart, Fire, Sparkles, Flower, Child, Bolt, Wave } from "lucide-react";

export type Mood = "mystery" | "quiet" | "elegant" | "energized" | "flowing" | "optimist" | 
           "calm" | "romantic" | "unique" | "sweet" | "childish" | "passionate" | "powerful";

const moodIcons: Record<Mood, React.ReactNode> = {
  mystery: <Moon className="w-5 h-5" />,
  quiet: <Moon className="w-5 h-5" />,
  elegant: <Sparkles className="w-5 h-5" />,
  energized: <Fire className="w-5 h-5" />,
  flowing: <Wave className="w-5 h-5" />,
  optimist: <Sun className="w-5 h-5" />,
  calm: <Moon className="w-5 h-5" />,
  romantic: <Heart className="w-5 h-5" />,
  unique: <Sparkles className="w-5 h-5" />,
  sweet: <Flower className="w-5 h-5" />,
  childish: <Child className="w-5 h-5" />,
  passionate: <Fire className="w-5 h-5" />,
  powerful: <Bolt className="w-5 h-5" />
};

interface MoodFilterProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodFilter = ({ selectedMood, onMoodSelect }: MoodFilterProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {selectedMood ? (
            <>
              {moodIcons[selectedMood]}
              <span className="ml-2 capitalize">{selectedMood}</span>
            </>
          ) : (
            <>
              <span className="mr-2">🎭</span>
              Select Mood
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {(Object.keys(moodIcons) as Mood[]).map((mood) => (
            <Button
              key={mood}
              variant="outline"
              className="p-4 h-auto hover:bg-netflix-accent/10 transition-colors"
              onClick={() => onMoodSelect(mood)}
            >
              {moodIcons[mood]}
              <span className="ml-2 text-sm capitalize">{mood}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};