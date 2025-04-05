
import { useEffect } from "react";
import { StyleCanvas } from "../StyleCanvas";

interface StyleVisualizationProps {
  outfitSuggestions: any[];
}

export const StyleVisualization = ({ outfitSuggestions }: StyleVisualizationProps) => {
  useEffect(() => {
    outfitSuggestions.forEach((_, index) => {
      const canvas = document.getElementById(`style-canvas-${index}`) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  }, [outfitSuggestions]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Style Visualization</h3>
      <div className="grid grid-cols-2 gap-4">
        {outfitSuggestions.length > 0 ? (
          outfitSuggestions.map((outfit, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <canvas 
                id={`style-canvas-${index}`} 
                className="w-full h-[500px] object-cover"
                width="450"
                height="600"
              ></canvas>
              <StyleCanvas 
                id={`style-canvas-${index}`} 
                styleType={index} 
                outfitData={outfit}
                occasion={outfit.occasion}
              />
              <div className="p-3 text-center">
                <p className="text-sm font-medium">
                  {outfit.occasion ? outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1) : `Style Option ${index + 1}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <canvas 
                id={`style-canvas-${index}`} 
                className="w-full h-[500px] object-cover"
                width="450"
                height="600"
              ></canvas>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">Loading styles...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
