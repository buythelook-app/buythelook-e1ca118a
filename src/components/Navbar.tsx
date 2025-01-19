import { Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { ShippingAddress } from "./ShippingAddress";
import { UserDropdownMenu } from "./navbar/UserDropdownMenu";
import { useCalendarSync } from "./navbar/CalendarSync";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { Badge } from "./ui/badge";

export const Navbar = () => {
  const isAuthenticated = true;
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const { handleCalendarSync } = useCalendarSync();
  const { favorites } = useFavoritesStore();

  const totalLooks = favorites.length;
  const displayCount = totalLooks > 9 ? '9+' : totalLooks.toString();

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-display text-netflix-accent">
          Buy the Look
        </Link>
        <div className="flex items-center gap-6">
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
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-netflix-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <UserDropdownMenu 
                  onAddressClick={() => setShowShippingAddress(true)}
                  handleCalendarSync={handleCalendarSync}
                />
              </DropdownMenu>
            </>
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