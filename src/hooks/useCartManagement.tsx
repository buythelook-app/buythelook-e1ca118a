
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DashboardItem } from "@/types/lookTypes";

export const useCartManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle adding items to cart
  const handleAddToCart = (items: Array<any> | any) => {
    const itemsToAdd = Array.isArray(items) ? items : [items];
    const cartItems = itemsToAdd.map(item => ({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image
    }));
    
    toast({
      title: "Success",
      description: Array.isArray(items) ? "All items added to cart" : "Item added to cart",
    });
    navigate('/cart');
    
    // Return the cart items to be used by the cart store
    return cartItems;
  };

  return {
    handleAddToCart
  };
};
