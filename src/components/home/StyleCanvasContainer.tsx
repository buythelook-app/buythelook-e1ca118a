
import { useNavigate } from "react-router-dom";
import { StyleCanvas } from "@/components/StyleCanvas";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const StyleCanvasContainer = () => {
  const navigate = useNavigate();
  const [outfitData, setOutfitData] = useState<any>(null);
  const [styleType, setStyleType] = useState<number>(0);
  
  useEffect(() => {
    // Load initial outfit data from localStorage
    const storedOutfitData = localStorage.getItem('last-generated-outfit');
    if (storedOutfitData) {
      try {
        setOutfitData(JSON.parse(storedOutfitData));
      } catch (e) {
        console.error('Error parsing stored outfit data:', e);
      }
    }
  }, []);

  const handleCanvasClick = () => {
    navigate('/suggestions');
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Today's Look For You</h2>
      <Card 
        className="p-4 cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg"
        onClick={handleCanvasClick}
      >
        <div className="relative">
          <StyleCanvas 
            styleType={styleType} 
            outfitData={outfitData} 
            width={300} 
            height={400} 
          />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="bg-netflix-card bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium">
              Click to see more details
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
