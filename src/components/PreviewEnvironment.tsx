import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LookGrid } from "./LookGrid";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { checkHealth, fetchPreviewItems } from "@/services/previewService";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface PreviewItem {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items: { id: string; image: string; }[];
}

export const PreviewEnvironment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Health check query
  const { data: healthStatus } = useQuery({
    queryKey: ['previewHealth'],
    queryFn: checkHealth,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // Items query
  const { data: previewData, isLoading, error } = useQuery({
    queryKey: ['previewItems'],
    queryFn: fetchPreviewItems,
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: healthStatus?.status === 'ok',
  });

  useEffect(() => {
    if (healthStatus?.status === 'error') {
      toast({
        title: "Preview Environment Error",
        description: healthStatus.message || "The preview environment is currently unavailable",
        variant: "destructive",
      });
    }
  }, [healthStatus, toast]);

  const processedItems: PreviewItem[] = previewData?.items?.map((item) => ({
    id: item.id,
    image: item.image,
    title: item.name,
    price: typeof item.price === 'number' 
      ? `$${item.price.toString()}`
      : typeof item.price === 'string' 
        ? item.price 
        : '$99.99',
    category: item.type || 'Fashion',
    items: [{ id: item.id, image: item.image }]
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || healthStatus?.status === 'error') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the preview environment. This could be because:
            <ul className="list-disc pl-4 mt-2">
              <li>The preview environment is not currently running</li>
              <li>There might be network connectivity issues</li>
              <li>The server might be temporarily unavailable</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Preview Environment</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      
      {processedItems.length > 0 ? (
        <LookGrid looks={processedItems} />
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-600">No items available in preview.</p>
        </div>
      )}
    </div>
  );
};