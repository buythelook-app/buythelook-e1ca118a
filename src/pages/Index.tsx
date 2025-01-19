import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Navbar />
      <HeroSection />
      <LookSection />
    </div>
  );
}