
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Calendar, Bell, MapPin, ShoppingBag, Book, UserCog, Sparkles, Info, ScrollText, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserDropdownMenuProps {
  onAddressClick: () => void;
  handleCalendarSync: () => Promise<void>;
}

export const UserDropdownMenu = ({ onAddressClick, handleCalendarSync }: UserDropdownMenuProps) => {
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>('');
  const [userName, setUserName] = useState<string | undefined>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        // Use email username as display name if no metadata is set
        setUserName(user.user_metadata.username || user.email?.split('@')[0] || 'User');
      }
    };

    getUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

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
    <DropdownMenuContent align="end" className="w-56 bg-card border-border p-2">
      <div className="flex items-center gap-3 p-2 mb-2 border-b border-border">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{userName}</span>
          <span className="text-sm text-muted-foreground">{userEmail}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">Sync To Calendar</span>
          </div>
          <Switch 
            checked={isCalendarEnabled}
            onCheckedChange={handleCalendarToggle}
          />
        </div>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">Turn On Notification</span>
          </div>
          <Switch 
            checked={isNotificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>

        <DropdownMenuItem 
          onClick={onAddressClick}
          className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <MapPin className="h-4 w-4" />
          <span>Shipping Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/style-guide" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
            <Book className="h-4 w-4" />
            <span>Style Guide</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
            <UserCog className="h-4 w-4" />
            <span>Update Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem asChild>
          <Link to="/about" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
            <Info className="h-4 w-4" />
            <span>About The App</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/rules" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
            <ScrollText className="h-4 w-4" />
            <span>Our Rules</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
};
