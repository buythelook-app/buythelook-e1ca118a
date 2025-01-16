import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { mockLooks } from "./LookSuggestions"; // We'll use this to get the look data

export const LookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the current look based on the ID
  const currentLook = mockLooks.find(look => look.id === id);

  if (!currentLook) {
    return <div>Look not found</div>;
  }

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-6">What's in the Look</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <img 
              src={currentLook.image}
              alt={currentLook.title}
              className="w-full rounded-lg"
            />
            <div className="flex gap-2">
              <Button className="flex-1">Try the Look</Button>
              <Button variant="outline" className="flex-1">Buy the Look</Button>
            </div>
          </div>

          <div>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="size" className="flex-1">Size</TabsTrigger>
                <TabsTrigger value="ratings" className="flex-1">Ratings</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Description</h3>
                  <p className="text-sm text-gray-400 mb-6">{currentLook.title} - {currentLook.category}</p>
                  
                  <h4 className="font-semibold mb-2">Items in this Look:</h4>
                  <div className="space-y-4">
                    {currentLook.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 border border-gray-700 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={`Item ${index + 1}`} 
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">Item {index + 1}</p>
                          <p className="text-sm text-gray-400">Part of {currentLook.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="size">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Size Guide</h3>
                  <p className="text-sm text-gray-400">Select your size</p>
                </div>
              </TabsContent>
              <TabsContent value="ratings">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Customer Reviews</h3>
                  <p className="text-sm text-gray-400">No reviews yet</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};