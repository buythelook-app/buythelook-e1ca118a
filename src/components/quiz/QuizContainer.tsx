import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizContainerProps {
  children: {
    summary: React.ReactNode;
    content: React.ReactNode;
  };
}

export const QuizContainer = ({ children }: QuizContainerProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text py-6">
      <div className="container max-w-6xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar for answers summary */}
          <div className="lg:col-span-1">
            <div className="bg-netflix-card rounded-lg p-4 sticky top-6">
              {children.summary}
            </div>
          </div>
          
          {/* Main quiz content */}
          <div className="lg:col-span-3">
            <div className="bg-netflix-card rounded-lg p-6 h-[calc(100vh-12rem)] max-h-[700px] min-h-[500px] flex flex-col">
              {children.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};