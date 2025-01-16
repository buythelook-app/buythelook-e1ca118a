import { LookCard } from "./LookCard";

interface LookSectionProps {
  title: string;
  looks: Array<{
    id: string;
    image: string;
    title: string;
    price: string;
    category: string;
  }>;
}

export const LookSection = ({ title, looks }: LookSectionProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-display font-semibold mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {looks.map((look) => (
            <LookCard key={look.id} {...look} />
          ))}
        </div>
      </div>
    </section>
  );
};