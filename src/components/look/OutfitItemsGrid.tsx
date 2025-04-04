
import { DashboardItem } from "@/types/lookTypes";
import { ItemCard } from "./ItemCard";

interface OutfitItemsGridProps {
  items: DashboardItem[];
  isRefreshing: boolean;
  onAddToCart: (item: DashboardItem) => void;
}

export const OutfitItemsGrid = ({
  items,
  isRefreshing,
  onAddToCart
}: OutfitItemsGridProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {items.map((item) => (
        <ItemCard 
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          price={item.price}
          onAddToCart={() => onAddToCart(item)}
          isRefreshing={isRefreshing}
        />
      ))}
    </div>
  );
};
