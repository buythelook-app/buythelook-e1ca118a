import { Button } from "../ui/button";

interface CartSummaryProps {
  total: number;
  onClearCart: () => void;
}

export const CartSummary = ({ total, onClearCart }: CartSummaryProps) => {
  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="text-netflix-accent">${total.toFixed(2)}</span>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">Checkout</Button>
        <Button variant="outline" className="flex-1" onClick={onClearCart}>
          Clear Cart
        </Button>
      </div>
    </div>
  );
};