
import React from "react";

export const AuthLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-white">Authenticating...</p>
      </div>
    </div>
  );
};
