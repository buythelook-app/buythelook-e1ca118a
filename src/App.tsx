import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { StyleQuiz } from "@/components/StyleQuiz";
import { LookSuggestions } from "@/components/LookSuggestions";
import { LookDetail } from "@/components/LookDetail";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Auth } from "@/pages/Auth";
import { Entrance } from "@/pages/Entrance";
import { Cart } from "@/components/Cart";
import { Checkout } from "@/components/Checkout";
import { Profile } from "@/components/Profile";
import { Orders } from "@/components/Orders";
import { WishList } from "@/components/WishList";
import { StyleGuide } from "@/components/StyleGuide";
import { AboutApp } from "@/components/AboutApp";
import { OurRules } from "@/components/OurRules";
import { MyList } from "@/components/MyList";
import { PasswordRecovery } from "@/pages/PasswordRecovery";
import { DeveloperTools } from "@/components/DeveloperTools";
import { DeveloperNav } from "@/components/DeveloperNav";
import RecommendationTest from "./pages/RecommendationTest";
import AgentResultsPage from "./pages/AgentResultsPage";
import OutfitGenerationPage from "./pages/OutfitGenerationPage";
import { testSupabaseConnection } from "./lib/supabaseConnectionTest";
import { supabaseHealth } from "./lib/supabaseHealthCheck";
import { useEffect } from "react";
import logger from "./lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Add this effect to test Supabase connection on app initialization
  useEffect(() => {
    // Set log level for verbose debugging
    logger.setLogLevel('debug');
    
    // Log Supabase client information
    supabaseHealth.logClientInfo();
    
    // Check access to critical tables
    const checkCriticalTables = async () => {
      logger.info("Checking access to critical Supabase tables", { context: "App" });
      
      // Check zara_cloth table
      const zaraClothAccess = await supabaseHealth.checkTableAccess('zara_cloth');
      logger.info(`zara_cloth table access: ${zaraClothAccess ? 'OK' : 'FAILED'}`, { context: "App" });
      
      // Check items table as fallback
      const itemsAccess = await supabaseHealth.checkTableAccess('items');
      logger.info(`items table access: ${itemsAccess ? 'OK' : 'FAILED'}`, { context: "App" });
      
      // If neither table is accessible, check data retrieval from zara_cloth with more details
      if (!zaraClothAccess && !itemsAccess) {
        const zaraClothData = await supabaseHealth.checkDataRetrieval('zara_cloth', 5);
        logger.debug("Detailed zara_cloth data check:", { 
          context: "App", 
          data: zaraClothData 
        });
      }
    };
    
    // Run comprehensive test
    testSupabaseConnection()
      .then(result => {
        if (result.success) {
          logger.info("Supabase connection test successful", {
            context: "App",
            data: result
          });
        } else {
          logger.error("Supabase connection test failed", {
            context: "App",
            data: result
          });
          // Run additional checks if main test fails
          checkCriticalTables();
        }
      })
      .catch(error => {
        logger.error("Exception during Supabase connection test", {
          context: "App",
          data: error
        });
        // Run additional checks if main test throws an exception
        checkCriticalTables();
      });
  }, []);

  console.log("App component rendering");
  const isDevelopment = import.meta.env.DEV;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          {isDevelopment && <DeveloperNav />}
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/entrance" element={<Entrance />} />
            <Route path="/home" element={<Index />} />
            <Route path="/quiz" element={<StyleQuiz />} />
            <Route path="/suggestions" element={<LookSuggestions />} />
            <Route path="/look/:id" element={<LookDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<PasswordRecovery />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            <Route path="/about" element={<AboutApp />} />
            <Route path="/rules" element={<OurRules />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/dev" element={<DeveloperTools />} />
            <Route path="/test/recommendation" element={<RecommendationTest />} />
            <Route path="/agent-results" element={<AgentResultsPage />} />
            <Route path="/outfit-generation" element={<OutfitGenerationPage />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
