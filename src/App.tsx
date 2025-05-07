
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
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
