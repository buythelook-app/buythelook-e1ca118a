
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

export const Entrance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline"
          className="border-purple-500 text-purple-500 hover:bg-purple-500/10 font-bold"
          onClick={handleSaveForLater}
        >
          <Clock className="mr-2 h-4 w-4" />
          Complete Your Answers
        </Button>
      </div>
      
      <HeroSection />
      
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Your Personal Stylist, Powered by AI
        </motion.h2>
        
        <motion.div 
          className="flex flex-col md:flex-row gap-4 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button 
            className="flex-1 bg-netflix-accent text-white py-6 font-bold"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 border-netflix-accent text-netflix-accent hover:bg-netflix-accent/10 py-6 font-bold"
            onClick={() => navigate('/quiz')}
          >
            Try the Quiz
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 border-purple-500 text-purple-500 hover:bg-purple-500/10 py-6 font-bold"
            onClick={handleSaveForLater}
          >
            <Clock className="mr-2 h-4 w-4" />
            Complete Your Answers
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
