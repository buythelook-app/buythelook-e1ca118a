
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StyleVisualizationProps {
  outfitSuggestions: any[];
}

export const StyleVisualization = ({ outfitSuggestions = [] }: StyleVisualizationProps) => {
  if (!outfitSuggestions || outfitSuggestions.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-display font-semibold mb-4 text-white">Style Visualization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-netflix-card border-netflix-accent/20 h-64 flex items-center justify-center text-netflix-text">
            <CardContent className="p-6 text-center">
              <p>Generate outfit ideas to see color combinations here</p>
            </CardContent>
          </Card>
          <Card className="bg-netflix-card border-netflix-accent/20 h-64 flex items-center justify-center text-netflix-text">
            <CardContent className="p-6 text-center">
              <p>Generate outfit ideas to see color combinations here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Only display up to 2 outfit suggestions
  const displaySuggestions = outfitSuggestions.slice(0, 2);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-display font-semibold mb-4 text-white">Style Visualization</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySuggestions.map((suggestion, index) => (
          <Card key={index} className="bg-netflix-card border-netflix-accent/20">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                {/* Color palette */}
                <div className="flex justify-center space-x-2">
                  {suggestion.top && (
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: suggestion.top }}
                      title="Top"
                    />
                  )}
                  {suggestion.bottom && (
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: suggestion.bottom }}
                      title="Bottom"
                    />
                  )}
                  {suggestion.shoes && (
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: suggestion.shoes }}
                      title="Shoes"
                    />
                  )}
                  {suggestion.coat && (
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: suggestion.coat }}
                      title="Coat"
                    />
                  )}
                </div>
                
                {/* Description */}
                <p className="text-netflix-text text-sm">
                  {suggestion.description || "A stylish outfit combination."}
                </p>
                
                {/* Occasion */}
                {suggestion.occasion && (
                  <div className="inline-block bg-netflix-accent/20 text-netflix-accent text-xs px-2 py-1 rounded">
                    {suggestion.occasion}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
