import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";
import { LookHeader } from "./look/LookHeader";
import { LookActions } from "./look/LookActions";
import { LookItemsList } from "./look/LookItemsList";
import { StyleRulers } from "./look/StyleRulers";
import { useState } from "react";

const featuredLooks = [
  { 
    id: "look-1", 
    title: "Summer Casual", 
    description: "Perfect for a day at the beach or a casual summer outing.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    price: "$199.99",
    category: "Casual",
    items: [
      {
        id: "item-1",
        title: "Summer Casual Item",
        price: "$199.99",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050"
      }
    ]
  },
  { 
    id: "look-2", 
    title: "Business Professional", 
    description: "Perfect for important business meetings and formal occasions.",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
    price: "$249.99",
    category: "Formal",
    items: [
      {
        id: "item-2",
        title: "Business Professional Item",
        price: "$249.99",
        image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2"
      }
    ]
  },
  { 
    id: "look-3", 
    title: "Evening Elegance", 
    description: "Sophisticated and stylish for evening events.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    price: "$299.99",
    category: "Business",
    items: [
      {
        id: "item-3",
        title: "Evening Elegance Item",
        price: "$299.99",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
      }
    ]
  },
  { 
    id: "look-4", 
    title: "Weekend Comfort", 
    description: "Casual and comfortable for weekend activities.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    price: "$179.99",
    category: "Casual",
    items: [
      {
        id: "item-4",
        title: "Weekend Comfort Item",
        price: "$179.99",
        image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e"
      }
    ]
  }
];

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [elegance, setElegance] = useState(75); // Default value for Business Professional look
  const [colorIntensity, setColorIntensity] = useState(60);

  const look = featuredLooks.find(look => look.id === id);

  if (!look) {
    return <div>Look not found</div>;
  }

  const handleEleganceChange = (value: number[]) => {
    setElegance(value[0]);
  };

  const handleColorIntensityChange = (value: number[]) => {
    setColorIntensity(value[0]);
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <LookHeader 
              title={look.title}
              description={look.description}
              image={look.image}
            />
            
            <div className="mt-6">
              <LookActions look={look} />
            </div>

            <div className="mt-6">
              <LookItemsList look={look} />
            </div>
          </div>

          <div className="md:col-span-1">
            <StyleRulers
              elegance={elegance}
              colorIntensity={colorIntensity}
              onEleganceChange={handleEleganceChange}
              onColorIntensityChange={handleColorIntensityChange}
            />
          </div>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
