
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';
import { toast } from "sonner";
import { CartItem } from "./cart/CartItem";
import { LookCartItem } from "./cart/LookCartItem";
import { CartSummary } from "./cart/CartSummary";
import { HomeButton } from "./HomeButton";

interface CartItem {
  id: string;
  image: string;
  title: string;
  price: string;
  lookId?: string;
  size?: string;
  type?: string;
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
  addItem: (item: CartItem) => Promise<void>;
  addItems: (items: CartItem[]) => Promise<void>;
  addLook: (look: Look) => Promise<void>;
  removeLook: (lookId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeItemFromLook: (lookId: string, itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => {
  // Load initial state from localStorage
  const loadFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        return {
          items: parsed.items || [],
          looks: parsed.looks || []
        };
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return { items: [], looks: [] };
  };

  // Save to localStorage
  const saveToStorage = (state: { items: CartItem[]; looks: Look[] }) => {
    try {
      localStorage.setItem('shopping-cart', JSON.stringify({
        items: state.items,
        looks: state.looks
      }));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  const initialState = loadFromStorage();

  return {
    items: initialState.items,
    looks: initialState.looks,
    addItem: async (item) => {
      try {
        set(state => {
          const newState = {
            ...state,
            items: [...state.items, item]
          };
          saveToStorage(newState);
          return newState;
        });
        toast.success('Item added to cart');
      } catch (err) {
        console.error('Error in addItem:', err);
        toast.error('Failed to add item to cart');
      }
    },
    addItems: async (newItems) => {
      try {
        set(state => {
          const newState = {
            ...state,
            items: [...state.items, ...newItems]
          };
          saveToStorage(newState);
          return newState;
        });
        toast.success('Items added to cart');
      } catch (err) {
        console.error('Error in addItems:', err);
        toast.error('Failed to add items to cart');
      }
    },
    addLook: async (look) => {
      set(state => {
        const newState = { 
          ...state,
          looks: [...state.looks, look]
        };
        saveToStorage(newState);
        return newState;
      });
      toast.success('Look added to cart');
    },
    removeLook: async (lookId) => {
      const look = get().looks.find(l => l.id === lookId);
      if (look) {
        for (const item of look.items) {
          await get().removeItem(item.id);
        }
      }
      set(state => {
        const newState = {
          ...state,
          looks: state.looks.filter(l => l.id !== lookId)
        };
        saveToStorage(newState);
        return newState;
      });
    },
    removeItem: async (itemId) => {
      set(state => {
        const newState = {
          ...state,
          items: state.items.filter(item => item.id !== itemId),
          looks: state.looks.map(look => ({
            ...look,
            items: look.items.filter(item => item.id !== itemId)
          })).filter(look => look.items.length > 0)
        };
        saveToStorage(newState);
        return newState;
      });
    },
    removeItemFromLook: async (lookId, itemId) => {
      await get().removeItem(itemId);
      set(state => {
        const newState = {
          ...state,
          looks: state.looks.map(look => {
            if (look.id === lookId) {
              const updatedItems = look.items.filter(item => item.id !== itemId);
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
        };
        saveToStorage(newState);
        return newState;
      });
    },
    clearCart: async () => {
      const newState = { items: [], looks: [] };
      set(newState);
      saveToStorage(newState);
      toast.success('Cart cleared');
    }
  };
});

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
                  key={`look-${look.id}`}
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
                      key={`item-${item.id}`}
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
      <HomeButton />
    </div>
  );
};
