import { Link } from "react-router-dom";
import { UserDropdownMenu } from "./navbar/UserDropdownMenu";
import { useCalendarSync } from "./navbar/CalendarSync";
import { LayoutDashboard, ShoppingBag, Calendar, Settings } from "lucide-react";

export const Navbar = () => {
  const { handleCalendarSync } = useCalendarSync();

  const handleAddressClick = () => {
    // Handle address click
    console.log("Address clicked");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold">
              Fashion App
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/look-suggestions" 
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Suggestions</span>
              </Link>
              <Link 
                to="/calendar" 
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserDropdownMenu 
              onAddressClick={handleAddressClick}
              handleCalendarSync={handleCalendarSync}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};