import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Category } from "./StyleFilterButton";

interface CategoryFilterProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

export const CategoryFilter = ({ selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  return (
    <>
      <DropdownMenuLabel>Categories</DropdownMenuLabel>
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {["All", "New", "Casual", "Work", "Party"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category as Category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};