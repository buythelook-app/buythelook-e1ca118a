import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LookGrid } from "./LookGrid";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { transformImageUrl, validateImageUrl } from "@/utils/imageUtils";

interface PreviewItem {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items: { id: string; image: string; }[];
}

const PREVIEW_BASE_URL = 'http://preview--ai-bundle-construct-20.lovable.app';

export const PreviewEnvironment = () => {
  const navigate = useNavigate();

  const { data: previewItems, isLoading, error } = useQuery({
    queryKey: ['previewItems'],
    queryFn: async () => {
      try {
        console.log('Attempting to fetch from:', `${PREVIEW_BASE_URL}/dashboard`);
        const response = await fetch(`${PREVIEW_BASE_URL}/dashboard`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors', // Explicitly request CORS
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        return data;
      } catch (error) {
        console.error('Detailed error:', error);
        throw error;
      }
    },
    retry: 1, // Reduce retries to avoid too many failed attempts
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const processedItems: PreviewItem[] = previewItems?.map((item: any) => ({
    id: item.id || String(Math.random()),
    image: item.image || '/placeholder.svg',
    title: item.name || 'Untitled Item',
    price: item.price || '$99.99',
    category: item.type || 'Fashion',
    items: [{ id: item.id || String(Math.random()), image: item.image || '/placeholder.svg' }]
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the preview environment. This could be because:
            <ul className="list-disc pl-4 mt-2">
              <li>The preview environment is not currently running</li>
              <li>There might be CORS restrictions</li>
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