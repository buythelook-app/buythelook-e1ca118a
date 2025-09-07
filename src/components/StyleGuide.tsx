
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
    <div className="min-h-screen bg-gradient-to-br from-fashion-neutral-dark to-black text-white p-6">
      <div className="container max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:bg-white/10"
        >
          ← Back
        </Button>

        <Tabs defaultValue="quiz" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-fashion-glass backdrop-blur-xl border border-white/20">
            <TabsTrigger value="quiz" className="text-white data-[state=active]:bg-fashion-primary data-[state=active]:text-white">Quiz Results</TabsTrigger>
            <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-fashion-primary data-[state=active]:text-white">Style Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            <Card className="bg-fashion-glass backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl font-bold fashion-hero-text">Your Style Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <h3 className="font-medium mb-2 text-white">Basic Info</h3>
                    <p className="text-sm text-white/70">Gender: {quizResults.gender}</p>
                    <p className="text-sm text-white/70">Height: {quizResults.height} cm</p>
                    <p className="text-sm text-white/70">Weight: {quizResults.weight} kg</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <h3 className="font-medium mb-2 text-white">Measurements</h3>
                    <p className="text-sm text-white/70">Waist: {quizResults.measurements.waist} cm</p>
                    <p className="text-sm text-white/70">Chest: {quizResults.measurements.chest} cm</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <h3 className="font-medium mb-2 text-white">Body Shape</h3>
                  <p className="text-sm capitalize text-white/70">{quizResults.bodyShape}</p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <h3 className="font-medium mb-2 text-white">Color Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {quizResults.colorPreferences.map((color) => (
                      <span 
                        key={color}
                        className="px-3 py-1 rounded-full bg-fashion-primary/20 text-sm capitalize text-white"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/quiz')} 
                  className="w-full bg-gradient-to-r from-fashion-primary to-fashion-accent hover:opacity-90 text-white font-medium"
                >
                  Retake Style Quiz
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-fashion-glass backdrop-blur-xl border border-white/20">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg space-y-4">
                    <h2 className="font-medium text-white">Your Sizes</h2>
                    <div className="space-y-2">
                      <Input
                        placeholder="Top Size"
                        value={preferences.sizes.top}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, top: e.target.value }
                        })}
                        className="bg-white/5 border-white/20 text-white placeholder-white/50"
                      />
                      <Input
                        placeholder="Bottom Size"
                        value={preferences.sizes.bottom}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, bottom: e.target.value }
                        })}
                        className="bg-white/5 border-white/20 text-white placeholder-white/50"
                      />
                      <Input
                        placeholder="Shoe Size"
                        value={preferences.sizes.shoes}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          sizes: { ...preferences.sizes, shoes: e.target.value }
                        })}
                        className="bg-white/5 border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg space-y-4">
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
                          className={`w-full ${preferences.stores.includes(store) 
                            ? "bg-fashion-primary hover:bg-fashion-primary/90 text-white" 
                            : "border-white/20 text-white hover:bg-white/10"}`}
                        >
                          {store}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-fashion-primary to-fashion-accent hover:opacity-90 text-white font-medium">
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
