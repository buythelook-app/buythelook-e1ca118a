import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Package, Settings, User } from "lucide-react";

export const Profile = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-3xl mx-auto">
        <Card className="bg-netflix-card border-netflix-accent">
          <CardHeader>
            <CardTitle className="text-2xl font-display font-bold text-netflix-accent">My Terminal X</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">hilak2</h2>
                <p className="text-sm text-gray-400">hilak@gmail.com</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-4 gap-4 bg-netflix-background p-2">
                <TabsTrigger value="profile" className="data-[state=active]:bg-netflix-accent">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-netflix-accent">
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-netflix-accent">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-netflix-accent">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="First Name" className="bg-netflix-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Last Name" className="bg-netflix-background" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Email" className="bg-netflix-background" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="Phone Number" className="bg-netflix-background" />
                    </div>

                    <Button type="submit" className="w-full bg-netflix-accent hover:bg-netflix-accent/90">
                      Save Changes
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">My Credits</h3>
                  <Card className="bg-netflix-background">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold">0 Points</p>
                      <p className="text-sm text-gray-400">Available Credits</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dream Card</h3>
                  <Card className="bg-netflix-background">
                    <CardContent className="p-4">
                      <p className="text-sm">Apply for our Dream Card and enjoy exclusive benefits</p>
                      <Button className="mt-4 bg-netflix-accent hover:bg-netflix-accent/90">
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-400">No orders yet</p>
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Methods</h3>
                  <Button className="w-full bg-netflix-accent hover:bg-netflix-accent/90">
                    Add New Payment Method
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Newsletter Preferences</h3>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      Receive promotional emails
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" />
                      Receive order updates
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};