import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export type Mood = "mystery" | "quiet" | "elegant" | "energized" | "flowing" | "optimist" | 
           "calm" | "romantic" | "unique" | "sweet" | "childish" | "passionate" | "powerful";

const moodIcons: Record<Mood, string> = {
  mystery: "🤔",
  quiet: "😌",
  elegant: "😊",
  energized: "😄",
  flowing: "🌊",
  optimist: "🌟",
  calm: "😌",
  romantic: "💝",
  unique: "🦄",
  sweet: "🍯",
  childish: "👶",
  passionate: "❤️",
  powerful: "💪"
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
              <span className="mr-2 text-lg">{moodIcons[selectedMood]}</span>
              <span className="capitalize">{selectedMood}</span>
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
              <span className="mr-2 text-lg">{moodIcons[mood]}</span>
              <span className="text-sm capitalize">{mood}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};