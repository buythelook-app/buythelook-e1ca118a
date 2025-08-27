import { ProductCard } from "./ProductCard";

interface ApiItem {
  id: string;
  title: string;
  imageUrl: string;
  estimatedPrice: string;
  category?: string;
}

interface ProductGridProps {
  items: ApiItem[];
  title?: string;
  isLoading?: boolean;
}

export function ProductGrid({ items, title, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-square rounded-md mb-3"></div>
              <div className="bg-muted h-4 rounded mb-2"></div>
              <div className="bg-muted h-4 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {items.length} items
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            estimatedPrice={item.estimatedPrice}
            category={item.category}
          />
        ))}
      </div>
    </div>
  );
}