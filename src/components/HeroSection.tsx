
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
        staggerChildren: 0.4,
        duration: 1 
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1,
        ease: "easeOut"
      } 
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "backOut",
        delay: 0.3
      } 
    }
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
        className="relative h-full flex items-end pb-20"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            variants={titleVariants}
          >
            Your Personal Style,<br />
            <motion.span 
              className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -50 }}
              animate={{ 
                opacity: 1,
                x: 0,
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.5 },
                x: { duration: 0.8, delay: 0.5, ease: "easeOut" },
                backgroundPosition: { 
                  duration: 5, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.3
                }
              }}
            >
              Curated
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-8 max-w-xl mx-auto text-gray-200"
            variants={childVariants}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            Discover personalized looks that match your style, occasion, and budget.
            Let our AI stylist create the perfect outfit for you.
          </motion.p>
          
          <motion.div 
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative"
            >
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur-lg opacity-90 animate-pulse"></div>
              
              <Button 
                className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 shadow-2xl border-2 border-white/20 backdrop-blur-sm"
                size="lg"
                onClick={() => navigate('/quiz')}
              >
                Take Style Quiz Now!
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
