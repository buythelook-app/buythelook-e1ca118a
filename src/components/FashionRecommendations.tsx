import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useFashionItems } from "@/hooks/useFashionItems";
import { FashionItem } from "@/lib/serpApi";

interface FashionRecommendationsProps {
  eventType: string;
  style: string;
  budget: string;
  gender?: 'women' | 'men';
}

export const FashionRecommendations = ({ 
  eventType, 
  style, 
  budget, 
  gender = 'women' 
}: FashionRecommendationsProps) => {
  const { items, loading, error, fetchFashionItems } = useFashionItems();

  useEffect(() => {
    if (eventType && style && budget) {
      fetchFashionItems(eventType, style, budget, gender);
    }
  }, [eventType, style, budget, gender]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'dress': 'bg-pink-100 text-pink-800',
      'top': 'bg-blue-100 text-blue-800',
      'bottom': 'bg-green-100 text-green-800',
      'shoes': 'bg-purple-100 text-purple-800',
      'accessory': 'bg-yellow-100 text-yellow-800',
      'outerwear': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['other'];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Finding Perfect Items...</h2>
          <p className="text-muted-foreground">AI is searching for {eventType} {style} items within your {budget} budget</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => fetchFashionItems(eventType, style, budget, gender)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">No Items Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any items matching your criteria. Try adjusting your preferences.
          </p>
          <Button onClick={() => fetchFashionItems(eventType, style, budget, gender)}>
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Your Perfect Style Match</h2>
        <p className="text-muted-foreground mb-4">
          Curated {eventType} pieces in {style} style for your {budget} budget
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary">{eventType}</Badge>
          <Badge variant="secondary">{style}</Badge>
          <Badge variant="secondary">{budget} budget</Badge>
          <Badge variant="secondary">{gender}</Badge>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FashionItemCard item={item} getCategoryColor={getCategoryColor} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const FashionItemCard = ({ 
  item, 
  getCategoryColor 
}: { 
  item: FashionItem; 
  getCategoryColor: (category: string) => string; 
}) => {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={item.thumbnailUrl} 
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" className="rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full">
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getCategoryColor(item.category)} variant="secondary">
            {item.category}
          </Badge>
          {item.estimatedPrice && (
            <Badge variant="outline" className="font-bold text-green-600">
              {item.estimatedPrice}
            </Badge>
          )}
        </div>
        
        <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        
        <p className="text-xs text-muted-foreground truncate">
          from {item.source}
        </p>
      </CardContent>
    </Card>
  );
};