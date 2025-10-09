
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LookCanvas } from "@/components/LookCanvas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { OutfitItem } from "@/types/outfitAgentTypes";

interface OutfitAgentCardProps {
  agentName: string;
  score?: number;
  items: OutfitItem[];
  details: Record<string, string>;
  showImagePaths?: boolean;
  // Adding the missing props
  onApprove?: (agentName: string, feedback?: string) => void;
  onReject?: (agentName: string, feedback?: string) => void;
  onLike?: (agentName: string, liked: boolean) => void;
  isLiked?: boolean;
  feedback?: string;
  showFeedbackInput?: boolean;
  feedbackValue?: string;
  onFeedbackChange?: (value: string) => void;
  onFeedbackSubmit?: () => void;
}

export function OutfitAgentCard({ 
  agentName, 
  score, 
  items, 
  details, 
  showImagePaths = false,
  onApprove,
  onReject,
  onLike,
  isLiked,
  feedback,
  showFeedbackInput,
  feedbackValue,
  onFeedbackChange,
  onFeedbackSubmit
}: OutfitAgentCardProps) {
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
      <CardFooter className="bg-gray-50 flex-col pt-3 pb-3">
        <div className="text-sm text-gray-500 w-full mb-3">
          {Object.entries(details).map(([key, value], i) => (
            <span key={i} className="mr-2">
              {key}: {value}
            </span>
          ))}
        </div>
        
        {/* Render feedback and action buttons only if handlers are provided */}
        {(onApprove || onReject || onLike) && (
          <div className="flex flex-col w-full gap-2">
            {feedback && (
              <div className="text-sm italic bg-gray-100 p-2 rounded">
                Feedback: {feedback}
              </div>
            )}
            
            <div className="flex justify-between">
              <div className="space-x-2">
                {onApprove && (
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => onApprove(agentName)}
                  >
                    Approve
                  </Button>
                )}
                
                {onReject && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onReject(agentName)}
                  >
                    Reject
                  </Button>
                )}
              </div>
              
              {onLike && (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={isLiked === true ? "default" : "outline"} 
                    className="p-1 h-8 w-8"
                    onClick={() => onLike(agentName, true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={isLiked === false ? "default" : "outline"} 
                    className="p-1 h-8 w-8"
                    onClick={() => onLike(agentName, false)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Feedback input for dislikes */}
            {showFeedbackInput && onFeedbackChange && onFeedbackSubmit && (
              <div className="w-full space-y-2 mt-2">
                <textarea
                  value={feedbackValue || ''}
                  onChange={(e) => onFeedbackChange(e.target.value)}
                  placeholder="מה לא טוב בהתאמה? (צבעים, סגנון, גזרה...)"
                  className="w-full p-2 border rounded-md text-sm min-h-[80px] resize-none"
                  dir="rtl"
                />
                <Button 
                  size="sm"
                  className="w-full" 
                  onClick={onFeedbackSubmit}
                >
                  שלח משוב
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
