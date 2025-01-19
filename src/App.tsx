import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { StyleQuiz } from "@/components/StyleQuiz";
import { LookSuggestions } from "@/components/LookSuggestions";
import { LookDetail } from "@/components/LookDetail";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Auth } from "@/pages/Auth";
import { Entrance } from "@/pages/Entrance";
import { Cart } from "@/components/Cart";
import { Profile } from "@/components/Profile";
import { Orders } from "@/components/Orders";
import { WishList } from "@/components/WishList";
import { StyleGuide } from "@/components/StyleGuide";
import { AboutApp } from "@/components/AboutApp";
import { OurRules } from "@/components/OurRules";
import { MyList } from "@/components/MyList";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Entrance />} />
            <Route path="/home" element={<Index />} />
            <Route path="/quiz" element={<StyleQuiz />} />
            <Route path="/suggestions" element={<LookSuggestions />} />
            <Route path="/look/:id" element={<LookDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
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