
import { Sparkles, Heart, ShoppingCart, User, Menu, X, Search, Bell } from "lucide-react";
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
import { Button } from "./ui/button";

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="fixed top-0 w-full z-50 transition-smooth">
      {/* Premium Glass Background */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section - Enhanced */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="group flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse-glow rounded-lg"></div>
                  <img 
                    src="/lovable-uploads/36f503f4-5335-485a-84dd-293fee3fc453.png" 
                    alt="Buy the Look" 
                    className="h-12 w-auto object-contain relative z-10 hover-lift transition-smooth"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display text-xl font-bold gradient-primary bg-clip-text text-transparent">
                    BUY THE LOOK
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">Style Meets AI</p>
                </div>
              </Link>
              
              {firstName && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    שלום, {firstName}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                <Link 
                  to="/" 
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth relative group"
                >
                  בית
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/style-guide" 
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth relative group"
                >
                  מדריך סטיילינג
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                {/* Search Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/10 text-foreground hover:text-primary relative group"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Cart */}
                <Link to="/cart" className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/10 text-foreground hover:text-primary"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {totalCartItems > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs animate-bounce-in"
                      >
                        {cartDisplayCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {isAuthenticated ? (
                  <>
                    {/* Favorites */}
                    <Link to="/my-list" className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-white/10 text-foreground hover:text-primary"
                      >
                        <Heart className="h-4 w-4" />
                        {totalLooks > 0 && (
                          <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-xs animate-bounce-in"
                          >
                            {displayCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>

                    {/* Notifications */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-white/10 text-foreground hover:text-primary relative"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    
                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-smooth"
                        >
                          {avatarUrl ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={avatarUrl} alt={firstName} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {firstName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <UserDropdownMenu 
                        onAddressClick={() => setShowShippingAddress(true)}
                        handleCalendarSync={handleCalendarSync}
                      />
                    </DropdownMenu>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button className="interactive-button gradient-primary text-primary-foreground hover-glow">
                      <User className="h-4 w-4 mr-2" />
                      התחבר
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 glass-card">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link 
                  to="/" 
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary rounded-lg hover:bg-white/5 transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  בית
                </Link>
                <Link 
                  to="/style-guide" 
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary rounded-lg hover:bg-white/5 transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  מדריך סטיילינג
                </Link>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center justify-around pt-3 border-t border-white/10">
                <Link to="/cart" className="relative" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-5 w-5" />
                    {totalCartItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-xs">
                        {cartDisplayCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to="/my-list" className="relative" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-5 w-5" />
                        {totalLooks > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-secondary text-xs">
                            {displayCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Bell className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {avatarUrl ? (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={avatarUrl} alt={firstName} />
                              <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <UserDropdownMenu 
                        onAddressClick={() => setShowShippingAddress(true)}
                        handleCalendarSync={handleCalendarSync}
                      />
                    </DropdownMenu>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="gradient-primary">
                      <User className="h-4 w-4 mr-2" />
                      התחבר
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ShippingAddress 
        isOpen={showShippingAddress} 
        onClose={() => setShowShippingAddress(false)} 
      />
    </nav>
  );
};
