import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Cart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back to Look
        </Button>

        <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>
        
        <div className="bg-netflix-card rounded-lg p-6">
          <p className="text-center text-gray-400">Your cart is empty</p>
        </div>
      </div>
    </div>
  );
};