import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Calendar, Bell, MapPin, ShoppingBag, Heart, Book, UserCog } from "lucide-react";

export const Profile = () => {
  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">PROFILE</CardTitle>
        <div className="flex items-center gap-3 mt-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">hilak2</span>
            <span className="text-sm text-gray-500">hilak@gmail.com</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Sync To Calendar</span>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Turn On Notification</span>
          </div>
          <Switch />
        </div>

        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Shipping Address</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span>My Orders</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>My Wish List</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span>Style Guide</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            <span>Update Profile</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};