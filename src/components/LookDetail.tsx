
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";
import { LookHeader } from "./look/LookHeader";
import { LookActions } from "./look/LookActions";
import { LookItemsList } from "./look/LookItemsList";
import { StyleRulers } from "./look/StyleRulers";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [look, setLook] = useState<any>(null);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);

  useEffect(() => {
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
      <div className="min-h-screen bg-netflix-background flex items-center justify-center">
        <div className="animate-pulse">Loading look details...</div>
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
    <div className="min-h-screen bg-netflix-background text-netflix-text p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-4 md:mb-6"
        >
          ← Back
        </Button>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LookHeader 
              title={look.title}
              description={look.description}
              image={look.items[0]?.image}
            />
            
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
