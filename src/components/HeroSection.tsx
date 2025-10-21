
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Heart, ArrowRight } from "lucide-react";
import fashionHeroBg from "@/assets/fashion-hero-bg.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Dynamic fashion background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img 
          src={fashionHeroBg} 
          alt="Fashion background" 
          className="w-full h-full object-cover"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-fashion-neutral-dark/80 via-blue-900/70 to-indigo-900/60"></div>
      </div>

      {/* Animated overlay elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-fashion-accent/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fashion-primary/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Glass morphism container */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-[0.95]">
            Say more
            <span className="block fashion-hero-text">
              through style
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto leading-relaxed mb-8">
            Meet your personal AI fashion agent. Chat to discover looks that speak your language.
          </p>
          <div className="bg-fashion-glass rounded-full px-6 py-2 inline-block border border-white/20">
            <span className="text-white/90 text-sm font-medium">✨ Try the beta now</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button
            onClick={() => navigate('/quiz')}
            size="lg"
            className="bg-white text-fashion-neutral-dark hover:bg-white/90 font-semibold px-10 py-5 text-lg rounded-full shadow-2xl fashion-glow transition-all duration-500 group border-0"
          >
            <Sparkles className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Start Your Style Journey
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Floating feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <motion.div 
            className="bg-fashion-glass rounded-3xl p-8 border border-white/20 fashion-card-hover"
            whileHover={{ y: -5 }}
          >
            <TrendingUp className="h-10 w-10 text-fashion-accent mb-4 mx-auto" />
            <h3 className="font-semibold text-white mb-3 text-lg">Style Intelligence</h3>
            <p className="text-white/70 text-sm leading-relaxed">AI that understands your preferences and suggests looks that feel authentically you</p>
          </motion.div>
          
          <motion.div 
            className="bg-fashion-glass rounded-3xl p-8 border border-white/20 fashion-card-hover"
            whileHover={{ y: -5 }}
          >
            <Sparkles className="h-10 w-10 text-fashion-accent mb-4 mx-auto" />
            <h3 className="font-semibold text-white mb-3 text-lg">Personalized Curation</h3>
            <p className="text-white/70 text-sm leading-relaxed">Every recommendation is tailored to your body type, lifestyle, and aesthetic vision</p>
          </motion.div>
          
          <motion.div 
            className="bg-fashion-glass rounded-3xl p-8 border border-white/20 fashion-card-hover"
            whileHover={{ y: -5 }}
          >
            <Heart className="h-10 w-10 text-fashion-accent mb-4 mx-auto" />
            <h3 className="font-semibold text-white mb-3 text-lg">Effortless Discovery</h3>
            <p className="text-white/70 text-sm leading-relaxed">Find your perfect look through natural conversation, no complex filters needed</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
