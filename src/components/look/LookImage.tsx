
import { AspectRatio } from "../ui/aspect-ratio";
import { extractZaraImageUrl } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
}

export const LookImage = ({ image, title }: LookImageProps) => {
  // Ensure the image is a string URL
  const imageUrl = typeof image === 'string' ? image : extractZaraImageUrl(image);
  
  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden">
      <img 
        src={imageUrl} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
        onError={(e) => {
          console.error(`Error loading image: ${imageUrl}`);
          e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
        }}
      />
    </AspectRatio>
  );
};
