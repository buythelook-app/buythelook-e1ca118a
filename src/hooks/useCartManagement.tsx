
import { useCartStore } from "@/components/Cart";
import { toast } from "sonner";

export const useCartManagement = () => {
  const { addItem, addLook } = useCartStore();

  const handleAddToCart = (item: any, lookId?: string) => {
    addItem({
      id: item.id,
      title: item.name || item.title || "Fashion Item",
      price: item.price || "$49.99",
      image: item.image || "/placeholder.svg",
      lookId
    });

    toast.success(`${item.name || item.title || "Item"} added to cart`);
  };

  const handleAddLookToCart = (look: any) => {
    // Ensure we have lookItems to add
    const lookItems = look.items && look.items.length > 0 
      ? look.items.map((item: any) => ({
          id: item.id,
          title: item.name || `Item from ${look.title}`,
          price: item.price || "$49.99",
          image: item.image || "/placeholder.svg",
          lookId: look.id
        }))
      : [{
          id: `item-${look.id}`,
          title: look.title || "Look Item",
          price: look.price || "$49.99",
          image: look.image || "/placeholder.svg",
          lookId: look.id
        }];
    
    addLook({
      id: look.id,
      title: look.title || "Fashion Look",
      items: lookItems,
      totalPrice: look.price || "$49.99"
    });
    
    toast.success('Look added to cart');
  };

  return {
    handleAddToCart,
    handleAddLookToCart
  };
};
