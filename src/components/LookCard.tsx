import { LookImage } from "./look/LookImage";
import { LookActions } from "./look/LookActions";

interface LookCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items?: Array<{
    id: string;
    image: string;
  }>;
}

export const LookCard = ({ id, image, title, price, category, items = [] }: LookCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <LookImage image={image} title={title} />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-purple-600 font-medium mb-1 tracking-wide uppercase">{category}</p>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">{title}</h3>
            <p className="text-sm text-gray-700 font-medium">{price}</p>
          </div>
          <LookActions
            id={id}
            image={image}
            title={title}
            price={price}
            category={category}
            items={items}
          />
        </div>
      </div>
    </div>
  );
};