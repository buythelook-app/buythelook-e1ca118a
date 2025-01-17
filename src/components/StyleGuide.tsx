import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Preferences Saved",
      description: "Your style preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-semibold mb-6">Style Preferences</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-netflix-card p-4 rounded-lg space-y-4">
            <h2 className="font-medium">Your Sizes</h2>
            <div className="space-y-2">
              <Input
                placeholder="Top Size"
                value={preferences.sizes.top}
                onChange={(e) => setPreferences({
                  ...preferences,
                  sizes: { ...preferences.sizes, top: e.target.value }
                })}
                className="bg-netflix-background"
              />
              <Input
                placeholder="Bottom Size"
                value={preferences.sizes.bottom}
                onChange={(e) => setPreferences({
                  ...preferences,
                  sizes: { ...preferences.sizes, bottom: e.target.value }
                })}
                className="bg-netflix-background"
              />
              <Input
                placeholder="Shoe Size"
                value={preferences.sizes.shoes}
                onChange={(e) => setPreferences({
                  ...preferences,
                  sizes: { ...preferences.sizes, shoes: e.target.value }
                })}
                className="bg-netflix-background"
              />
            </div>
          </div>

          <div className="bg-netflix-card p-4 rounded-lg space-y-4">
            <h2 className="font-medium">Preferred Stores</h2>
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
                  className="w-full"
                >
                  {store}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Preferences
          </Button>
        </form>
      </div>
    </div>
  );
};