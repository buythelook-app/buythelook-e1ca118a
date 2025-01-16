import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { StyleQuiz } from "@/components/StyleQuiz";
import { LookSuggestions } from "@/components/LookSuggestions";
import { LookDetail } from "@/components/LookDetail";
import { BudgetSelection } from "@/components/BudgetSelection";
import { MoodSelection } from "@/components/MoodSelection";
import { EventSelection } from "@/components/EventSelection";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Auth } from "@/pages/Auth";
import { Entrance } from "@/pages/Entrance";
import { Cart } from "@/components/Cart";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/budget" element={<BudgetSelection />} />
          <Route path="/mood" element={<MoodSelection />} />
          <Route path="/event" element={<EventSelection />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;