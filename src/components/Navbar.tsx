import { Search, Calendar, Bell, MapPin, ShoppingBag, Heart, Book, UserCog, Sparkles, Info, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ShippingAddress } from "./ShippingAddress";
import { useToast } from "./ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarAPI {
  requestPermission: () => Promise<string>;
}

interface NavigatorWithCalendar extends Navigator {
  calendar?: CalendarAPI;
}

export const Navbar = () => {
  const isAuthenticated = true;
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleCalendarSync = async () => {
    // Check if running in a standalone PWA or mobile app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isMobile || !isStandalone) {
      toast({
        title: "Calendar Sync",
        description: "Calendar sync is only available in our mobile app. Please install and open our app.",
        variant: "destructive",
      });
      return;
    }

    // Check if the calendar API is available
    if (!('calendar' in navigator)) {
      toast({
        title: "Calendar Sync",
        description: "Calendar API is not supported in your device. Please update your app or try a different device.",
        variant: "destructive",
      });
      return;
    }

    const navigatorWithCalendar = navigator as NavigatorWithCalendar;
    
    if (!navigatorWithCalendar.calendar?.requestPermission) {
      toast({
        title: "Calendar Sync",
        description: "Calendar sync is not available. Please make sure you're using our latest mobile app version.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await navigatorWithCalendar.calendar.requestPermission();
      if (result === 'granted') {
        toast({
          title: "Calendar Synced",
          description: "Your calendar has been successfully synced.",
        });
      } else {
        toast({
          title: "Calendar Sync Failed",
          description: "Permission was denied. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Calendar Sync Error",
        description: "An error occurred while syncing your calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-display text-netflix-accent">
          Buy the Look
        </Link>
        <div className="flex items-center gap-6">
          <button className="hover:text-netflix-accent">
            <Search size={24} />
          </button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:text-netflix-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-netflix-card p-2">
                <div className="flex items-center gap-3 p-2 mb-2 border-b border-gray-700">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <Sparkles className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-netflix-text">hilak2</span>
                    <span className="text-sm text-gray-400">hilak@gmail.com</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-netflix-text" />
                      <button 
                        onClick={handleCalendarSync}
                        className="text-sm text-netflix-text hover:text-netflix-accent"
                      >
                        Sync To Calendar
                      </button>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-netflix-text" />
                      <span className="text-sm text-netflix-text">Turn On Notification</span>
                    </div>
                    <Switch />
                  </div>

                  <DropdownMenuItem 
                    onClick={() => setShowShippingAddress(true)}
                    className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Shipping Address</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <ShoppingBag className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <Heart className="h-4 w-4" />
                      <span>My Wish List</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/style-guide" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <Book className="h-4 w-4" />
                      <span>Style Guide</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <UserCog className="h-4 w-4" />
                      <span>Update Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem asChild>
                    <Link to="/about" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <Info className="h-4 w-4" />
                      <span>About The App</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/rules" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
                      <ScrollText className="h-4 w-4" />
                      <span>Our Rules</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hover:text-netflix-accent">
              <Sparkles size={24} />
            </Link>
          )}
        </div>
      </div>

      <ShippingAddress 
        isOpen={showShippingAddress} 
        onClose={() => setShowShippingAddress(false)} 
      />
    </nav>
  );
};