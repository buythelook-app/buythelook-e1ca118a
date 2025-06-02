import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./lib/supabaseClient";
import { Profile } from "./pages/Profile";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { Cart } from "./pages/Cart";
import { StyleGuide } from "./pages/StyleGuide";
import { LookDetail } from "./pages/LookDetail";
import { Checkout } from "./pages/Checkout";
import { ShippingAddress } from "./pages/ShippingAddress";
import { Orders } from "./pages/Orders";
import { WishList } from "./pages/WishList";
import { MyList } from "./pages/MyList";
import { Contact } from "./pages/Contact";
import { FAQ } from "./pages/FAQ";
import { AboutApp } from "./pages/AboutApp";
import { OurRules } from "./pages/OurRules";
import { StyleQuiz } from "./pages/StyleQuiz";
import { PersonalizedLooksPage } from "./pages/PersonalizedLooksPage";
import { AgentSimulationPage } from "./pages/AgentSimulationPage";
import { DeveloperTools } from "./components/DeveloperTools";
import AgentTrainingPage from "./pages/AgentTrainingPage";

const App = () => {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          <Route path="/looks/:id" element={<LookDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shipping" element={<ShippingAddress />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<AboutApp />} />
          <Route path="/our-rules" element={<OurRules />} />
          <Route path="/style-quiz" element={<StyleQuiz />} />
          <Route path="/personalized-looks" element={<PersonalizedLooksPage />} />
          <Route path="/agent-simulation" element={<AgentSimulationPage />} />
          <Route path="/agent-training" element={<AgentTrainingPage />} />
          <Route path="/developer-tools" element={<DeveloperTools />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
