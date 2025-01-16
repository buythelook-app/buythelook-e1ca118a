import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const LookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-6">What's in the Look</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" 
              alt="Look detail" 
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
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-400">Modern light clothes</p>
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