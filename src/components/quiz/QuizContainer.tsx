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
    <div className="min-h-screen bg-fashion-light py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-fashion-muted hover:text-fashion-dark hover:bg-fashion-neutral/50 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-2xl p-8 shadow-[var(--shadow-large)] border border-fashion-border min-h-[600px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};