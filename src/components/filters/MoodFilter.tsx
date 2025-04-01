
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Initialize from localStorage if exists
    const storedMood = localStorage.getItem('current-mood') as Mood;
    if (storedMood && !selectedMood) {
      console.log("Loading stored mood from localStorage:", storedMood);
      onMoodSelect(storedMood);
    }
  }, [selectedMood, onMoodSelect]);

  const handleMoodSelect = (mood: Mood) => {
    onMoodSelect(mood);
    localStorage.setItem('current-mood', mood);
    console.log("Mood selected and saved to localStorage:", mood);
    
    // Trigger a custom event so other components can react to the mood change
    const event = new StorageEvent('storage', {
      key: 'current-mood',
      newValue: mood,
      storageArea: localStorage
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Mood Updated",
      description: `Your mood is now set to ${mood}`,
    });
    
    setIsOpen(false); // Close the dialog after selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
          {selectedMood ? (
            <>
              <span className="mr-2 text-lg">{moodIcons[selectedMood]}</span>
              <span>Mood: {selectedMood}</span>
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
              variant={selectedMood === mood ? "default" : "outline"}
              className="p-4 h-auto hover:bg-netflix-accent/10 transition-colors"
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
