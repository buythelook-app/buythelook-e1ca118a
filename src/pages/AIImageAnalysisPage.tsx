
import { AIImageAnalyzer } from "@/components/AIImageAnalyzer";
import { HomeButton } from "@/components/HomeButton";

export default function AIImageAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Image Analysis</h1>
            <p className="text-gray-600">
              Automatically detect and select the best product images without models using AI
            </p>
          </div>
          <HomeButton />
        </div>
        
        <AIImageAnalyzer />
      </div>
    </div>
  );
}
