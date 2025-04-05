import { AspectRatio } from "../ui/aspect-ratio";

interface LookImageProps {
  image: string;
  title: string;
}

export const LookImage = ({ image, title }: LookImageProps) => {
  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden">
      <img 
        src={image} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
        onError={(e) => {
          console.error(`Error loading image: ${image}`);
          e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
        }}
      />
    </AspectRatio>
  );
};