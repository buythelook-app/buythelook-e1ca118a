import React from "react";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizProgress = ({ currentStep, totalSteps }: QuizProgressProps) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-fashion-dark mb-2">Style Discovery</h1>
          <p className="text-fashion-muted">Help us understand your unique style preferences</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-fashion-muted">Step</p>
          <p className="text-lg font-medium text-fashion-accent">{currentStep} of {totalSteps}</p>
        </div>
      </div>
      <div className="w-full bg-fashion-neutral rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-fashion-accent to-fashion-accent/80 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};