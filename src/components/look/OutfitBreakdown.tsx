
import { DashboardItem } from "@/types/lookTypes";

interface OutfitBreakdownProps {
  items: DashboardItem[];
  occasion?: string | undefined;
}

export const OutfitBreakdown = ({ items, occasion }: OutfitBreakdownProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-6">
      <h2 className="text-2xl font-bold mb-4">Complete Look Breakdown</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{occasion || "Look"} Components</h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-2">
              <div className="w-12 h-12 bg-white border rounded-md overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{item.type}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
