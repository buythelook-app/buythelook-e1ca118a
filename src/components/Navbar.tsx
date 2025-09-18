
import { Sparkles, Heart, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { ShippingAddress } from "./ShippingAddress";
import { UserDropdownMenu } from "./navbar/UserDropdownMenu";
import { useCalendarSync } from "./navbar/CalendarSync";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCartStore } from "./Cart";
import { Badge } from "./ui/badge";
import { supabase } from "@/lib/supabase";

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const { handleCalendarSync } = useCalendarSync();
  const { favorites } = useFavoritesStore();
  const { items, looks } = useCartStore();
  const [firstName, setFirstName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const totalLooks = favorites.length;
  const displayCount = totalLooks > 9 ? '9+' : totalLooks.toString();

  const totalCartItems = items.length + looks.length;
  const cartDisplayCount = totalCartItems > 9 ? '9+' : totalCartItems.toString();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          // Get first name from metadata, email, or Google profile
          const name = user.user_metadata?.firstName || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      "";
          console.log("Setting firstName to:", name);
          setFirstName(name);
          
          // Get avatar from metadata or Google profile
          const avatar = user.user_metadata?.avatar_url || 
                        user.user_metadata?.picture || 
                        "";
          setAvatarUrl(avatar);
        } else {
          setIsAuthenticated(false);
          setFirstName("");
          setAvatarUrl("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
        setFirstName("");
        setAvatarUrl("");
      }
    };

    // Set up auth state listener to update navbar when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Navbar:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setIsAuthenticated(true);
          const name = session.user.user_metadata?.firstName || 
                      session.user.user_metadata?.name || 
                      session.user.email?.split('@')[0] || 
                      "";
          setFirstName(name);
          
          const avatar = session.user.user_metadata?.avatar_url || 
                        session.user.user_metadata?.picture || 
                        "";
          setAvatarUrl(avatar);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setFirstName("");
        setAvatarUrl("");
      }
    });

    getUserData();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log("Current firstName:", firstName);

  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-1">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="block">
            <img 
              src="/lovable-uploads/36f503f4-5335-485a-84dd-293fee3fc453.png" 
              alt="Buy the Look Logo" 
              className="h-48 w-auto object-contain"
            />
          </Link>
          {firstName && (
            <span className="text-xs text-white ml-3">Hello, {firstName}</span>
          )}
        </div>
        <div className="flex items-center space-x-6">
          {/* תמיד הצג את העגלה */}
          <Link to="/cart" className="hover:text-netflix-accent relative">
            <ShoppingCart className="h-5 w-5 text-white" />
            {totalCartItems > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-fashion-primary text-[10px]"
              >
                {cartDisplayCount}
              </Badge>
            )}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-list" className="hover:text-netflix-accent relative">
                <Heart className="h-5 w-5" />
                {totalLooks > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-netflix-accent text-[10px]"
                  >
                    {displayCount}
                  </Badge>
                )}
              </Link>
              <div className="inline-flex items-center group relative">
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-netflix-accent">
                    {avatarUrl ? (
                      <Avatar className="h-8 w-8 border border-gray-400">
                        <AvatarImage src={avatarUrl} alt={firstName} />
                        <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-5 w-5 text-white fill-white stroke-[1.5]" />
                    )}
                  </DropdownMenuTrigger>
        <UserDropdownMenu 
          onAddressClick={() => setShowShippingAddress(true)}
          handleCalendarSync={handleCalendarSync}
        />
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Link to="/auth" className="hover:text-netflix-accent">
              <User className="h-5 w-5 text-white stroke-[1.5]" />
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
