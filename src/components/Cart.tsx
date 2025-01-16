import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';

interface CartItem {
  id: string;
  image: string;
  title: string;
  price: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  addItems: (items) => set((state) => ({ 
    items: [...state.items, ...items] 
  })),
  clearCart: () => set({ items: [] }),
}));

export const Cart = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + price;
  }, 0);

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
          {items.length === 0 ? (
            <p className="text-center text-gray-400">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-4 p-4 bg-netflix-background rounded-lg"
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-netflix-accent">{item.price}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-netflix-accent">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Checkout</Button>
                  <Button variant="outline" className="flex-1" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};