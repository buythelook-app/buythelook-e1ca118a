
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems } from "@/services/lookService";
import { LookGrid } from "./LookGrid";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GridLook {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items: { id: string; image: string; }[];
}

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: looks, isLoading, error } = useQuery({
    queryKey: ['looks'],
    queryFn: fetchDashboardItems,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (!styleAnalysis) {
      toast({
        title: "No Style Analysis",
        description: "Please complete the style quiz first.",
        variant: "destructive",
      });
      navigate('/quiz');
      return;
    }
  }, [navigate, toast]);

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
        <p className="text-red-500 mb-4">Failed to load suggestions</p>
        <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
      </div>
    );
  }

  const gridLooks: GridLook[] = (looks || []).map(item => ({
    id: item.id,
    image: item.image,
    title: item.name,
    price: item.price || '$99.99',
    category: item.type || 'Fashion',
    items: [{ id: item.id, image: item.image }]
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Style Suggestions</h1>
      {gridLooks.length > 0 ? (
        <LookGrid looks={gridLooks} />
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No suggestions available.</p>
          <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
        </div>
      )}
    </div>
  );
};
