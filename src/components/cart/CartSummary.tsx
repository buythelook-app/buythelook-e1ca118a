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
      <div className="flex space-x-8 justify-end">
        <Button variant="outline" onClick={onClearCart}>
          Clear Cart
        </Button>
        <Button variant="outline">Checkout</Button>
      </div>
    </div>
  );
};