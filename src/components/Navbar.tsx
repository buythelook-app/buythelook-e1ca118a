
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
      }
    };

    getUserData();
  }, []);

  console.log("Current firstName:", firstName);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col items-start">
          <Link to="/" className="text-2xl font-display text-netflix-accent">
            Buy the Look
          </Link>
          {firstName && (
            <span className="text-xs text-white mt-1">Hello, {firstName}</span>
          )}
        </div>
        <div className="flex items-center space-x-8">
          {/* תמיד הצג את העגלה */}
          <Link to="/cart" className="hover:text-netflix-accent relative">
            <ShoppingCart className="h-6 w-6 text-white" />
            {totalCartItems > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-netflix-accent text-[10px]"
              >
                {cartDisplayCount}
              </Badge>
            )}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-list" className="hover:text-netflix-accent relative">
                <Heart className="h-6 w-6" />
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
                      <User className="h-6 w-6 text-white fill-white stroke-[1.5]" />
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
              <User className="h-6 w-6 text-white stroke-[1.5]" />
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
