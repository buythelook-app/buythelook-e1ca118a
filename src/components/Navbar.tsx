import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const isAuthenticated = false; // This should be replaced with actual auth state

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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cart" className="w-full cursor-pointer">
                    My Cart
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sign Out
                </DropdownMenuItem>
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