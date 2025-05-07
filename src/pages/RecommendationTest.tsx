
import React from "react";
import RunRecommendationButton from "@/components/RunRecommendationButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function RecommendationTest() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold mb-4">Test Full Recommendation Flow</h1>
        <Button 
          onClick={() => navigate("/home")} 
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
      
      <RunRecommendationButton />
    </div>
  );
}
