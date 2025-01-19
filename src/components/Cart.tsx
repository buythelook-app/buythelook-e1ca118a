import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  image: string;
  title: string;
  price: string;
  lookId?: string; // Optional lookId to associate item with a look
}

interface Look {
  id: string;
  title: string;
  items: CartItem[];
  totalPrice: string;
}

interface CartStore {
  items: CartItem[];
  looks: Look[];
  addItem: (item: CartItem) => void;
  addLook: (look: Look) => void;
  removeLook: (lookId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  looks: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  addLook: (look) => set((state) => ({ 
    looks: [...state.looks, look] 
  })),
  removeLook: (lookId) => set((state) => ({
    looks: state.looks.filter((look) => look.id !== lookId)
  })),
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter((item) => item.id !== itemId)
  })),
  clearCart: () => set({ items: [], looks: [] }),
}));

export const Cart = () => {
  const navigate = useNavigate();
  const { items, looks, clearCart, removeItem, removeLook } = useCartStore();

  const calculateTotalPrice = () => {
    const itemsTotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + price;
    }, 0);

    const looksTotal = looks.reduce((sum, look) => {
      const price = parseFloat(look.totalPrice.replace('$', ''));
      return sum + price;
    }, 0);

    return itemsTotal + looksTotal;
  };

  const handleRemoveLook = (lookId: string) => {
    removeLook(lookId);
    toast.success('Look removed from cart');
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success('Item removed from cart');
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>
        
        <div className="bg-netflix-card rounded-lg p-6">
          {looks.length === 0 && items.length === 0 ? (
            <p className="text-center text-gray-400">Your cart is empty</p>
          ) : (
            <div className="space-y-8">
              {/* Complete Looks Section */}
              {looks.map((look) => (
                <div 
                  key={look.id}
                  className="bg-netflix-background rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{look.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-netflix-accent">{look.totalPrice}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLook(look.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {look.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-4 bg-netflix-card p-3 rounded-lg"
                      >
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-netflix-accent">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Individual Items Section */}
              {items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Individual Items</h3>
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between gap-4 bg-netflix-background p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-netflix-accent">{item.price}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-netflix-accent">${calculateTotalPrice().toFixed(2)}</span>
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