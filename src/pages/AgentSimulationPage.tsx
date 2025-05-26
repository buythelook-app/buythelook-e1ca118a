
import { AgentSimulationRunner } from "@/components/AgentSimulationRunner";

export default function AgentSimulationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">סימולציית אייג'נטי אופנה</h1>
        <p className="text-gray-600 text-lg">
          הרץ את האייג'נטים כדי ליצור סטי לבוש חדשים עם הנתונים המעודכנים
        </p>
      </div>
      
      <AgentSimulationRunner />
    </div>
  );
}
