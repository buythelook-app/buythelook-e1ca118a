
import React from "react";
import RunRecommendationButton from "./RunRecommendationButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DeveloperTools = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Developer Tools</h1>
        <Button onClick={() => navigate("/home")} variant="outline">
          Back to Home
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recommendation Simulator</h2>
          <RunRecommendationButton />
        </div>
        
        {/* Add other developer tools here as needed */}
      </div>
    </div>
  );
};
