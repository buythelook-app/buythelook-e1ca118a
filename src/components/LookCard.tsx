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
    <div className="group bg-white rounded-2xl shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-medium)] border border-fashion-border overflow-hidden h-full transition-all duration-300 hover:-translate-y-1">
      <LookImage image={image} title={title} />
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-fashion-accent font-medium mb-2 tracking-wide uppercase">{category}</p>
            <h3 className="text-lg font-medium mb-2 text-fashion-dark leading-tight">{title}</h3>
            <p className="text-lg font-semibold text-fashion-dark">{price}</p>
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