
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";
import { LookHeader } from "./look/LookHeader";
import { LookActions } from "./look/LookActions";
import { LookItemsList } from "./look/LookItemsList";
import { StyleRulers } from "./look/StyleRulers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LookCanvas } from "./LookCanvas";

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [look, setLook] = useState<any>(null);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);
  const [userStyle, setUserStyle] = useState<string | null>(null);

  useEffect(() => {
    // Load the user's style preference
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        const styleProfile = parsedData?.analysis?.styleProfile || null;
        setUserStyle(styleProfile);
      } catch (error) {
        console.error("Error parsing style data:", error);
      }
    }

    if (id) {
      const storedLook = localStorage.getItem(`look-${id}`);
      if (storedLook) {
        setLook(JSON.parse(storedLook));
      } else {
        toast.error("Look not found");
        navigate('/home');
      }
    }
  }, [id, navigate]);

  if (!look) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center">
        <div className="animate-fadeIn text-fashion-primary">Loading look details...</div>
      </div>
    );
  }

  const handleEleganceChange = (value: number[]) => {
    setElegance(value[0]);
  };

  const handleColorIntensityChange = (value: number[]) => {
    setColorIntensity(value[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-4 md:mb-6 hover:bg-accent/20"
        >
          ← Back
        </Button>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-fashion-glass p-8 rounded-xl shadow-xl backdrop-blur-xl border border-white/20">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold fashion-hero-text">{look.title}</h2>
                  {userStyle && (
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      {userStyle} style
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{look.description}</p>
                <div className="relative aspect-[3/4] w-full bg-white rounded-lg overflow-hidden">
                  <LookCanvas 
                    items={look.items.map((item: any) => ({
                      id: item.id,
                      image: item.image,
                      type: item.type
                    }))}
                    width={600}
                    height={800}
                  />
                </div>
              </div>
              
              <div className="mt-4 md:mt-6">
                <LookActions
                  id={look.id}
                  image={look.items[0]?.image}
                  title={look.title}
                  price={look.price}
                  category={look.category}
                  items={look.items}
                />
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <LookItemsList look={look} />
            </div>
          </div>

          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-4">
              <StyleRulers
                elegance={elegance}
                colorIntensity={colorIntensity}
                onEleganceChange={handleEleganceChange}
                onColorIntensityChange={handleColorIntensityChange}
              />
            </div>
          </div>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
