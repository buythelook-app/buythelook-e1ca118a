import React from "react";
import { Link } from "react-router-dom";

export const DeveloperNav = () => {
  return (
    <div className="bg-gray-100 border-b p-2">
      <div className="container mx-auto flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Developer Tools:</span>
        <Link to="/agent-simulation" className="text-blue-600 hover:text-blue-800 text-sm">
          Agent Simulation
        </Link>
        <Link to="/agent-training" className="text-blue-600 hover:text-blue-800 text-sm">
          Agent Training
        </Link>
        <Link to="/developer-tools" className="text-blue-600 hover:text-blue-800 text-sm">
          Tools
        </Link>
      </div>
    </div>
  );
};
