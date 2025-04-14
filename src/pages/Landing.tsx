
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Zap, CheckCircle, Heart, ThumbsUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";

export const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text">
      <LandingNav />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/80 to-transparent" />
        </div>
        
        <motion.div 
          className="container mx-auto px-4 z-10 text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerChildren}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            variants={fadeInUpVariants}
          >
            Discover Your Perfect Style
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            variants={fadeInUpVariants}
          >
            AI-powered fashion recommendations tailored to your body structure, mood, and personal style.
          </motion.p>
          
          <motion.div variants={fadeInUpVariants}>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-full"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Get Started Now
            </Button>
            
            <div className="mt-16">
              <motion.button
                onClick={scrollToFeatures}
                className="text-white/80 hover:text-white flex flex-col items-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mb-2">Learn more</span>
                <ChevronDown className="animate-bounce" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-netflix-background to-netflix-card">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How <span className="text-netflix-accent">Buy the Look</span> Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Zap className="h-10 w-10 text-purple-400" />,
                title: "AI-Powered Style Analysis",
                description: "Our advanced algorithms analyze your body structure and preferences to create personalized outfit recommendations."
              },
              {
                icon: <Heart className="h-10 w-10 text-pink-400" />,
                title: "Mood-Based Recommendations",
                description: "Select your mood and preferred style to get curated outfit suggestions that match exactly how you want to feel."
              },
              {
                icon: <Calendar className="h-10 w-10 text-blue-400" />,
                title: "Occasion-Specific Outfits",
                description: "Whether it's work, a date night, or casual weekend plans, we'll suggest the perfect outfit for any occasion."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-netflix-card/50 backdrop-blur-sm rounded-xl p-8 border border-white/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(139, 92, 246, 0.3)" }}
              >
                <div className="mb-5">{feature.icon}</div>
                <h3 className="text-2xl font-display font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-netflix-card">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Your Style Journey
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Take Style Quiz",
                description: "Answer a few questions about your body structure, mood, and style preferences."
              },
              {
                step: "02",
                title: "Get Recommendations",
                description: "Receive AI-generated outfit suggestions personalized just for you."
              },
              {
                step: "03",
                title: "Browse Options",
                description: "Explore different looks with complete outfit details and color palettes."
              },
              {
                step: "04",
                title: "Buy the Look",
                description: "Purchase the entire outfit with one click or save it for later."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-netflix-accent">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full max-w-[50px] h-[2px] bg-gradient-to-r from-netflix-accent to-transparent transform -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Body Types Section */}
      <section className="py-20 bg-netflix-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row gap-10 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="md:w-1/2">
              <h2 className="text-4xl font-display font-bold mb-6">Personalized for Your Body Structure</h2>
              <p className="text-xl text-gray-300 mb-8">
                We analyze your unique body structure to suggest outfits that flatter your specific shape.
                Whether you have an X, V, H, O, or A body type, our AI understands what works best for you.
              </p>
              
              <ul className="space-y-4">
                {["Emphasize your best features", "Hide areas you're less confident about", "Create balanced silhouettes", "Recommend flattering color combinations"].map((item, i) => (
                  <motion.li 
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <CheckCircle className="text-green-500 h-6 w-6 shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={() => navigate('/quiz')}
                  className="bg-netflix-accent hover:bg-netflix-accent/90"
                  size="lg"
                >
                  Find Your Body Type
                </Button>
              </motion.div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d" 
                  alt="Body type analysis" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-background to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                  <span className="bg-netflix-accent/80 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                    AI-Powered Style Analysis
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-netflix-card">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What Our Users Say
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Buy the Look completely changed my shopping experience. I used to spend hours figuring out what suits my body type, but now I get perfect recommendations instantly.",
                name: "Sarah K.",
                role: "X-Type Body"
              },
              {
                text: "The mood-based outfit suggestions are spot on! Whether I'm feeling elegant, casual or energized, the AI always creates the perfect look for me.",
                name: "Michael T.",
                role: "V-Type Body"
              },
              {
                text: "As someone with an H-shaped body, finding flattering clothes has always been challenging. This app understands exactly what works for my shape.",
                name: "Jennifer L.",
                role: "H-Type Body"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-netflix-background/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="absolute -top-4 -left-4 text-netflix-accent">
                  <ThumbsUp className="h-8 w-8" />
                </div>
                <p className="mb-6 text-gray-300">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-netflix-accent text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-black to-netflix-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612336307429-8a898d10e223')] bg-cover bg-center opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Transform Your Style?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of users who have discovered their perfect look with our AI-powered fashion recommendations.
            </p>
            
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-6 text-lg rounded-full"
              size="lg"
            >
              Get Started for Free
            </Button>
            
            <p className="mt-6 text-sm text-gray-400">
              No credit card required • Free personalized style quiz
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-display text-netflix-accent">Buy the Look</h2>
              <p className="text-sm text-gray-400 mt-2">© 2025 • AI-Powered Fashion Recommendation</p>
            </div>
            
            <div className="flex gap-8">
              <a href="#" onClick={() => navigate('/about')} className="text-gray-400 hover:text-netflix-accent">About</a>
              <a href="#" onClick={() => navigate('/faq')} className="text-gray-400 hover:text-netflix-accent">FAQ</a>
              <a href="#" onClick={() => navigate('/contact')} className="text-gray-400 hover:text-netflix-accent">Contact</a>
              <a href="#" onClick={() => navigate('/rules')} className="text-gray-400 hover:text-netflix-accent">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
