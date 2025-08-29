
import React from "react";
import { Link, useLocation } from "react-router-dom";
import AgentResultsButton from "./AgentResultsButton";

export function DeveloperNav() {
  const location = useLocation();
  
  // Don't show nav on certain pages
  if (location.pathname === "/auth" || location.pathname === "/entrance") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-purple-800 py-1 px-4 flex items-center justify-between text-white text-xs">
      <div className="flex items-center space-x-2">
        <Link to="/home" className="hover:underline">Home</Link>
        <Link to="/dev" className="hover:underline">DevTools</Link>
        <Link to="/test/recommendation" className="hover:underline">Test Rec</Link>
        <Link to="/agent-results" className="hover:underline">Agent Results</Link>
        <Link to="/feedback-management" className="hover:underline">Feedback Mgmt</Link>
        <Link to="/agent-learning-dashboard" className="hover:underline">Learning Dashboard</Link>
        <Link to="/agent-debug" className="hover:underline">Agent Debug</Link>
        <Link to="/outfit-generation" className="hover:underline">Outfit Generation</Link>
        <Link to="/catalog-demo" className="hover:underline">Catalog Demo</Link>
      </div>
      <div>
        <span>DEV MODE</span>
      </div>
    </div>
  );
}
