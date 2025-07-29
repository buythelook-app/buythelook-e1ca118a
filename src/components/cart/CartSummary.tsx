import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface CartSummaryProps {
  total: number;
  onClearCart: () => void;
}

export const CartSummary = ({ total, onClearCart }: CartSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="text-netflix-accent">${total.toFixed(2)}</span>
      </div>
      <div className="flex space-x-8 justify-end">
        <Button variant="outline" onClick={onClearCart}>
          Clear Cart
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/checkout")}
          className="bg-netflix-accent text-white hover:bg-netflix-accent/90"
        >
          Go to Purchase
        </Button>
      </div>
    </div>
  );
};