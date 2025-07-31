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
    <div className="fashion-card rounded-3xl overflow-hidden fashion-hover h-full">
      <div className="relative">
        <LookImage image={image} title={title} />
        <div className="absolute top-4 left-4">
          <span className="bg-fashion-accent/90 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
            {category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-display fashion-text">{title}</h3>
          <p className="text-xl font-bold fashion-text">{price}</p>
        </div>
        <div className="mt-4 flex justify-center">
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