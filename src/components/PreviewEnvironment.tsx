import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LookGrid } from "./LookGrid";
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
        const response = await fetch(`${PREVIEW_BASE_URL}/dashboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch preview items');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching preview items:', error);
        throw error;
      }
    },
    retry: 2,
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Failed to load preview items</p>
        <Button onClick={() => navigate('/')}>Go Back</Button>
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