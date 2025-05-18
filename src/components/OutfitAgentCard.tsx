
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LookCanvas } from "@/components/LookCanvas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OutfitItem } from "@/types/outfitAgentTypes";

interface OutfitAgentCardProps {
  agentName: string;
  score?: number;
  items: OutfitItem[];
  details: Record<string, string>;
  showImagePaths?: boolean;
}

export function OutfitAgentCard({ agentName, score, items, details, showImagePaths = false }: OutfitAgentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex justify-between items-center">
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
            {showImagePaths && (
              <div className="bg-gray-50 p-2 text-xs text-gray-500 mt-2 rounded">
                <p className="font-semibold mb-1">Image Paths:</p>
                {items.map((item, i) => (
                  <div key={i} className="truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{item.type}: {item.image.substring(0, 30)}...</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{item.image}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
            <p className="text-gray-500">No outfit items available</p>
          </div>
        )}
      </CardContent>
      {Object.keys(details).length > 0 && (
        <CardFooter className="bg-gray-50 pt-3 pb-3">
          <div className="text-sm text-gray-500">
            {Object.entries(details).map(([key, value], i) => (
              <span key={i} className="mr-2">
                {key}: {value}
              </span>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
