
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentOutfitVisualizer } from "@/components/AgentOutfitVisualizer";
import { DemoOutfitGenerator } from "@/components/DemoOutfitGenerator";
import { RealOutfitVisualizer } from "@/components/RealOutfitVisualizer";

export default function OutfitGenerationPage() {
  const [activeSection, setActiveSection] = useState<string>("real-outfits");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-fashion-glass rounded-2xl p-6">
          <h1 className="text-3xl font-bold fashion-hero-text">Fashion AI Assistant</h1>
          <p className="text-muted-foreground mt-2">המלצות תלבושות חכמות מבוססות AI בהתאמה אישית</p>
        </div>

        <Tabs defaultValue="real-outfits" value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-fashion-glass">
            <TabsTrigger value="real-outfits">תלבושות מותאמות אישית</TabsTrigger>
            <TabsTrigger value="agent-results">תוצאות האייג׳נטים</TabsTrigger>
            <TabsTrigger value="demo">דמו</TabsTrigger>
          </TabsList>
          
          <TabsContent value="real-outfits" className="mt-0">
            <RealOutfitVisualizer />
          </TabsContent>
          
          <TabsContent value="agent-results" className="mt-0">
            <AgentOutfitVisualizer />
          </TabsContent>
          
          <TabsContent value="demo" className="mt-0">
            <DemoOutfitGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
