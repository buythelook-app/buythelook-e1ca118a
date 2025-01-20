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

const moodColors: Record<Mood, { bg: string; text: string }> = {
  mystery: { bg: "bg-[#1A1F2C]", text: "text-white" },
  quiet: { bg: "bg-[#F1F0FB]", text: "text-gray-800" },
  elegant: { bg: "bg-[#9b87f5]", text: "text-white" },
  energized: { bg: "bg-[#F97316]", text: "text-white" },
  flowing: { bg: "bg-[#D3E4FD]", text: "text-gray-800" },
  optimist: { bg: "bg-[#FEF7CD]", text: "text-gray-800" },
  calm: { bg: "bg-[#F2FCE2]", text: "text-gray-800" },
  romantic: { bg: "bg-[#E5DEFF]", text: "text-gray-800" },
  unique: { bg: "bg-[#8B5CF6]", text: "text-white" },
  sweet: { bg: "bg-[#FFDEE2]", text: "text-gray-800" },
  childish: { bg: "bg-[#FEF7CD]", text: "text-gray-800" },
  passionate: { bg: "bg-[#ea384c]", text: "text-white" },
  powerful: { bg: "bg-[#1A1F2C]", text: "text-white" }
};

interface MoodFilterProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodFilter = ({ selectedMood, onMoodSelect }: MoodFilterProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full ${selectedMood ? `${moodColors[selectedMood].bg} ${moodColors[selectedMood].text}` : ''}`}
        >
          <span className="mr-2">🎭</span>
          {selectedMood ? `Mood: ${selectedMood}` : 'Select Mood'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {(Object.keys(moodColors) as Mood[]).map((mood) => (
            <Button
              key={mood}
              variant="outline"
              className={`p-4 h-auto ${moodColors[mood].bg} ${moodColors[mood].text} hover:opacity-90 transition-opacity`}
              onClick={() => onMoodSelect(mood)}
            >
              <span className="text-sm capitalize">{mood}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};