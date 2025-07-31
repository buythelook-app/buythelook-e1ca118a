import React from "react";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizProgress = ({ currentStep, totalSteps }: QuizProgressProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-display font-bold">Style Quiz</h1>
        <p className="text-netflix-accent">Step {currentStep} of {totalSteps}</p>
      </div>
      <div className="w-full bg-netflix-background rounded-full h-2">
        <div
          className="bg-netflix-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};