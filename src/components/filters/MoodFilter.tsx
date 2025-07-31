
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
          className="w-full md:w-auto border-fashion-border hover:border-fashion-accent hover:bg-fashion-accent/5 rounded-full px-6 py-3 transition-all duration-300" 
          onClick={() => setIsOpen(true)}
        >
          {selectedMood ? (
            <>
              <span className="mr-3 text-lg">{moodIcons[selectedMood]}</span>
              <span className="font-medium text-fashion-dark capitalize">{selectedMood}</span>
            </>
          ) : (
            <>
              <span className="mr-3 text-lg">🎭</span>
              <span className="font-medium text-fashion-dark">Select Your Mood</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl rounded-2xl">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-light text-fashion-dark">
            How are you feeling today?
          </DialogTitle>
          <p className="text-fashion-muted mt-2">Your mood helps us curate the perfect look for you</p>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
          {(Object.keys(moodIcons) as Mood[]).map((mood) => (
            <Button
              key={mood}
              variant="outline"
              className={`group p-4 h-auto rounded-xl border-2 transition-all duration-300 ${
                selectedMood === mood 
                  ? "border-fashion-accent bg-fashion-accent/5 shadow-md" 
                  : "border-fashion-border hover:border-fashion-accent hover:bg-fashion-accent/5"
              }`}
              onClick={() => handleMoodSelect(mood)}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{moodIcons[mood]}</span>
                <span className={`text-sm font-medium capitalize ${
                  selectedMood === mood ? "text-fashion-accent" : "text-fashion-dark group-hover:text-fashion-accent"
                }`}>
                  {mood}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
