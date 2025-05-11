
import React from "react";
import RunRecommendationButton from "@/components/RunRecommendationButton";
import { AgentOutfitVisualizer } from "@/components/AgentOutfitVisualizer";

export default function RecommendationTest() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Recommendation Testing</h1>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Run Manual Recommendation</h2>
        <RunRecommendationButton />
      </div>
      
      <div className="mb-10">
        <AgentOutfitVisualizer />
      </div>
    </div>
  );
}
