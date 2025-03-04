
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Clock, MousePointerClick, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax effect values
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

  const handleSaveForLater = () => {
    // Get existing quiz data or create a placeholder
    const savedData = localStorage.getItem('quizData');
    if (!savedData) {
      localStorage.setItem('quizData', JSON.stringify({
        gender: "",
        height: "",
        weight: "",
        waist: "",
        chest: "",
        bodyShape: "",
        photo: null,
        colorPreferences: [],
        stylePreferences: [],
      }));
    }
    
    toast({
      title: "Quiz scheduled for later",
      description: "You can take the quiz at your convenience later.",
    });
    
    navigate('/home');
  };

  // Interactive floating elements with mouse follow effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-[90vh] w-full overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050')] bg-cover bg-center"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/70 to-transparent" />
        
        {/* Animated floating elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(2px)",
              x: mousePosition.x * 0.02 * (i % 3 - 1),
              y: mousePosition.y * 0.02 * (i % 3 - 1),
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>
      
      <motion.div 
        className="relative h-full flex items-center"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        style={{ y: textY, opacity }}
      >
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold mb-4"
            variants={childVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Your Personal Style,
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent inline-block"
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
            <motion.span
              className="inline-block ml-2"
              animate={{ 
                rotate: [0, 10, 0], 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              <Sparkles className="h-10 w-10 text-yellow-400" />
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-8 max-w-xl text-gray-200 leading-relaxed"
            variants={childVariants}
          >
            Discover personalized looks that match your style, occasion, and budget.
            Let our AI stylist create the perfect outfit for you.
          </motion.p>
          
          <motion.div variants={childVariants} className="flex gap-4">
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white overflow-hidden group relative"
                size="lg"
                onClick={() => navigate('/quiz')}
              >
                <span className="relative z-10 flex items-center">
                  <MousePointerClick className="mr-2 h-4 w-4 group-hover:animate-ping" />
                  Take Style Quiz
                </span>
                <motion.div 
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline"
                size="lg"
                onClick={handleSaveForLater}
                className="border-purple-500 text-purple-500 hover:bg-purple-500/10 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  <Clock className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Complete Your Answers
                </span>
                <motion.div 
                  className="absolute inset-0 -z-10 bg-purple-500/10"
                  initial={{ y: "100%" }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Scrolling indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="w-8 h-14 rounded-full border-2 border-white/30 flex justify-center items-start p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-1.5 h-3 bg-white/50 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
