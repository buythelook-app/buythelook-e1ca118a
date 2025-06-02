

import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "./components/Profile";
import { Cart } from "./components/Cart";
import { StyleGuide } from "./components/StyleGuide";
import { LookDetail } from "./components/LookDetail";
import { Checkout } from "./components/Checkout";
import { ShippingAddress } from "./components/ShippingAddress";
import { Orders } from "./components/Orders";
import { WishList } from "./components/WishList";
import { MyList } from "./components/MyList";
import { Contact } from "./components/Contact";
import { FAQ } from "./components/FAQ";
import { AboutApp } from "./components/AboutApp";
import { OurRules } from "./components/OurRules";
import { StyleQuiz } from "./components/StyleQuiz";
import { PersonalizedLooksPage } from "./pages/PersonalizedLooksPage";
import AgentSimulationPage from "./pages/AgentSimulationPage";
import { DeveloperTools } from "./components/DeveloperTools";
import AgentTrainingPage from "./pages/AgentTrainingPage";

// Create placeholder components for missing pages
const AuthPage = () => <div>Auth Page</div>;
const HomePage = () => <div>Home Page</div>;

// Wrapper component for ShippingAddress to handle standalone page usage
const ShippingAddressPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ShippingAddress 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
};

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          <Route path="/looks/:id" element={<LookDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shipping" element={<ShippingAddressPage />} />
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

