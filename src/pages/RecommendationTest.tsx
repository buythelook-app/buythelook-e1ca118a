
import React, { useState } from "react";
import RunRecommendationButton from "@/components/RunRecommendationButton";
import { AgentOutfitVisualizer } from "@/components/AgentOutfitVisualizer";
import { ItemScoreManager } from "@/components/ItemScoreManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecommendationTest() {
  const [testItems] = useState([
    {
      id: "test-1",
      name: "חולצה לבנה קלאסית",
      type: "top",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      color: "white"
    },
    {
      id: "test-2", 
      name: "מכנסיים שחורים",
      type: "bottom",
      image: "https://images.unsplash.com/photo-1506629905607-45cf4eacf8c9?w=400&h=400&fit=crop",
      color: "black"
    },
    {
      id: "test-3",
      name: "נעלי אוקספורד",
      type: "shoes", 
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      color: "brown"
    }
  ]);

  const handleScoreUpdate = (itemId: string, score: number) => {
    console.log(`עודכן ציון פריט ${itemId}: ${score}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">בדיקת המלצות וניהול ציונים</h1>
      
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">המלצות</TabsTrigger>
          <TabsTrigger value="visualizer">הדמייה</TabsTrigger>
          <TabsTrigger value="scoring">ניהול ציונים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">הפעלת המלצות ידנית</h2>
            <RunRecommendationButton />
          </div>
        </TabsContent>
        
        <TabsContent value="visualizer" className="space-y-6">
          <AgentOutfitVisualizer />
        </TabsContent>
        
        <TabsContent value="scoring" className="space-y-6">
          <ItemScoreManager 
            items={testItems}
            onScoreUpdate={handleScoreUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
