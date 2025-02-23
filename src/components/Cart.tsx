import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from "sonner";
import { CartItem } from "./cart/CartItem";
import { LookCartItem } from "./cart/LookCartItem";
import { CartSummary } from "./cart/CartSummary";
import { HomeButton } from "./HomeButton";
import { supabase } from "@/lib/supabase";

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
  addItem: (item: CartItem) => Promise<void>;
  addItems: (items: CartItem[]) => Promise<void>;
  addLook: (look: Look) => Promise<void>;
  removeLook: (lookId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeItemFromLook: (lookId: string, itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      looks: [],
      loadCart: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cart_items')
          .select('items(*)')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading cart:', error);
          return;
        }

        const cartItems = (data as CartItemData[]).map(item => ({
          id: item.items.id,
          image: item.items.image || '',
          title: item.items.name || '',
          price: item.items.price || ''
        }));

        set({ items: cartItems });
      },
      addItem: async (item) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_id: item.id
          });

        if (error) {
          console.error('Error adding item to cart:', error);
          return;
        }

        set(state => ({
          items: [...state.items, item]
        }));
      },
      addItems: async (newItems) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const cartItems = newItems.map(item => ({
          user_id: user.id,
          item_id: item.id
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(cartItems);

        if (error) {
          console.error('Error adding items to cart:', error);
          return;
        }

        set(state => ({
          items: [...state.items, ...newItems]
        }));
      },
      addLook: async (look) => {
        await get().addItems(look.items);
        set(state => ({ 
          looks: [...state.looks, look]
        }));
      },
      removeLook: async (lookId) => {
        const look = get().looks.find(l => l.id === lookId);
        if (look) {
          for (const item of look.items) {
            await get().removeItem(item.id);
          }
        }
        set(state => ({
          looks: state.looks.filter(l => l.id !== lookId)
        }));
      },
      removeItem: async (itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) {
          console.error('Error removing item from cart:', error);
          return;
        }

        set(state => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },
      removeItemFromLook: async (lookId, itemId) => {
        await get().removeItem(itemId);
        set(state => ({
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
        }));
      },
      clearCart: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing cart:', error);
          return;
        }

        set({ items: [], looks: [] });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

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
      <HomeButton />
    </div>
  );
};
