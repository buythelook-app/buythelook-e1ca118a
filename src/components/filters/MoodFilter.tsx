
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize from localStorage if exists
    const storedMood = localStorage.getItem('current-mood') as Mood;
    if (storedMood && !selectedMood) {
      onMoodSelect(storedMood);
    }
  }, [selectedMood, onMoodSelect]);

  const handleMoodSelect = (mood: Mood) => {
    onMoodSelect(mood);
    localStorage.setItem('current-mood', mood);
    setIsOpen(false); // Close the dialog after selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 rounded-2xl"
          onClick={() => setIsOpen(true)}
        >
          {selectedMood ? (
            <>
              <span className="mr-2 text-lg">{moodIcons[selectedMood]}</span>
              <span>Mood</span>
            </>
          ) : (
            <>
              <span className="mr-2">🎭</span>
              Select Mood
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-2xl font-semibold">How are you feeling today?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {(Object.keys(moodIcons) as Mood[]).map((mood) => (
            <Button
              key={mood}
              variant={selectedMood === mood ? "default" : "outline"}
              className={`p-4 h-auto transition-all duration-300 rounded-2xl ${
                selectedMood === mood 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-gray-50 border-gray-300 text-gray-900 hover:bg-blue-50"
              }`}
              onClick={() => handleMoodSelect(mood)}
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
