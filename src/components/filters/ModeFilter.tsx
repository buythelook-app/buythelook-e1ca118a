import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Mode } from "./StyleFilterButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { type Mood } from "./MoodFilter";
import { useToast } from "@/hooks/use-toast";
import { filterWorkAppropriateItems } from "./WorkAppropriateFilter";

const MOODS_TO_MODES: Record<Mood, Mode> = {
  mystery: "Casual",
  quiet: "Relaxing",
  elegant: "Work",
  energized: "Sport",
  flowing: "Casual",
  optimist: "Shopping",
  calm: "Relaxing",
  romantic: "Date",
  unique: "Party",
  sweet: "Shopping",
  childish: "Casual",
  passionate: "Party",
  powerful: "Work"
};

const MODES: Array<{ id: number; name: Mode; icon: string; workAppropriate: boolean }> = [
  { id: 1, name: "Relaxing", icon: "🌅", workAppropriate: true },
  { id: 2, name: "Party", icon: "🎉", workAppropriate: false },
  { id: 3, name: "Work", icon: "💼", workAppropriate: true },
  { id: 4, name: "Date", icon: "💖", workAppropriate: false },
  { id: 5, name: "Travel", icon: "✈️", workAppropriate: true },
  { id: 6, name: "Shopping", icon: "🛍️", workAppropriate: true },
  { id: 7, name: "Sport", icon: "⚽", workAppropriate: false },
  { id: 8, name: "Casual", icon: "👕", workAppropriate: true },
];

interface ModeFilterProps {
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
}

export const ModeFilter = ({ selectedMode, setSelectedMode }: ModeFilterProps) => {
  const { toast } = useToast();

  const modeToEventMap: Record<Mode, string> = {
    All: 'casual',
    Casual: 'casual',
    Work: 'work',
    Party: 'evening',
    Date: 'evening',
    Relaxing: 'weekend',
    Travel: 'casual',
    Shopping: 'casual',
    Sport: 'casual',
  };

  const handleMoodSelect = (mood: Mood) => {
    const suggestedMode = MOODS_TO_MODES[mood];
    setSelectedMode(suggestedMode);
    try {
      localStorage.setItem('current-mood', mood);
      const event = modeToEventMap[suggestedMode];
      localStorage.setItem('current-event', event);
    } catch {}
    toast({
      title: "Mode Updated",
      description: `Mood: ${mood} → Event context: ${modeToEventMap[suggestedMode]} (${suggestedMode})`,
    });
  };
  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
    try {
      const event = modeToEventMap[mode];
      localStorage.setItem('current-event', event);
    } catch {}

    toast({
      title: `${mode} Mode Selected`,
      description: mode === "Work"
        ? "Context set to work. Filtering for professional, modest items."
        : `Context set to ${modeToEventMap[mode]}.`,
    });
  };
  return (
    <>
      <DropdownMenuLabel>Mode</DropdownMenuLabel>
      <div className="p-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-2">
              <span className="mr-2">🎭</span>
              How are you feeling today?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select Your Mood</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {(Object.keys(MOODS_TO_MODES) as Mood[]).map((mood) => (
                <Button
                  key={mood}
                  variant="outline"
                  className="p-4 h-auto hover:bg-netflix-accent/10 transition-colors"
                  onClick={() => handleMoodSelect(mood)}
                >
                  <span className="mr-2 text-lg">
                    {mood === "mystery" ? "🤔" :
                     mood === "quiet" ? "😌" :
                     mood === "elegant" ? "😊" :
                     mood === "energized" ? "😄" :
                     mood === "flowing" ? "🌊" :
                     mood === "optimist" ? "🌟" :
                     mood === "calm" ? "😌" :
                     mood === "romantic" ? "💝" :
                     mood === "unique" ? "🦄" :
                     mood === "sweet" ? "🍯" :
                     mood === "childish" ? "👶" :
                     mood === "passionate" ? "❤️" :
                     "💪"}
                  </span>
                  <span className="text-sm capitalize">{mood}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-2">
          <Button
            key="all"
            variant={selectedMode === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeSelect("All")}
            className="w-full"
          >
            All
          </Button>
          {MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.name ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeSelect(mode.name)}
              className={`w-full flex items-center gap-2 ${
                mode.name === "Work" ? "border-blue-500 bg-blue-50 hover:bg-blue-100" : ""
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
              {mode.workAppropriate && mode.name === "Work" && (
                <span className="text-xs text-blue-600">👔</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
