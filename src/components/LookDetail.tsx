import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { mockLooks } from "./LookSuggestions";
import { Card, CardContent } from "./ui/card";
import { LookCanvas } from "./LookCanvas";

export const LookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentLook = mockLooks.find(look => look.id === id);

  if (!currentLook) {
    return (
      <div className="min-h-screen bg-netflix-background text-netflix-text p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Look not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back to Looks
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Look Preview */}
          <div className="space-y-4">
            <div className="bg-netflix-card rounded-lg p-4 h-full">
              <LookCanvas items={currentLook.items} width={600} height={600} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Try the Look</Button>
              <Button variant="outline" className="flex-1">Buy the Look ({currentLook.price})</Button>
            </div>
          </div>

          {/* Right Column - Look Details */}
          <div className="h-full">
            <Tabs defaultValue="details" className="w-full h-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="size">Size Guide</TabsTrigger>
                <TabsTrigger value="ratings">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2">{currentLook.title}</h2>
                        <p className="text-netflix-accent">{currentLook.category}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Items in this Look</h3>
                        <div className="space-y-4">
                          {currentLook.items.map((item, index) => (
                            <div 
                              key={item.id}
                              className="flex items-start gap-4 p-4 bg-netflix-background rounded-lg transition-all hover:bg-netflix-card"
                            >
                              <img 
                                src={item.image} 
                                alt={`Item ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">Item {index + 1}</h4>
                                <p className="text-sm text-netflix-accent mb-2">Part of {currentLook.title}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm opacity-75">Individual price available in cart</span>
                                  <Button variant="outline" size="sm">Add to Cart</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="size">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Size Guide</h3>
                    <p className="text-sm text-gray-400">
                      Please refer to individual items for specific sizing information.
                      Each piece may have different sizing charts based on the brand and style.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ratings">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Customer Reviews</h3>
                    <p className="text-sm text-gray-400">
                      Be the first to review this look!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};