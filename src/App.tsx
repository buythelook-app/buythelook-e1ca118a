import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { HomePage } from './pages/HomePage';
import { AgentResultsPage } from './pages/AgentResultsPage';
import { OutfitGeneratorPage } from './pages/OutfitGeneratorPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CronStatusPage } from "@/pages/CronStatusPage";

function App() {
  return (
    <QueryClient>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agent-results" element={<AgentResultsPage />} />
            <Route path="/outfit-generator" element={<OutfitGeneratorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cron-status" element={<CronStatusPage />} />
          </Routes>
        </Router>
      </div>
    </QueryClient>
  );
}

export default App;
