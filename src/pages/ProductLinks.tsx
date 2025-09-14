import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export const ProductLinks = () => {
  const navigate = useNavigate();
  const { items, looks, clearCart } = useCartStore();
  const [allItems, setAllItems] = useState<any[]>([]);

  useEffect(() => {
    // Collect all items from looks and individual items
    const collectedItems = [
      ...looks.flatMap(look => look.items),
      ...items
    ];
    setAllItems(collectedItems);
  }, [items, looks]);

  const generateProductLink = (item: any) => {
    // Create search URLs for different retailers based on product name
    const searchQuery = encodeURIComponent(item.title || item.name || 'fashion item');
    
    // Default to Google search if no specific URL
    if (item.url) {
      return item.url;
    }
    
    return `https://www.google.com/search?q=${searchQuery} Zara H&M ASOS`;
  };

  const handleFinish = () => {
    clearCart();
    navigate("/home");
  };

  if (allItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 p-6">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/cart")}
            className="mb-6 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          >
            ← Back to Cart
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900">No items to purchase</h1>
            <Button 
              onClick={() => navigate("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/cart")}
          className="mb-6 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          ← Back to Cart
        </Button>

        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-8">
          <div className="text-center mb-8">
            <ShoppingBag className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ready to Purchase!</h1>
            <p className="text-gray-600">Click on any item below to visit the retailer's website and complete your purchase.</p>
          </div>

          <div className="space-y-6 mb-8">
            {allItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title || item.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title || item.name}</h3>
                    <p className="text-blue-600 font-semibold">{item.price}</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.open(generateProductLink(item), '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buy Now
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-blue-100 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Shopping Tips:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Each link will open in a new tab</li>
              <li>• Check for size availability on the retailer's website</li>
              <li>• Compare prices across different retailers</li>
              <li>• Look for discount codes or promotions</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              size="lg"
            >
              Finish Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};