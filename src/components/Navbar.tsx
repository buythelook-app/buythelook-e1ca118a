import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
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
          <Link to="/auth" className="hover:text-netflix-accent">
            <User size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
};