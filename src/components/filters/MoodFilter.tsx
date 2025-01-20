import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Smile, Laugh, Frown, Meh } from "lucide-react";

export type Mood = "happy" | "excited" | "sad" | "neutral";

const moodIcons: Record<Mood, React.ReactNode> = {
  happy: <Smile className="w-5 h-5" />,
  excited: <Laugh className="w-5 h-5" />,
  sad: <Frown className="w-5 h-5" />,
  neutral: <Meh className="w-5 h-5" />
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
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