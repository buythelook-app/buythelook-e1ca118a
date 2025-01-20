import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Smile, Laugh, Frown, Meh } from "lucide-react";

export type Mood = "mystery" | "quiet" | "elegant" | "energized" | "flowing" | "optimist" | 
           "calm" | "romantic" | "unique" | "sweet" | "childish" | "passionate" | "powerful";

const moodIcons: Record<Mood, React.ReactNode> = {
  mystery: <Frown className="w-5 h-5 text-yellow-400" />,
  quiet: <Meh className="w-5 h-5 text-yellow-400" />,
  elegant: <Smile className="w-5 h-5 text-yellow-400" />,
  energized: <Laugh className="w-5 h-5 text-yellow-400" />,
  flowing: <Smile className="w-5 h-5 text-yellow-400" />,
  optimist: <Laugh className="w-5 h-5 text-yellow-400" />,
  calm: <Meh className="w-5 h-5 text-yellow-400" />,
  romantic: <Smile className="w-5 h-5 text-yellow-400" />,
  unique: <Laugh className="w-5 h-5 text-yellow-400" />,
  sweet: <Smile className="w-5 h-5 text-yellow-400" />,
  childish: <Laugh className="w-5 h-5 text-yellow-400" />,
  passionate: <Smile className="w-5 h-5 text-yellow-400" />,
  powerful: <Laugh className="w-5 h-5 text-yellow-400" />
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