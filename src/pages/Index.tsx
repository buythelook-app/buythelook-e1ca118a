
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { MoodFilter } from "@/components/filters/MoodFilter";
import type { Mood } from "@/components/filters/MoodFilter";
import { NoStylePrompt } from "@/components/home/NoStylePrompt";
import { PersonalizedLooks } from "@/components/home/PersonalizedLooks";

export default function Index() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);

  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
  };

  if (!userStyle) {
    return <NoStylePrompt />;
  }

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </div>
        <FilterOptions />
        
        <PersonalizedLooks 
          userStyle={userStyle} 
          selectedMood={selectedMood} 
        />
      </main>
    </div>
  );
}
