import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import './capacitor-shim';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("App component rendering");

  // Add global listener for deep links - this ensures we catch auth redirects
  useEffect(() => {
    console.log("Setting up global deep link listener");
    
    const setupAppUrlListener = async () => {
      try {
        if (window.Capacitor?.isNativePlatform?.()) {
          console.log("Platform is native, setting up app URL listener");
          
          if (window.App?.addListener) {
            window.App.addListener('appUrlOpen', async ({ url }) => {
              console.log('App opened with URL:', url);
              
              if (url.includes('auth') || url.includes('callback')) {
                console.log('Auth callback URL detected, checking session');
                
                try {
                  // This will handle the token in the URL automatically
                  const { data, error } = await supabase.auth.getSession();
                  
                  if (error) {
                    console.error('Session retrieval error:', error);
                  } else if (data.session) {
                    console.log('Session established after redirect:', data.session.user?.id);
                    // No redirection here, let the useAuthFlow handle it
                  } else {
                    console.log('No session found after URL open');
                  }
                } catch (err) {
                  console.error('Error handling auth callback:', err);
                }
              }
            });
            
            console.log("App URL listener setup complete");
          } else {
            console.warn("window.App.addListener not available");
          }
        } else {
          console.log("Not running on native platform, skipping app URL listener");
        }
      } catch (error) {
        console.error("Error setting up app URL listener:", error);
      }
    };
    
    setupAppUrlListener();
    
    return () => {
      // Cleanup - not removing the listener as Capacitor doesn't support that well
      console.log("App component unmounting");
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Index />} />
            <Route path="/quiz" element={<StyleQuiz />} />
            <Route path="/suggestions" element={<LookSuggestions />} />
            <Route path="/look/:id" element={<LookDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            <Route path="/about" element={<AboutApp />} />
            <Route path="/rules" element={<OurRules />} />
            <Route path="/my-list" element={<MyList />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
