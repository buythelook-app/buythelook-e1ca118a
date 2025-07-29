
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { DeveloperNav } from "@/components/DeveloperNav";
import { ErrorBoundary } from "@/utils/errorBoundary";
import AgentResultsPage from './pages/AgentResultsPage';
import FeedbackManagementPage from './pages/FeedbackManagementPage';
import AgentLearningDashboard from './pages/AgentLearningDashboard';
import CronStatusPage from './pages/CronStatusPage';
import AgentDebugPage from './pages/AgentDebugPage';
import Index from './pages/Index';
import { Auth } from './pages/Auth';
import { Entrance } from './pages/Entrance';
import { PasswordRecovery } from './pages/PasswordRecovery';
import OutfitGenerationPage from './pages/OutfitGenerationPage';
import RecommendationTest from './pages/RecommendationTest';
import AgentSimulationPage from './pages/AgentSimulationPage';
import AgentTrainingPage from './pages/AgentTrainingPage';
import AIImageAnalysisPage from './pages/AIImageAnalysisPage';
import { StyleQuiz } from './components/StyleQuiz';
import { Cart } from './components/Cart';
import { MyList } from './components/MyList';
import { Checkout } from './components/Checkout';
import { Profile } from './components/Profile';
import { Orders } from './components/Orders';
import { Contact } from './components/Contact';
import { FAQ } from './components/FAQ';
import { AboutApp } from './components/AboutApp';
import { OurRules } from './components/OurRules';
import { StyleGuide } from './components/StyleGuide';
import { DeveloperTools } from './components/DeveloperTools';
import { LookSuggestions } from './components/LookSuggestions';

// Create QueryClient instance with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <Routes>
            {/* Main pages */}
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            <Route path="/landing" element={<Entrance />} />
            <Route path="/entrance" element={<Entrance />} />
            
            {/* Authentication */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            
            {/* User features */}
            <Route path="/quiz" element={<StyleQuiz />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/suggestions" element={<LookSuggestions />} />
            
            {/* User account */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            
            {/* Information pages */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<AboutApp />} />
            <Route path="/rules" element={<OurRules />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            
            {/* Developer and testing pages */}
            <Route path="/dev" element={<DeveloperTools />} />
            <Route path="/agent-results" element={<AgentResultsPage />} />
            <Route path="/feedback-management" element={<FeedbackManagementPage />} />
            <Route path="/agent-learning-dashboard" element={<AgentLearningDashboard />} />
            <Route path="/cron-status" element={<CronStatusPage />} />
            <Route path="/agent-debug" element={<AgentDebugPage />} />
            <Route path="/outfit-generation" element={<OutfitGenerationPage />} />
            <Route path="/test/recommendation" element={<RecommendationTest />} />
            <Route path="/agent-simulation" element={<AgentSimulationPage />} />
            <Route path="/agent-training" element={<AgentTrainingPage />} />
            <Route path="/ai-image-analysis" element={<AIImageAnalysisPage />} />
          </Routes>
          <Toaster />
        </Router>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
