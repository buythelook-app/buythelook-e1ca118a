import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  imageUrl: string;
  estimatedPrice: string;
  category?: string;
}

export function ProductCard({ title, imageUrl, estimatedPrice, category }: ProductCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-3">
          <img 
            src={imageUrl || '/placeholder.svg'} 
            alt={title}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary">
              {estimatedPrice}
            </span>
            {category && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {category}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}