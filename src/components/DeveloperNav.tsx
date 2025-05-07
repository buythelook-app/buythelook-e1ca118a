
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DeveloperNav = () => {
  const navigate = useNavigate();

  const routes = [
    { path: "/", label: "Root" },
    { path: "/entrance", label: "Entrance" },
    { path: "/home", label: "Home" },
    { path: "/landing", label: "Landing" },
    { path: "/quiz", label: "Style Quiz" },
    { path: "/suggestions", label: "Look Suggestions" },
    { path: "/faq", label: "FAQ" },
    { path: "/contact", label: "Contact" },
    { path: "/auth", label: "Auth" },
    { path: "/reset-password", label: "Password Recovery" },
    { path: "/cart", label: "Cart" },
    { path: "/checkout", label: "Checkout" },
    { path: "/profile", label: "Profile" },
    { path: "/orders", label: "Orders" },
    { path: "/wishlist", label: "Wishlist" },
    { path: "/style-guide", label: "Style Guide" },
    { path: "/about", label: "About" },
    { path: "/rules", label: "Rules" },
    { path: "/my-list", label: "My List" },
    { path: "/dev", label: "Developer Tools" },
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
            <Menu className="h-4 w-4 mr-2" />
            Dev Navigation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Available Routes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {routes.map((route) => (
            <DropdownMenuItem
              key={route.path}
              onClick={() => navigate(route.path)}
              className="cursor-pointer"
            >
              {route.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
