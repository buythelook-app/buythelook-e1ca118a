
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.8 
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden bg-fashion-light">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-fashion-light via-fashion-neutral/20 to-fashion-secondary" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>
      
      <motion.div 
        className="relative h-full flex items-center min-h-[85vh]"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={childVariants} className="mb-4">
              <span className="inline-block px-4 py-2 bg-fashion-accent/10 text-fashion-accent text-sm font-medium rounded-full border border-fashion-accent/20">
                AI-Powered Personal Styling
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 text-fashion-dark leading-tight"
              variants={childVariants}
            >
              Your Personal
              <span className="block font-medium text-fashion-accent">
                Style Curator
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-fashion-muted leading-relaxed"
              variants={childVariants}
            >
              Discover perfectly curated outfits that match your unique style, lifestyle, and occasions. 
              Our AI stylist learns your preferences to create personalized looks just for you.
            </motion.p>
            
            <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="bg-fashion-accent hover:bg-fashion-accent/90 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/quiz')}
                >
                  Discover Your Style
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  className="border-fashion-muted text-fashion-muted hover:bg-fashion-muted hover:text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
                  onClick={() => navigate('/looks')}
                >
                  Browse Looks
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div variants={childVariants} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-fashion-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-fashion-accent text-xl">✨</span>
                </div>
                <h3 className="font-medium text-fashion-dark mb-2">Personalized</h3>
                <p className="text-fashion-muted text-sm">Tailored to your unique style and preferences</p>
              </div>
              
              <div className="p-6">
                <div className="w-12 h-12 bg-fashion-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-fashion-accent text-xl">🎯</span>
                </div>
                <h3 className="font-medium text-fashion-dark mb-2">Occasion-Ready</h3>
                <p className="text-fashion-muted text-sm">Perfect looks for work, casual, and special events</p>
              </div>
              
              <div className="p-6">
                <div className="w-12 h-12 bg-fashion-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-fashion-accent text-xl">🛍️</span>
                </div>
                <h3 className="font-medium text-fashion-dark mb-2">Curated</h3>
                <p className="text-fashion-muted text-sm">Hand-picked items that work beautifully together</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
