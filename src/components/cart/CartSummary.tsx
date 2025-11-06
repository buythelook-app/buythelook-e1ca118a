import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface CartSummaryProps {
  total: number;
  onClearCart: () => void;
}

export const CartSummary = ({ total, onClearCart }: CartSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="text-primary text-xl">${total.toFixed(2)}</span>
      </div>
      <div className="flex space-x-4 justify-end">
        <Button variant="outline" onClick={onClearCart}>
          Clear Cart
        </Button>
        <Button 
          variant="default" 
          onClick={() => navigate("/product-links")}
        >
          Go to Purchase
        </Button>
      </div>
    </div>
  );
};