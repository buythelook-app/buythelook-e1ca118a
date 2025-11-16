import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FashionRecommendations } from "@/components/FashionRecommendations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PremiumLookUpgrade } from "@/components/PremiumLookUpgrade";
import { usePremiumLookPass } from "@/hooks/usePremiumLookPass";

export default function FashionResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { passData } = usePremiumLookPass();
  const [showPremiumLook, setShowPremiumLook] = useState(false);
  
  // Get parameters from URL or localStorage
  const [params, setParams] = useState({
    eventType: '',
    style: '',  
    budget: '',
    gender: 'women' as 'women' | 'men'
  });

  useEffect(() => {
    // Try to get from URL params first
    const urlEventType = searchParams.get('eventType');
    const urlStyle = searchParams.get('style'); 
    const urlBudget = searchParams.get('budget');
    const urlGender = searchParams.get('gender') as 'women' | 'men';

    if (urlEventType && urlStyle && urlBudget) {
      setParams({
        eventType: urlEventType,
        style: urlStyle,
        budget: urlBudget,
        gender: urlGender || 'women'
      });
    } else {
      // Fallback to localStorage (quiz results)
      const savedQuizData = localStorage.getItem('quizData');
      if (savedQuizData) {
        try {
          const quizData = JSON.parse(savedQuizData);
          setParams({
            eventType: quizData.eventType || 'casual',
            style: quizData.style || 'classic',
            budget: quizData.budget || 'medium', 
            gender: quizData.gender || 'women'
          });
        } catch (error) {
          console.error('Error parsing quiz data:', error);
          // Redirect to quiz if no valid data
          navigate('/quiz');
        }
      } else {
        // No data available, redirect to quiz
        navigate('/quiz');
      }
    }
  }, [searchParams, navigate]);

  if (!params.eventType || !params.style || !params.budget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-fashion-glass rounded-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 fashion-hero-text">Complete Your Style Quiz First</h2>
            <p className="text-muted-foreground mb-6">
              We need your style preferences to show personalized recommendations.
            </p>
            <Button onClick={() => navigate('/quiz')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-all duration-300 fashion-glow">
              Take Style Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navbar />
      
      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Fashion Recommendations</h1>
              <p className="text-lg opacity-90">
                Personalized picks based on your style quiz results
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/quiz')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Basic Look */}
        <div>
          <FashionRecommendations 
            eventType={params.eventType}
            style={params.style}
            budget={params.budget}
            gender={params.gender}
            mode="basic"
          />
        </div>

        {/* Premium Upgrade CTA */}
        {!passData.hasPremiumLook && !showPremiumLook && (
          <PremiumLookUpgrade 
            onUpgradeComplete={() => setShowPremiumLook(true)}
          />
        )}

        {/* Premium Look */}
        {(passData.hasPremiumLook || showPremiumLook) && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg p-4 text-center">
              <p className="font-semibold text-green-700 dark:text-green-400">
                ✓ Upgrade complete! Your premium look is ready ↓
              </p>
            </div>
            
            <div className="border-2 border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Your Premium Look
              </h2>
              <FashionRecommendations 
                eventType={params.eventType}
                style={params.style}
                budget={params.budget}
                gender={params.gender}
                mode="premium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}