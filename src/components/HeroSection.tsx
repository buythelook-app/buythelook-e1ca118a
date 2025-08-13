
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
    <div className="relative h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050')] bg-cover bg-center filter grayscale">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/70 to-transparent" />
        
        {/* Animated floating elements */}
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute rounded-full bg-purple-500/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              x: [0, Math.random() * 50 - 25],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="relative h-full flex items-center"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            variants={childVariants}
          >
            Your Personal Style,<br />
            <motion.span 
              className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "mirror" 
              }}
            >
              Curated
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-8 max-w-xl text-gray-200"
            variants={childVariants}
          >
            Discover personalized looks that match your style, occasion, and budget.
            Let our AI stylist create the perfect outfit for you.
          </motion.p>
          
          <motion.div variants={childVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="lg"
                onClick={() => navigate('/quiz')}
              >
                Take Style Quiz
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
