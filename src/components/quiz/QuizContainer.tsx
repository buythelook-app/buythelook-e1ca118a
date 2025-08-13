import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizContainerProps {
  children: React.ReactNode;
}

export const QuizContainer = ({ children }: QuizContainerProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text py-6">
      <div className="container max-w-xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-netflix-card rounded-lg p-6 h-[600px] flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};