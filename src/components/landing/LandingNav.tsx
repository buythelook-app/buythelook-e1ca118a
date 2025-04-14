
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const LandingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-display text-netflix-accent">Buy the Look</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
          <a href="#" onClick={() => navigate('/faq')} className="text-gray-300 hover:text-white transition-colors">FAQ</a>
          <a href="#" onClick={() => navigate('/about')} className="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="#" onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex text-white" 
            onClick={() => navigate('/auth?mode=signin')}
          >
            Sign In
          </Button>
          <Button 
            className="bg-netflix-accent hover:bg-netflix-accent/80" 
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
