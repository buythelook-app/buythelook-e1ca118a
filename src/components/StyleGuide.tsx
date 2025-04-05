
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { HomeButton } from "./HomeButton";

export const StyleGuide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    sizes: {
      top: "",
      bottom: "",
      shoes: "",
    },
    stores: [] as string[],
  });

  // This would typically come from a store or context
  const quizResults = {
    gender: "female",
    height: "165",
    weight: "60",
    bodyShape: "hourglass",
    colorPreferences: ["warm", "neutral"],
    measurements: {
      waist: "70",
      chest: "90"
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Preferences Saved",
      description: "Your style preferences have been updated.",
    });
  };

  return (
    <div>
    <div className="min-h-screen bg-netflix-background text-white p-6">
      <div className="container max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-white"
        >
          ← Back
        </Button>

        <Tabs defaultValue="quiz" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-netflix-card">
            <TabsTrigger value="quiz" className="text-white data-[state=active]:bg-netflix-accent data-[state=active]:text-white">Quiz Results</TabsTrigger>
            <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-netflix-accent data-[state=active]:text-white">Style Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            <Card className="bg-netflix-card border-netflix-accent">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold text-netflix-accent">Your Style Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-netflix-background">
                    <h3 className="font-medium mb-2 text-white">Basic Info</h3>
                    <p className="text-sm text-gray-300">Gender: {quizResults.gender}</p>
                    <p className="text-sm text-gray-300">Height: {quizResults.height} cm</p>
                    <p className="text-sm text-gray-300">Weight: {quizResults.weight} kg</p>
                  </div>
                  <div className="p-4 rounded-lg bg-netflix-background">
                    <h3 className="font-medium mb-2 text-white">Measurements</h3>
                    <p className="text-sm text-gray-300">Waist: {quizResults.measurements.waist} cm</p>
                    <p className="text-sm text-gray-300">Chest: {quizResults.measurements.chest} cm</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-netflix-background">
                  <h3 className="font-medium mb-2 text-white">Body Shape</h3>
                  <p className="text-sm capitalize text-gray-300">{quizResults.bodyShape}</p>
                </div>

                <div className="p-4 rounded-lg bg-netflix-background">
                  <h3 className="font-medium mb-2 text-white">Color Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {quizResults.colorPreferences.map((color) => (
                      <span 
                        key={color}
                        className="px-3 py-1 rounded-full bg-netflix-accent/20 text-sm capitalize text-white"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/quiz')} 
                  className="w-full bg-netflix-accent hover:bg-netflix-accent/90 text-white"
                >
                  Retake Style Quiz
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-netflix-card">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-netflix-card p-4 rounded-lg space-y-4">
                    <h2 className="font-medium text-white">Your Sizes</h2>
                    <div className="space-y-2">
                      <Input
                        placeholder="Top Size"
                        value={preferences.sizes.top}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, top: e.target.value }
                        })}
                        className="bg-netflix-background text-white"
                      />
                      <Input
                        placeholder="Bottom Size"
                        value={preferences.sizes.bottom}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, bottom: e.target.value }
                        })}
                        className="bg-netflix-background text-white"
                      />
                      <Input
                        placeholder="Shoe Size"
                        value={preferences.sizes.shoes}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, shoes: e.target.value }
                        })}
                        className="bg-netflix-background text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-netflix-card p-4 rounded-lg space-y-4">
                    <h2 className="font-medium text-white">Preferred Stores</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {["Zara", "H&M", "Uniqlo", "Nike"].map((store) => (
                        <Button
                          key={store}
                          type="button"
                          variant={preferences.stores.includes(store) ? "default" : "outline"}
                          onClick={() => {
                            const newStores = preferences.stores.includes(store)
                              ? preferences.stores.filter((s) => s !== store)
                              : [...preferences.stores, store];
                            setPreferences({ ...preferences, stores: newStores });
                          }}
                          className={`w-full ${preferences.stores.includes(store) ? "text-white" : "text-gray-300"}`}
                        >
                          {store}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-white">
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
      <HomeButton />
    </div>
  );
};
