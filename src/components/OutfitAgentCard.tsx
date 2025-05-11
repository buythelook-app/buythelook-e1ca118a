
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LookCanvas } from "@/components/LookCanvas";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
}

interface OutfitAgentCardProps {
  agentName: string;
  score?: number;
  items: OutfitItem[];
  details?: Record<string, string>;
}

export function OutfitAgentCard({ agentName, score, items, details }: OutfitAgentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-50 pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>{agentName}</span>
          {score !== undefined && (
            <Badge variant={score > 80 ? "default" : "outline"} className="ml-2">
              Score: {score}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length > 0 ? (
          <div className="bg-white rounded-md overflow-hidden">
            <LookCanvas items={items} width={300} height={480} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
            <p className="text-gray-500">No outfit items available</p>
          </div>
        )}
      </CardContent>
      {details && Object.keys(details).length > 0 && (
        <CardFooter className="bg-gray-50 flex flex-wrap gap-1 text-xs text-gray-600">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="px-2 py-1 bg-white rounded border">
              <span className="font-medium">{key}:</span> {value}
            </div>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
