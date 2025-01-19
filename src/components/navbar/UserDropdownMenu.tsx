import { Link } from "react-router-dom";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Calendar, Bell, MapPin, ShoppingBag, Heart, Book, UserCog, Sparkles, Info, ScrollText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UserDropdownMenuProps {
  onAddressClick: () => void;
  handleCalendarSync: () => Promise<void>;
}

export const UserDropdownMenu = ({ onAddressClick, handleCalendarSync }: UserDropdownMenuProps) => {
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  const handleCalendarToggle = async (checked: boolean) => {
    setIsCalendarEnabled(checked);
    if (checked) {
      await handleCalendarSync();
      toast({
        title: "Calendar Sync Enabled",
        description: "Your calendar is now synced with the app.",
      });
    } else {
      toast({
        title: "Calendar Sync Disabled",
        description: "Your calendar is no longer synced with the app.",
      });
    }
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setIsNotificationsEnabled(checked);
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked ? "You will now receive notifications." : "You will no longer receive notifications.",
    });
  };

  return (
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
            <span className="text-sm text-netflix-text">Sync To Calendar</span>
          </div>
          <Switch 
            checked={isCalendarEnabled}
            onCheckedChange={handleCalendarToggle}
          />
        </div>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-netflix-text" />
            <span className="text-sm text-netflix-text">Turn On Notification</span>
          </div>
          <Switch 
            checked={isNotificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>

        <DropdownMenuItem asChild>
          <Link to="/my-list" className="flex items-center gap-2 text-netflix-text hover:text-netflix-accent">
            <Heart className="h-4 w-4" />
            <span>My List</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={onAddressClick}
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
  );
};