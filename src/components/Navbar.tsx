import { Search, User, Calendar, Bell, MapPin, ShoppingBag, Heart, Book, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export const Navbar = () => {
  const isAuthenticated = true; // Changed to true to show the menu

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
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white p-2">
                <div className="flex items-center gap-3 p-2 mb-2 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">hilak2</span>
                    <span className="text-sm text-gray-500">hilak@gmail.com</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Sync To Calendar</span>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Turn On Notification</span>
                    </div>
                    <Switch />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/shipping" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Shipping Address</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>My Wish List</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/style-guide" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <span>Style Guide</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      <span>Update Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hover:text-netflix-accent">
              <User size={24} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};