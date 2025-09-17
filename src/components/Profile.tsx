
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Package, Settings, User, Apple, Shirt } from "lucide-react";
import { HomeButton } from "./HomeButton";
import { CreditCardForm } from "./payments/CreditCardForm";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import RecommendLookButton from "./RecommendLookButton";

const mockOrders = [
  { id: '1', date: '2024-03-15', total: 299.99, status: 'Delivered' },
  { id: '2', date: '2024-03-10', total: 149.99, status: 'Processing' },
];

export const Profile = () => {
  const { toast } = useToast();
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [quizData, setQuizData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserEmail(user.email || "");
      setUserName(user.user_metadata.name || user.email?.split('@')[0] || "");
      setUserId(user.id);
      
      setFormData({
        firstName: user.user_metadata.firstName || "",
        lastName: user.user_metadata.lastName || "",
        phone: user.user_metadata.phone || "",
      });

      // Load quiz data
      const { data: quizResults } = await (supabase as any)
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (quizResults) {
        setQuizData(quizResults);
      }
    };

    getUserData();
  }, [navigate]);

  // Refresh quiz data when component mounts or when coming back from quiz
  useEffect(() => {
    const refreshQuizData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: quizResults } = await (supabase as any)
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (quizResults) {
        setQuizData(quizResults);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshQuizData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.auth.updateUser({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        }
      });

      if (error) throw error;

      if (data.user) {
        setUserName(`${formData.firstName} ${formData.lastName}`.trim() || data.user.email?.split('@')[0] || "");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <div>
      <div className="min-h-screen bg-fashion-background text-fashion-text p-6">
        <div className="container max-w-3xl mx-auto">
          <Card className="bg-fashion-card border-fashion-primary">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-bold text-fashion-primary">
                Buy The Look
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{userName}</h2>
                  <p className="text-sm text-gray-400">{userEmail}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid grid-cols-5 gap-4 bg-fashion-background p-2">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-fashion-primary">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-fashion-primary">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="data-[state=active]:bg-fashion-primary">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-fashion-primary">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="looks" className="data-[state=active]:bg-fashion-primary">
                    <Shirt className="mr-2 h-4 w-4" />
                    My Looks
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            placeholder="First Name" 
                            className="bg-fashion-background"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Last Name" 
                            className="bg-fashion-background"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={userEmail}
                          readOnly
                          className="bg-fashion-background opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="Phone Number" 
                          className="bg-fashion-background"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button type="submit" className="w-full bg-fashion-primary hover:bg-fashion-primary/90">
                        Save Changes
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Style Quiz Results</h3>
                    {quizData ? (
                      <Card className="bg-fashion-background">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Body Shape</p>
                              <p className="font-semibold">{quizData.body_shape}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Gender</p>
                              <p className="font-semibold">{quizData.gender}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Height</p>
                              <p className="font-semibold">{quizData.height} cm</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Weight</p>
                              <p className="font-semibold">{quizData.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Color Preferences</p>
                              <p className="font-semibold">{quizData.color_preferences?.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Style Preferences</p>
                              <p className="font-semibold">{quizData.style_preferences?.join(', ')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-fashion-background">
                        <CardContent className="p-4">
                          <p className="text-center text-gray-400">No quiz results yet</p>
                          <Button 
                            onClick={() => navigate('/quiz')}
                            className="w-full mt-4 bg-fashion-primary hover:bg-fashion-primary/90"
                          >
                            Take Style Quiz
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">My Credits</h3>
                    <Card className="bg-fashion-background">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold">0 Points</p>
                        <p className="text-sm text-gray-400">Available Credits</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="orders">
                  <div className="space-y-4">
                    {mockOrders.length > 0 ? (
                      mockOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="bg-fashion-background p-4 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-400">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-fashion-primary">${order.total}</p>
                            <p className="text-sm">{order.status}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-400">No orders yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payments">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Methods</h3>
                    {showCreditCardForm ? (
                      <CreditCardForm onClose={() => setShowCreditCardForm(false)} />
                    ) : (
                      <div className="flex flex-col gap-4">
                        <button
                          className="flex items-center gap-2 bg-fashion-background hover:bg-fashion-background/80 text-fashion-text px-6 py-3 rounded-lg transition-colors w-full"
                          onClick={() => setShowCreditCardForm(true)}
                        >
                          <CreditCard className="w-6 h-6" />
                          <span>Credit Card</span>
                        </button>
                        <button className="flex items-center gap-2 bg-fashion-background hover:bg-fashion-background/80 text-fashion-text px-6 py-3 rounded-lg transition-colors w-full">
                          <Apple className="w-6 h-6" />
                          <span>Apple Pay</span>
                        </button>
                      </div>
                    )}
                    {!showCreditCardForm && (
                      <Button
                        className="w-full bg-fashion-primary hover:bg-fashion-primary/90 mt-4"
                        onClick={() => setShowCreditCardForm(true)}
                      >
                        Add New Payment Method
                      </Button>
                    )}
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

                <TabsContent value="looks">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fashion Recommendations</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get personalized outfit recommendations based on your style profile and preferences.
                    </p>
                    
                    {userId && <RecommendLookButton userId={userId} />}
                    
                    {!userId && (
                      <div className="text-center py-8">
                        <Shirt className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-400">Sign in to get personalized outfit recommendations</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
