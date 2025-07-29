import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "./Cart";
import { useState } from "react";
import { ShippingAddress } from "./ShippingAddress";
import { toast } from "sonner";

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, looks, clearCart } = useCartStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const calculateTotal = () => {
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

  const handleCheckout = () => {
    setIsAddressModalOpen(true);
  };

  const handleOrderComplete = () => {
    // Since we're affiliate-based, we should redirect to external purchase
    toast.success("Redirecting to purchase...");
    
    // Collect all items from looks and individual items for affiliate tracking
    const allItems = [
      ...looks.flatMap(look => look.items),
      ...items
    ];
    
    // In a real implementation, you'd redirect to affiliate partner
    // For now, we'll clear cart and show success
    clearCart();
    toast.success("Ready for external purchase!");
    navigate("/");
  };

  if (items.length === 0 && looks.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            ← Back
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate("/home")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="space-y-8">
          <h1 className="text-2xl font-semibold">Checkout</h1>

          <div className="bg-netflix-card rounded-lg p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              
              {looks.map((look) => (
                <div key={look.id} className="border-b border-gray-700 pb-4">
                  <h3 className="font-medium mb-2">{look.title}</h3>
                  <p className="text-netflix-accent">{look.totalPrice}</p>
                </div>
              ))}

              {items.map((item) => (
                <div key={item.id} className="border-b border-gray-700 pb-4">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-netflix-accent">{item.price}</p>
                </div>
              ))}

              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-netflix-accent font-semibold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-netflix-accent hover:bg-netflix-accent/90"
              onClick={handleCheckout}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>

      <ShippingAddress 
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          handleOrderComplete();
        }}
      />
    </div>
  );
};