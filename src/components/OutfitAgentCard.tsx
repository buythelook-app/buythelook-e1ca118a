
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MessageSquare, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

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
  onApprove?: (agentName: string, feedback?: string) => void;
  onReject?: (agentName: string, feedback?: string) => void;
  onLike?: (agentName: string, liked: boolean, feedback?: string) => void;
  isApproved?: boolean;
  feedback?: string;
  isLiked?: boolean;
}

export function OutfitAgentCard({ 
  agentName, 
  score, 
  items, 
  details, 
  onApprove, 
  onReject,
  onLike,
  isApproved,
  feedback: existingFeedback,
  isLiked
}: OutfitAgentCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(existingFeedback || "");
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = () => {
    if (!onApprove) return;
    
    setSubmitting(true);
    try {
      onApprove(agentName, feedback);
      toast.success("Outfit approved successfully");
      setShowFeedback(false);
    } catch (error) {
      toast.error("Failed to approve outfit");
      console.error(error);
    }
    setSubmitting(false);
  };

  const handleReject = () => {
    if (!onReject) return;
    
    setSubmitting(true);
    try {
      onReject(agentName, feedback);
      toast.success("Outfit rejected with feedback");
      setShowFeedback(false);
    } catch (error) {
      toast.error("Failed to reject outfit");
      console.error(error);
    }
    setSubmitting(false);
  };

  const handleLike = (liked: boolean) => {
    if (!onLike) return;
    
    setSubmitting(true);
    try {
      onLike(agentName, liked, feedback);
      toast.success(liked ? "Added like to outfit" : "Added dislike to outfit");
    } catch (error) {
      toast.error("Failed to record feedback");
      console.error(error);
    }
    setSubmitting(false);
  };

  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return "outline";
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-50 pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>{agentName}</span>
          <div className="flex items-center gap-2">
            {isApproved !== undefined && (
              <Badge variant={isApproved ? "success" : "destructive"}>
                {isApproved ? "Approved" : "Rejected"}
              </Badge>
            )}
            {isLiked !== undefined && (
              <Badge variant={isLiked ? "success" : "destructive"}>
                {isLiked ? "Liked" : "Disliked"}
              </Badge>
            )}
            {score !== undefined && (
              <Badge variant={getScoreBadgeVariant(score)} className="ml-2">
                Score: {score}
              </Badge>
            )}
          </div>
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
      
      {(onApprove || onReject || onLike) && (
        <CardFooter className="flex flex-col gap-2 pt-2 pb-4">
          {showFeedback ? (
            <div className="w-full space-y-2">
              <Textarea 
                placeholder="Add your feedback for the agent..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFeedback(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={handleApprove}
                  disabled={submitting}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleReject}
                  disabled={submitting}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 w-full justify-end">
              {existingFeedback && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFeedback(true)}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  View Feedback
                </Button>
              )}
              {!isApproved && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFeedback(true)}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Add Feedback
                </Button>
              )}
              {onLike && (
                <>
                  <Button 
                    variant={isLiked === true ? "success" : "outline"}
                    size="sm" 
                    onClick={() => handleLike(true)}
                    disabled={submitting}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    Like
                  </Button>
                  <Button 
                    variant={isLiked === false ? "destructive" : "outline"}
                    size="sm" 
                    onClick={() => handleLike(false)}
                    disabled={submitting}
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                    Dislike
                  </Button>
                </>
              )}
              {isApproved === undefined && onApprove && (
                <>
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={handleApprove}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setShowFeedback(true)}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
