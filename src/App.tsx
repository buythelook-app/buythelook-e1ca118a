
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgentResultsPage from './pages/AgentResultsPage';
import CronStatusPage from './pages/CronStatusPage';
import AgentDebugPage from './pages/AgentDebugPage';

// Create QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<AgentResultsPage />} />
            <Route path="/agent-results" element={<AgentResultsPage />} />
            <Route path="/cron-status" element={<CronStatusPage />} />
            <Route path="/agent-debug" element={<AgentDebugPage />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
