import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';
import { toast } from "sonner";
import { CartItem } from "./cart/CartItem";
import { LookCartItem } from "./cart/LookCartItem";
import { CartSummary } from "./cart/CartSummary";

interface CartItem {
  id: string;
  image: string;
  title: string;
  price: string;
  lookId?: string;
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
  addItems: (items: CartItem[]) => void;
  addLook: (look: Look) => void;
  removeLook: (lookId: string) => void;
  removeItem: (itemId: string) => void;
  removeItemFromLook: (lookId: string, itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  looks: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  addItems: (newItems) => set((state) => ({
    items: [...state.items, ...newItems]
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
  removeItemFromLook: (lookId, itemId) => set((state) => ({
    looks: state.looks.map(look => {
      if (look.id === lookId) {
        const updatedItems = look.items.filter(item => item.id !== itemId);
        // If all items are removed, remove the look entirely
        if (updatedItems.length === 0) {
          return null;
        }
        return {
          ...look,
          items: updatedItems
        };
      }
      return look;
    }).filter((look): look is Look => look !== null)
  })),
  clearCart: () => set({ items: [], looks: [] }),
}));

export const Cart = () => {
  const navigate = useNavigate();
  const { items, looks, clearCart, removeItem, removeLook, removeItemFromLook } = useCartStore();

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

  const handleRemoveItemFromLook = (lookId: string, itemId: string) => {
    removeItemFromLook(lookId, itemId);
    toast.success('Item removed from look');
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
              {looks.map((look) => (
                <LookCartItem
                  key={look.id}
                  {...look}
                  onRemoveLook={handleRemoveLook}
                  onRemoveItem={handleRemoveItemFromLook}
                />
              ))}

              {items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Individual Items</h3>
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      {...item}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              )}

              <CartSummary
                total={calculateTotalPrice()}
                onClearCart={clearCart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
