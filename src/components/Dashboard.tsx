import { useQuery } from "@tanstack/react-query";
import { fetchDashboardItems } from "@/services/lookService";
import { LookGrid } from "./LookGrid";
import { Loader2 } from "lucide-react";
import { transformImageUrl, validateImageUrl } from "@/utils/imageUtils";

export const Dashboard = () => {
  const { data: dashboardItems, isLoading, error } = useQuery({
    queryKey: ['dashboardItems'],
    queryFn: fetchDashboardItems,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

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
        <p className="text-red-500 mb-4">Failed to load dashboard items</p>
      </div>
    );
  }

  const gridLooks = dashboardItems
    ?.filter(item => {
      const isValid = item && 
        item.image && 
        item.name &&
        validateImageUrl(item.image);
      return isValid;
    })
    .map(item => ({
      id: item.id,
      image: transformImageUrl(item.image),
      title: item.name,
      price: typeof item.price === 'number' ? item.price.toString() : (item.price || '$99.99'),
      category: item.type || 'Fashion',
      items: [{ id: item.id, image: transformImageUrl(item.image) }]
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <LookGrid looks={gridLooks} />
    </div>
  );
};